from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import shutil
import paramiko
from dotenv import load_dotenv
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from werkzeug.utils import secure_filename
import logging
import socket

# ตั้งค่า logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app)

# กำหนดโฟลเดอร์ tmp
TMP_FOLDER = os.path.join(os.getcwd(), 'tmp')
# สร้างโฟลเดอร์ tmp หากยังไม่มี
os.makedirs(TMP_FOLDER, exist_ok=True)

# ตั้งค่าจาก environment variables
SFTP_HOST = os.getenv('SFTP_HOST')
SFTP_PORT = int(os.getenv('SFTP_PORT', 22))
SFTP_USERNAME = os.getenv('SFTP_USERNAME')
SFTP_PRIVATE_KEY = os.getenv('SFTP_PRIVATE_KEY')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'default_admin@example.com')
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_PASS = os.getenv('SMTP_PASS')

def send_email(subject, recipient, html_content):
    """
    Send email using the configured SMTP server
    """
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = ADMIN_EMAIL
        msg['To'] = recipient
        msg['Subject'] = subject
        
        # Attach HTML content
        msg.attach(MIMEText(html_content, 'html'))
        
        # Connect to SMTP server and send
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()  # Enable TLS encryption
            server.login(ADMIN_EMAIL, SMTP_PASS)
            server.send_message(msg)
            
        return True, "Email sent successfully"
    except Exception as e:
        app.logger.error(f"Email sending failed: {e}")
        return False, str(e)

def save_to_tmp_folder(file):
    """
    บันทึกไฟล์ที่อัปโหลดลงใน tmp folder
    
    Args:
        file: ไฟล์ที่อัปโหลด
        
    Returns:
        tuple: (success, message, local_path)
    """
    try:
        # สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = secure_filename(file.filename)
        unique_filename = f"{timestamp}_{filename}"
        
        # กำหนด path สำหรับบันทึกไฟล์
        local_path = os.path.join(TMP_FOLDER, unique_filename)
        
        # บันทึกไฟล์
        file.save(local_path)
        
        # ตรวจสอบว่าไฟล์ถูกบันทึกสำเร็จหรือไม่
        if os.path.exists(local_path):
            file_size = os.path.getsize(local_path)
            app.logger.info(f"File saved to temporary location: {local_path}, Size: {file_size} bytes")
            return True, f"File saved to temporary location", local_path
        else:
            app.logger.error(f"Failed to save file to {local_path}")
            return False, "Failed to save file", None
            
    except Exception as e:
        app.logger.exception(f"Error saving file to tmp folder: {e}")
        return False, str(e), None

def upload_to_lanta(local_path, remote_path, update_info_json=True):
    """
    อัปโหลดไฟล์จาก tmp folder ไปยัง LANTA HPC
    
    Args:
        local_path: path ของไฟล์ใน tmp folder
        remote_path: path ปลายทางบน LANTA
        update_info_json: อัปเดต dataset_info.json หรือไม่
        
    Returns:
        tuple: (success, message)
    """
    transport = None
    sftp = None

    try:
        # ตรวจสอบว่าไฟล์มีอยู่จริง
        if not os.path.exists(local_path):
            return False, f"File not found: {local_path}"
            
        # เชื่อมต่อกับ SFTP
        key = paramiko.RSAKey.from_private_key_file(SFTP_PRIVATE_KEY)
        transport = paramiko.Transport((SFTP_HOST, SFTP_PORT))
        transport.connect(username=SFTP_USERNAME, pkey=key)
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        # อัปโหลดไฟล์
        sftp.put(local_path, remote_path)
        app.logger.info(f"File uploaded to LANTA: {remote_path}")
        
        # อัปเดต dataset_info.json หากต้องการ
        if update_info_json:
            info_path = '/project/cb900907-hpctgn/LLaMA-Factory/data/dataset_info.json'
            
            # ดึงชื่อไฟล์ดั้งเดิม (ไม่รวม timestamp)
            original_filename = os.path.basename(remote_path)
            # ดึงชื่อไฟล์ไม่รวมนามสกุล เพื่อใช้เป็น key
            base_name = os.path.splitext(original_filename)[0]
            
            try:
                # อ่านไฟล์ JSON เดิม (ถ้ามี)
                try:
                    with sftp.open(info_path, 'r') as f:
                        existing_data = json.load(f)
                except IOError:
                    existing_data = {}
                
                # เพิ่มข้อมูลไฟล์ใหม่ในรูปแบบที่เรียบง่าย
                existing_data[base_name] = {
                    "file_name": original_filename
                }
                
                # บันทึกข้อมูลกลับไป
                with sftp.open(info_path, 'w') as f:
                    f.write(json.dumps(existing_data, indent=2))
                    
                app.logger.info(f"Updated dataset_info.json with new file: {base_name}")
                
            except Exception as e:
                app.logger.error(f"Error updating dataset_info.json: {e}")
                # ไม่ถือว่าเป็นข้อผิดพลาดหลัก เพราะไฟล์อัปโหลดสำเร็จแล้ว
                
        return True, "File uploaded successfully"
        
    except Exception as e:
        app.logger.exception(f"Error uploading file to LANTA: {e}")
        return False, str(e)
        
    finally:
        # ปิดการเชื่อมต่อ
        if sftp:
            sftp.close()
        if transport:
            transport.close()

def cleanup_file(file_path):
    """
    ลบไฟล์ออกจาก tmp folder
    
    Args:
        file_path: path ของไฟล์ที่จะลบ
        
    Returns:
        bool: สำเร็จหรือไม่
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            app.logger.info(f"Removed temporary file: {file_path}")
            return True
        return False
    except Exception as e:
        app.logger.error(f"Error removing file {file_path}: {e}")
        return False

@app.route('/AutomateFineTune', methods=['POST'])
def automate_finetune():
    """
    รับไฟล์, บันทึกใน tmp folder, อัปโหลดไปยัง LANTA และลบไฟล์ใน tmp folder
    """
    try:
        # ตรวจสอบว่ามีไฟล์หรือไม่
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in request'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        # เก็บข้อมูลพารามิเตอร์
        model = request.form.get('model', '')
        tuning = request.form.get('tuning', 'full')
        learning_rate = request.form.get('learningRate', '0.001')
        epoch = request.form.get('epoch', '10')
        
        # บันทึกไฟล์ลงใน tmp folder
        save_success, save_message, local_path = save_to_tmp_folder(file)
        
        if not save_success:
            return jsonify({'error': f'Failed to save file: {save_message}'}), 500
            
        # อัปโหลดไฟล์ไปยัง LANTA
        remote_path = f'/project/cb900907-hpctgn/LLaMA-Factory/data/{os.path.basename(local_path)}'
        upload_success, upload_message = upload_to_lanta(local_path, remote_path, update_info_json=True)
        
        # ลบไฟล์จาก tmp folder ไม่ว่าการอัปโหลดจะสำเร็จหรือไม่
        cleanup_success = cleanup_file(local_path)
        
        if not upload_success:
            return jsonify({'error': f'Failed to upload to LANTA: {upload_message}'}), 500
            
        # ถ้าทุกอย่างสำเร็จ
        return jsonify({
            'success': True,
            'message': 'File uploaded successfully and temporary file cleaned up',
            'cleanup_success': cleanup_success,
            'details': {
                'model': model,
                'tuning': tuning,
                'learning_rate': learning_rate,
                'epoch': epoch
            }
        }), 200
            
    except Exception as e:
        app.logger.exception(f"Unexpected error in automate_finetune: {e}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/ManualFineTune', methods=['POST'])
def manual_finetune():
    """
    ทำงานเหมือนกับ automate_finetune
    """
    return automate_finetune()


def find_free_port(start=7800, end=7899):
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("", port))
                return port
            except OSError:
                continue
    raise RuntimeError("No available port found in the specified range.")

@app.route('/UploadJobScript', methods=['POST'])
def upload_job_script():
    """
    สร้างและอัปโหลด job script ไปยัง LANTA
    """
    transport = None
    sftp = None
    ssh = None
    local_path = None
    port = find_free_port()  # หาพอร์ตที่ว่าง

    try:
        memory = request.form.get('memory', default='16')
        gpus = request.form.get('gpus', default='1')
        time = request.form.get('time', default='00:30:00')
        nodes = request.form.get('nodes', default='1')
        ntasks = int(gpus) * 4
        

        # สร้างโฟลเดอร์ tmp ถ้ายังไม่มี
        os.makedirs(TMP_FOLDER, exist_ok=True)

        script = f"""#!/bin/bash
#SBATCH --job-name=llama_webui
#SBATCH --partition=gpu
#SBATCH -N {nodes}
#SBATCH --ntasks-per-node={ntasks}
#SBATCH --mem={memory}G
#SBATCH --gres=gpu:{gpus}
#SBATCH --time={time}
#SBATCH -A cb900907
#SBATCH --output=llama_webui_{datetime.now().strftime('%Y%m%d_%H%M')}.log

unset PYTHONHOME
unset PYTHONPATH

module load Mamba
module load cudatoolkit
conda activate /project/cb900907-hpctgn/envs/llama-factory/

export PORT={port}
export NODE=$(hostname)
USER=$(whoami)
node=$(hostname -s)

echo -e "
    🚀 LLaMA Factory Web UI is running on: $(hostname)
    Job starts at: $(date)
    --------------------------------------------------------------------
    ssh -L 0.0.0.0:{port}:$node:{port} $USER@lanta.nstda.or.th
    --------------------------------------------------------------------
"

cd /project/cb900907-hpctgn/LLaMA-Factory
llamafactory-cli webui
"""
        filename = f"llama_job_{datetime.now().strftime('%Y%m%d_%H%M')}.sh"
        local_path = os.path.join(TMP_FOLDER, filename)
        with open(local_path, "w", encoding="utf-8", newline='\n') as f:
            f.write(script)

        # Setup SSH and SFTP
        key = paramiko.RSAKey.from_private_key_file(SFTP_PRIVATE_KEY)

        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect("lanta.nstda.or.th", username="trochana", pkey=key)

        transport = paramiko.Transport((SFTP_HOST, SFTP_PORT))
        transport.connect(username=SFTP_USERNAME, pkey=key)
        sftp = paramiko.SFTPClient.from_transport(transport)

        # Upload job script
        remote_script_path = f"/project/cb900907-hpctgn/tanathep/thesis/scripts/{filename}"
        sftp.put(local_path, remote_script_path)

        # Set permission
        ssh.exec_command(f"chmod 755 {remote_script_path}")
        
        # ลบไฟล์จาก tmp folder
        cleanup_file(local_path)

        # ส่งคืน path ของ script ที่อัปโหลดไป
        return jsonify({
            'message': 'Job script uploaded successfully',
            'scriptPath': remote_script_path  # ส่งคืน path ของ script
        }), 200

    except Exception as e:
        app.logger.exception(f"Job script upload failed: {e}")
        return jsonify({'error': str(e)}), 500

    finally:
        try:
            if sftp:
                sftp.close()
            if transport:
                transport.close()
            if ssh:
                ssh.close()
            if local_path and os.path.exists(local_path):
                cleanup_file(local_path)
        except Exception as close_err:
            app.logger.error(f"Error closing connections: {close_err}")

# API endpoint สำหรับขอเพิ่มโมเดล
@app.route('/api/request-model', methods=['POST'])
def request_model():
    try:
        data = request.json
        model_name = data.get('modelName')
        reason = data.get('reason')
        user_info = data.get('userInfo', {})
        user_email = user_info.get('email', 'ไม่ระบุ')
        
        # ข้อมูลเพิ่มเติม (ถ้ามี)
        username = user_info.get('username', 'ไม่ระบุ')
        department = user_info.get('department', 'ไม่ระบุ')
        
        # สร้างรหัสคำขอและลงเวลา
        request_id = f"REQ{datetime.now().strftime('%Y%m%d%H%M%S')}"
        request_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # สร้างเนื้อหาอีเมลแจ้งเตือนผู้ดูแลระบบ
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #3949ab; border-bottom: 2px solid #3949ab; padding-bottom: 10px;">คำขอเพิ่มโมเดลใหม่ในระบบ LANTA HPC</h2>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>รหัสคำขอ:</strong> {request_id}</p>
                    <p><strong>วันที่:</strong> {request_timestamp}</p>
                </div>
                
                <h3 style="color: #424242;">รายละเอียดคำขอ</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>ชื่อโมเดล:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">{model_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>เหตุผล:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">{reason}</td>
                    </tr>
                </table>
                
                <h3 style="color: #424242;">ข้อมูลผู้ขอ</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>อีเมล:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">{user_email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>ชื่อผู้ใช้:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">{username}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>หน่วยงาน:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">{department}</td>
                    </tr>
                </table>
                
                <div style="background-color: #fff8e1; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;">กรุณาติดต่อกลับผู้ขอภายใน 24 ชั่วโมง เพื่อแจ้งผลการพิจารณาหรือสอบถามข้อมูลเพิ่มเติม</p>
                </div>
                
                <p style="color: #757575; font-size: 12px; text-align: center; margin-top: 30px;">
                    อีเมลฉบับนี้ถูกส่งโดยระบบอัตโนมัติจาก LANTA HPC Model Fine-tuning Platform
                </p>
            </div>
        </body>
        </html>
        """
        
        # ส่งอีเมลไปยังผู้ดูแลระบบ
        subject = f"[LANTA HPC] คำขอเพิ่มโมเดลใหม่: {model_name}"
        success, message = send_email(subject, ADMIN_EMAIL, html_content)
        
        if success:
            # ถ้าส่งอีเมลสำเร็จ ตอบกลับไปยัง frontend
            return jsonify({
                'success': True,
                'message': 'คำขอถูกส่งเรียบร้อยแล้ว',
                'request_id': request_id
            }), 200
        else:
            # ถ้าส่งอีเมลไม่สำเร็จ
            return jsonify({
                'success': False,
                'message': f'เกิดข้อผิดพลาดในการส่งคำขอ: {message}'
            }), 500
        
    except Exception as e:
        app.logger.exception(f"Error processing model request: {e}")
        return jsonify({
            'success': False,
            'message': f'เกิดข้อผิดพลาด: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
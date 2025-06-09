import { useState, useEffect } from 'react';
import { Database, Check, Settings, Upload, InfoIcon, ChevronDown, PlusCircle } from 'lucide-react';

const AutomateFineTune = () => {
  const [model, setModel] = useState('');
  const [dataset, setDataset] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [learningRate, setLearningRate] = useState('0.001');
  const [epoch, setEpoch] = useState('10');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestModelName, setRequestModelName] = useState('');

  // ติดตามความคืบหน้าของการกรอกข้อมูล
  useEffect(() => {
    if (model && dataset) {
      setHasInteracted(true);
    }
  }, [model, dataset]);

  // จัดการกับการเปลี่ยนแปลงโมเดล
  const handleModelChange = (event) => {
    const selectedModel = event.target.value;
    setModel(selectedModel);

    // ปรับ epoch ตามขนาดโมเดล
    if (selectedModel.includes('llama-3-8b') || selectedModel.includes('llama-3-70b')) {
      if (parseInt(epoch) < 10) setEpoch('10');
    }
  };

  // ปรับปรุงฟังก์ชัน handleDatasetUpload ให้ตรวจสอบทั้งนามสกุลและความถูกต้องของ JSON
  const handleDatasetUpload = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      console.error("No file selected");
      return;
    }

    const file = event.target.files[0];
    console.log("File selected:", file);

    // ตรวจสอบนามสกุลไฟล์ที่เข้มงวดมากขึ้น
    if (!file.name.toLowerCase().endsWith('.json')) {
      showNotification('กรุณาอัปโหลดเฉพาะไฟล์ .json เท่านั้น', 'error');
      return;
    }

    // ตรวจสอบไฟล์ MIME type (อาจไม่น่าเชื่อถือเสมอไป แต่เป็นการตรวจสอบเพิ่มเติม)
    if (file.type && file.type !== 'application/json' && file.type !== '') {
      showNotification('กรุณาอัปโหลดเฉพาะไฟล์ JSON เท่านั้น', 'error');
      return;
    }

    // ตรวจสอบขนาดไฟล์
    if (file.size > 50 * 1024 * 1024) {
      showNotification('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 50MB)', 'error');
      return;
    }

    // ตรวจสอบความถูกต้องของไฟล์ JSON
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // ทดลอง parse เป็น JSON เพื่อยืนยันว่าเป็นไฟล์ JSON ที่ถูกต้อง
        JSON.parse(e.target.result);

        // ถ้าผ่านการ parse แสดงว่าเป็น JSON ที่ถูกต้อง
        setDataset({ name: file.name, size: file.size });
        showNotification('อัปโหลดไฟล์ JSON สำเร็จ', 'info');
        playSuccessSound();
      } catch (error) {
        console.error("Invalid JSON file:", error);
        setDataset(null); // รีเซ็ตสถานะหากไฟล์ไม่ถูกต้อง
        showNotification('ไฟล์ไม่ใช่ JSON ที่ถูกต้อง กรุณาตรวจสอบรูปแบบไฟล์', 'error');
      }
    };

    reader.onerror = () => {
      showNotification('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error');
    };

    reader.readAsText(file);
  };

  // จัดการกับการลากและวางไฟล์
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // ปรับปรุงฟังก์ชัน handleDrop ให้ตรวจสอบทั้งนามสกุลและความถูกต้องของ JSON
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      console.error("No file dropped");
      return;
    }

    const file = e.dataTransfer.files[0];
    console.log("File dropped:", file);

    // ตรวจสอบนามสกุลไฟล์
    if (!file.name.toLowerCase().endsWith('.json')) {
      showNotification('กรุณาอัปโหลดเฉพาะไฟล์ .json เท่านั้น', 'error');
      return;
    }

    // ตรวจสอบขนาดไฟล์
    if (file.size > 50 * 1024 * 1024) {
      showNotification('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 50MB)', 'error');
      return;
    }

    // ตรวจสอบความถูกต้องของไฟล์ JSON
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        JSON.parse(e.target.result);
        setDataset({ name: file.name, size: file.size });
        showNotification('อัปโหลดไฟล์ JSON สำเร็จ', 'info');
        playSuccessSound();
      } catch (error) {
        console.error("Invalid JSON file:", error);
        setDataset(null);
        showNotification('ไฟล์ไม่ใช่ JSON ที่ถูกต้อง กรุณาตรวจสอบรูปแบบไฟล์', 'error');
      }
    };

    reader.onerror = () => {
      showNotification('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error');
    };

    reader.readAsText(file);
  };

  // เล่นเสียงเมื่ออัปโหลดสำเร็จ
  const playSuccessSound = () => {
    try {
      // ถ้าไม่ต้องการใช้เสียง ให้ comment บรรทัดด้านล่างแล้วใช้บรรทัดที่ comment ไว้แทน
      // console.log('Success sound would play here');
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => {
        console.log('ไม่สามารถเล่นเสียงได้:', err);
      });
    } catch (e) {
      console.log('เบราว์เซอร์ไม่สนับสนุนการเล่นเสียง', e);
    }
  };

  // แสดงการแจ้งเตือน
  const showNotification = (message, type = 'info') => {
    const notifEl = document.createElement('div');
    notifEl.className = `fixed bottom-4 right-4 px-5 py-3 rounded-lg shadow-xl z-50 transition-opacity duration-300 flex items-center ${type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-600' :
      'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
      }`;

    const icon = document.createElement('div');
    icon.className = 'mr-3';
    icon.innerHTML = type === 'error'
      ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" fill="currentColor"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM14.7071 8.70711C15.0976 8.31658 15.0976 7.68342 14.7071 7.29289C14.3166 6.90237 13.6834 6.90237 13.2929 7.29289L9 11.5858L6.70711 9.29289C6.31658 8.90237 5.68342 8.90237 5.29289 9.29289C4.90237 9.68342 4.90237 10.3166 5.29289 10.7071L8.29289 13.7071C8.68342 14.0976 9.31658 14.0976 9.70711 13.7071L14.7071 8.70711Z" fill="currentColor"/></svg>';

    notifEl.appendChild(icon);
    notifEl.innerHTML += message;
    document.body.appendChild(notifEl);

    setTimeout(() => {
      notifEl.style.opacity = "0";
      setTimeout(() => document.body.removeChild(notifEl), 300);
    }, 3000);
  };

  // คำนวณขนาดไฟล์
  const getFileSize = (size) => {
    if (!size && size !== 0) return "0 B";

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // แสดงชื่อโมเดล
  const getModelLabel = () => {
    if (model === 'llama-3-8b') return 'Llama 3 (8B)';
    if (model === 'llama-3-70b') return 'Llama 3.1 (70B)';
    return '';
  };

  // คำนวณทรัพยากรที่ใช้ (เฉพาะ LoRA)
  const getResourceEstimation = () => {
    if (!model) return null;

    let gpus = 1;
    let memory = 16;
    let node = 1;

    if (model === 'llama-3-8b') {
      memory = 16;
      gpus = 1;
      node = 1;
    } else if (model.includes('llama-3-70b')) {
      gpus = 4;
      memory = 64;
      node = 2;
    }

    return { gpus, memory, node };
  };

  // อัปโหลดไปยัง HPC
  const uploadToHPC = async () => {
    if (!dataset) {
      showNotification('กรุณาเลือกไฟล์ก่อน', 'error');
      return;
    }

    if (!model) {
      showNotification('กรุณาเลือกโมเดลก่อน', 'error');
      return;
    }

    setIsLoading(true);

    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files?.[0];
    if (!file) {
      showNotification('ไม่พบไฟล์ที่อัปโหลด กรุณาลองใหม่อีกครั้ง', 'error');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);
    formData.append('tuning', 'lora'); // เฉพาะ LoRA
    formData.append('learningRate', learningRate);
    formData.append('epoch', epoch);

    try {
      // จำลองการโหลด
      setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:5000/AutomateFineTune', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Upload failed');

          // แสดงข้อความสำเร็จ
          showNotification('เริ่มกระบวนการปรับแต่งโมเดลแล้ว คุณสามารถติดตามผลได้ในภายหลัง', 'info');
        } catch (error) {
          console.error('Upload error:', error);
          showNotification('ไม่สามารถอัปโหลดไฟล์ไปยัง LANTA HPC ได้', 'error');
          setIsLoading(false);
        }
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('ไม่สามารถอัปโหลดไฟล์ไปยัง LANTA HPC ได้', 'error');
      setIsLoading(false);
    }
  };

  // ส่งคำขอโมเดลใหม่
  const handleModelRequest = async () => {
    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!requestModelName.trim()) {
      showNotification('กรุณาระบุชื่อโมเดลที่ต้องการ', 'error');
      return;
    }

    if (!requestReason.trim()) {
      showNotification('กรุณาระบุเหตุผลที่ต้องการใช้โมเดลนี้', 'error');
      return;
    }

    // แสดงสถานะกำลังส่งคำขอ
    setIsLoading(true);

    try {
      // สร้าง payload สำหรับส่งไปยัง API
      const payload = {
        modelName: requestModelName,
        reason: requestReason,
        userInfo: {
          // คุณสามารถดึงข้อมูลเหล่านี้จากระบบ authentication หากมี
          email: 'user@example.com', // หรือดึงจากระบบ authentication
          username: 'Username', // หรือดึงจากระบบ authentication
          department: 'Department' // หรือดึงจากระบบ authentication
        }
      };

      // ส่งข้อมูลไปยัง API
      const response = await fetch('http://localhost:5000/api/request-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send model request');
      }

      // หากสำเร็จ
      showNotification(`ส่งคำขอโมเดล ${requestModelName} เรียบร้อยแล้ว`, 'info');
      setShowRequestModal(false);

      // รีเซ็ตฟอร์ม
      setRequestModelName('');
      setRequestReason('');
    } catch (error) {
      console.error('Request error:', error);
      showNotification('ไม่สามารถส่งคำขอได้ กรุณาลองใหม่ภายหลัง', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // สุ่มเคล็ดลับสำหรับผู้ใช้
  const getRandomTip = () => {
    const tips = [
      "เคล็ดลับ: LoRA ช่วยประหยัดทรัพยากรและเวลาประมวลผลได้อย่างมาก เหมาะสำหรับโมเดลขนาดใหญ่",
      "คำแนะนำ: การเพิ่มจำนวน Epoch ทำให้โมเดลเรียนรู้ลึกซึ้งขึ้น แต่อย่าลืมระวังการ Overfitting",
      "เคล็ดลับ: ข้อมูลที่มีคุณภาพสูงจะให้ผลลัพธ์ที่ดีกว่าข้อมูลปริมาณมากที่มีความซ้ำซ้อน",
      "เกร็ดความรู้: การปรับ Learning Rate ให้ต่ำลงจะช่วยเพิ่มความแม่นยำในการ Fine-tune"
    ];
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  };

  const resources = getResourceEstimation();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-gray-50 min-h-screen">
      {/* แถบเคล็ดลับ */}
      <div className="mb-5 bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200 flex items-start shadow-sm">
        <div className="bg-amber-200 text-amber-700 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-amber-800 text-sm">{getRandomTip()}</p>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100 transition-all hover:shadow-md">
        {/* ส่วนหัว */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 px-8 py-7">
            {/* ลวดลายพื้นหลัง */}
            <div className="absolute right-0 top-0 opacity-20">
              <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                <path d="M0 90L45 135L90 90L135 135L180 90L135 45L180 0L135 -45L90 0L45 -45L0 0L45 45L0 90Z" fill="white" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center relative z-10">
              <Database className="mr-3" size={28} />
              ปรับแต่งโมเดลภาษาขนาดใหญ่ด้วย LoRA
            </h2>
            <p className="text-indigo-100 mt-2 relative z-10 text-lg">
              สร้างโมเดลที่เข้าใจบริบทภาษาไทยด้วยเทคนิค LoRA ที่รวดเร็วและประหยัดทรัพยากร
            </p>
          </div>
        </div>

        {/* เนื้อหาหลัก */}
        <div className="p-8">
          {/* ตัวแสดงขั้นตอน */}
          <div className="flex mb-8 relative">
            <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 -z-10"></div>

            <div className="flex-1 text-center">
              <div
                className={`w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center transition-all duration-300 ${model ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'bg-white border-indigo-300 text-indigo-500'
                  }`}
                onMouseEnter={() => setShowTooltip('model')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                1
                {showTooltip === 'model' && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    เลือกโมเดลที่ต้องการปรับแต่ง
                  </div>
                )}
              </div>
              <div className={`mt-2 text-sm font-medium ${model ? 'text-indigo-600' : 'text-gray-500'}`}>เลือกโมเดล</div>
            </div>

            <div className="flex-1 text-center">
              <div
                className={`w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center transition-all duration-300 ${dataset ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'bg-white border-indigo-300 text-indigo-500'
                  }`}
                onMouseEnter={() => setShowTooltip('dataset')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                2
                {showTooltip === 'dataset' && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    อัปโหลดไฟล์ข้อมูลสำหรับปรับแต่ง
                  </div>
                )}
              </div>
              <div className={`mt-2 text-sm font-medium ${dataset ? 'text-indigo-600' : 'text-gray-500'}`}>อัปโหลดข้อมูล</div>
            </div>

            <div className="flex-1 text-center">
              <div
                className={`w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center transition-all duration-300 ${(model && dataset && hasInteracted) ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'bg-white border-indigo-300 text-indigo-500'
                  }`}
                onMouseEnter={() => setShowTooltip('config')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                3
                {showTooltip === 'config' && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    กำหนดค่าพารามิเตอร์
                  </div>
                )}
              </div>
              <div className={`mt-2 text-sm font-medium ${(model && dataset && hasInteracted) ? 'text-indigo-600' : 'text-gray-500'}`}>ตั้งค่า</div>
            </div>

            <div className="flex-1 text-center">
              <div
                className={`w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isLoading ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'bg-white border-indigo-300 text-indigo-500'
                  }`}
                onMouseEnter={() => setShowTooltip('process')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                4
                {showTooltip === 'process' && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    เริ่มกระบวนการปรับแต่งบน HPC
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-500">เริ่มประมวลผล</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* คอลัมน์ซ้าย */}
            <div className="space-y-6">
              {/* เลือกโมเดล */}
              <div className="space-y-3 p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-all shadow-sm hover:shadow">
                <label className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium text-lg flex items-center">
                    <Database className="mr-2 text-indigo-600" size={20} />
                    เลือกโมเดลภาษา (LLM)
                  </span>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="text-indigo-600 text-sm font-medium flex items-center hover:text-indigo-800 transition-colors px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100"
                  >
                    <PlusCircle size={16} className="mr-1.5" />
                    ขอเพิ่มโมเดล
                  </button>
                </label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={handleModelChange}
                    className={`w-full p-3.5 pl-4 pr-10 border rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 appearance-none ${model ? 'border-indigo-300 bg-indigo-50 shadow-inner' : 'border-gray-300 hover:border-indigo-300'
                      }`}
                    required
                  >
                    <option value="">-- กรุณาเลือกโมเดล --</option>
                    <optgroup label="Llama">
                      <option value="llama-3-8b">Llama 3 - 8B</option>
                      <option value="llama-3-70b">Llama 3 - 70B</option>
                    </optgroup>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className={`text-indigo-600 transition-transform ${model ? 'rotate-180' : ''}`} size={20} />
                  </div>
                </div>

                {model && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-700 rounded-r-md animate-fadeIn">
                    <div className="flex items-start">
                      <InfoIcon className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <div>
                        <p className="font-medium">{getModelLabel()}</p>
                        <p className="mt-1 opacity-90">
                          {model === 'llama-3-8b' && 'โมเดลรุ่น 3 เหมาะสำหรับงานที่ไม่ต้องการความซับซ้อนมาก ใช้ทรัพยากรน้อย'}
                          {model === 'llama-3-70b' && 'โมเดลขนาดใหญ่ที่มีความสามารถสูง เหมาะสำหรับงานที่ซับซ้อน'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* อัปโหลดชุดข้อมูล */}
              <div className="space-y-3 p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-all shadow-sm hover:shadow">
                <label className="flex items-center text-gray-700 font-medium text-lg">
                  <Upload className="mr-2 text-indigo-600" size={20} />
                  อัปโหลดชุดข้อมูล (เฉพาะไฟล์ JSON)
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${isDragging ? 'bg-indigo-50 border-indigo-400 scale-[1.01]' :
                    dataset ? 'bg-green-50 border-green-400' : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50'
                    } cursor-pointer`}
                  onClick={() => document.getElementById('file-upload')?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleDatasetUpload}
                    className="hidden"
                    accept=".json,application/json"
                  />
                  <div className="flex flex-col items-center space-y-3">
                    {dataset && dataset.name ? (
                      <>
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <Check size={24} />
                        </div>
                        <p className="text-lg font-medium text-green-800">{dataset.name}</p>
                        <div className="flex items-center space-x-4">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {getFileSize(dataset.size)}
                          </span>
                          <button
                            className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDataset(null);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            ลบไฟล์
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-1 relative overflow-hidden group-hover:bg-indigo-200 transition-colors">
                          <div className={`absolute inset-0 ${isDragging ? 'animate-pulse-light bg-indigo-200/50' : ''}`}></div>
                          <Upload size={28} className={isDragging ? 'animate-bounce-slow' : ''} />
                        </div>
                        <p className="text-lg font-medium text-gray-800">
                          {isDragging ? 'วางไฟล์ JSON ตรงนี้' : 'ลากไฟล์มาวางหรือคลิกเพื่อเลือก'}
                        </p>
                        <p className="text-sm text-gray-500">รองรับเฉพาะไฟล์ JSON (.json) เท่านั้น (สูงสุด 50MB)</p>

                        <div className="text-xs text-gray-400 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>ไฟล์ต้องเป็น JSON ที่มีโครงสร้างถูกต้องสำหรับการ Fine-tune</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* เพิ่มการแสดงข้อมูลสถานะการอัปโหลด - จะช่วยดีบัก */}
                <div className="mt-2 text-xs">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${dataset ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className={`${dataset ? 'text-green-800' : 'text-gray-500'}`}>
                      สถานะ: {dataset ? 'อัปโหลดแล้ว' : 'รอการอัปโหลด'}
                    </span>
                  </div>
                  {dataset && (
                    <div className="mt-1 bg-gray-50 p-2 rounded text-gray-700">
                      <div><strong>ชื่อไฟล์:</strong> {dataset.name}</div>
                      <div><strong>ขนาด:</strong> {getFileSize(dataset.size)}</div>
                      <div><strong>ประเภทไฟล์:</strong> JSON</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* คอลัมน์ขวา */}
            <div className="space-y-6">
              {/* เลือกวิธีการปรับแต่ง - LoRA Only */}
              <div className="space-y-3 p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-all shadow-sm hover:shadow">
                <div className="flex justify-between items-center">
                  <label className="flex items-center text-gray-700 font-medium text-lg">
                    <Settings className="mr-2 text-indigo-600" size={20} />
                    วิธีการปรับแต่งโมเดล
                  </label>
                  <div className="text-sm text-green-700 px-3 py-1 bg-green-50 rounded-full font-medium border border-green-100 shadow-sm">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      LoRA เท่านั้น
                    </div>
                  </div>
                </div>

                <div className="border border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300 shadow-md rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-5 w-5 bg-indigo-600 border-indigo-600 rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                    <div className="bg-green-100 rounded-md h-6 w-10 flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">แนะนำ</span>
                    </div>
                  </div>
                  <h3 className="font-medium mb-1">LoRA (Low-Rank Adaptation)</h3>
                  <p className="text-xs text-gray-600">ปรับเฉพาะบางส่วนของโมเดล เร็วกว่าและใช้ทรัพยากรน้อยกว่า เหมาะกับโมเดลขนาดใหญ่</p>

                  {resources && (
                    <div className="mt-3 pt-3 border-t border-indigo-200 text-xs">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-gray-600">การ์ดจอ (GPU):</span>
                        <span className="font-medium text-gray-800">{resources.gpus} การ์ด</span>
                      </div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-gray-600">โหนด (Node):</span>
                        <span className="font-medium text-gray-800">{resources.node} โหนด</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">หน่วยความจำ:</span>
                        <span className="font-medium text-gray-800">{resources.memory}GB</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ตั้งค่าขั้นสูง */}
              <div className="p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-all shadow-sm hover:shadow">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-indigo-600 font-medium text-sm flex items-center hover:text-indigo-800 w-full justify-between"
                >
                  <span className="flex items-center">
                    <ChevronDown className={`mr-1 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} size={16} />
                    {showAdvanced ? 'ซ่อนการตั้งค่าขั้นสูง' : 'แสดงการตั้งค่าขั้นสูง'}
                  </span>

                  <span className="text-xs bg-indigo-50 px-2 py-1 rounded-full text-indigo-700">
                    สำหรับผู้เชี่ยวชาญ
                  </span>
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-5 border-t pt-4 border-gray-200 animate-fadeIn">
                    {/* Learning Rate */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-gray-700 font-medium">อัตราการเรียนรู้ (Learning Rate)</label>
                        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 rounded">{learningRate}</span>
                      </div>
                      <input
                        type="range"
                        min="-5"
                        max="-1"
                        step="1"
                        value={Math.log10(parseFloat(learningRate))}
                        onChange={(e) => setLearningRate(Math.pow(10, parseInt(e.target.value)).toString())}
                        className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                        <span>ช้า/แม่นยำ (0.00001)</span>
                        <span>เร็ว/ทั่วไป (0.1)</span>
                      </div>
                    </div>

                    {/* Epoch */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-gray-700 font-medium">จำนวนรอบการฝึกฝน (Epoch)</label>
                        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 rounded">{epoch} รอบ</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEpoch(Math.max(1, parseInt(epoch) - 1).toString())}
                          className="border h-8 w-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={epoch}
                          min="1"
                          max="50"
                          onChange={(e) => setEpoch(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-center"
                        />
                        <button
                          onClick={() => setEpoch((parseInt(epoch) + 1).toString())}
                          className="border h-8 w-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1.5 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>
                            ค่าแนะนำ: 10-15 รอบสำหรับ LoRA จำนวนรอบมากเกินไปอาจทำให้เกิด Overfitting
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ปุ่มเริ่มประมวลผล */}
          <div className="mt-8 flex justify-center">
            <button
              disabled={!model || !dataset || isLoading}
              onClick={uploadToHPC}
              className={`px-6 py-3.5 text-white font-medium rounded-lg flex items-center text-lg shadow-lg transition-all ${model && dataset && !isLoading
                ? 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 hover:scale-[1.02] hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed opacity-70'
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="relative">
                    กำลังเริ่มการประมวลผล...
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white/30 animate-progress-indeterminate"></span>
                  </span>
                </>
              ) : (
                <>
                  <Settings className="mr-2" size={20} />
                  เริ่มปรับแต่งโมเดลภาษา
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* โมดัลสำหรับขอโมเดลใหม่ */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <PlusCircle className="mr-2 text-indigo-600" size={20} />
              ขอเพิ่มโมเดลใหม่
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อโมเดลที่ต้องการ
                </label>
                <input
                  type="text"
                  value={requestModelName}
                  onChange={(e) => setRequestModelName(e.target.value)}
                  placeholder="เช่น Llama 3.1 70B หรือ Mistral-7B"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เหตุผลที่ต้องการใช้โมเดลนี้
                </label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="อธิบายเหตุผลที่ต้องการใช้โมเดลนี้และงานที่จะนำไปใช้"
                  rows={4}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-sm text-amber-700 rounded-r-md">
                <div className="flex items-start">
                  <InfoIcon className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p>โปรดระบุเหตุผลความจำเป็นในการใช้งานอย่างละเอียด ทีมงานจะพิจารณาคำขอและเพิ่มโมเดลภายใน 1-3 วัน</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleModelRequest}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'กำลังส่ง...' : 'ส่งคำขอ'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* เพิ่ม CSS animations */}
      <style jsx>{`
      @keyframes pulse-light {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes bounce-slow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes progress-indeterminate {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-pulse-light {
        animation: pulse-light 2s infinite ease-in-out;
      }
      .animate-bounce-slow {
        animation: bounce-slow 2s infinite ease-in-out;
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }
      .animate-progress-indeterminate {
        animation: progress-indeterminate 1.5s infinite ease-in-out;
      }
    `}</style>
    </div>
  );
};

export default AutomateFineTune
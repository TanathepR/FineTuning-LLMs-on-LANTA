import React, { useState, useEffect } from 'react';

// เพิ่มคอมโพเนนต์ AlertPopup สำหรับแสดง popup แจ้งเตือน
const AlertPopup = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative animate-fadeIn">
        <div className="flex items-center mb-4 text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold">ข้อความแจ้งเตือน</h3>
        </div>
        
        <div className="text-gray-700 mb-5">
          {message}
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
};

// ส่วนที่ 1: อัปโหลดชุดข้อมูล
const UploadDatasetStep = ({ onConfirm }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validFile, setValidFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setValidFile(file && file.name.endsWith('.json'));
    setUploadError(null);
  };

  const handleConfirm = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    fetch('http://localhost:5000/ManualFineTune', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('การอัปโหลดล้มเหลว');
        return response;
      })
      .then(() => {
        setIsUploading(false);
        onConfirm(true);
      })
      .catch((error) => {
        setIsUploading(false);
        setUploadError(error.message);
        onConfirm(false);
      });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 text-center">
      <div className="mb-5">
        <span className="inline-block p-3 bg-blue-50 text-blue-600 rounded-full mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>
        <h2 className="text-xl font-bold">อัปโหลดชุดข้อมูล</h2>
        <p className="text-gray-600 mt-1">รองรับเฉพาะไฟล์ JSON สำหรับการฝึกโมเดล</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept=".json"
          className="hidden"
          id="datasetFile"
          onChange={handleChange}
        />
        <label
          htmlFor="datasetFile"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          {selectedFile ? (
            <div className="text-center">
              <span className="flex items-center justify-center text-green-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="block font-medium">{selectedFile.name}</span>
              <span className="block text-sm text-gray-500 mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          ) : (
            <div className="text-center">
              <span className="flex items-center justify-center text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </span>
              <span className="block font-medium text-gray-700">คลิกเพื่อเลือกไฟล์</span>
              <span className="block text-sm text-gray-500 mt-1">หรือลากและวางไฟล์ที่นี่</span>
            </div>
          )}
        </label>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          <p>{uploadError}</p>
        </div>
      )}

      <button
        className={`w-full py-3 rounded-md text-white font-medium transition-colors ${validFile && !isUploading
          ? 'bg-blue-600 hover:bg-blue-700 shadow-md'
          : 'bg-gray-300 cursor-not-allowed'
          }`}
        onClick={handleConfirm}
        disabled={!validFile || isUploading}
      >
        {isUploading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังอัปโหลด...
          </span>
        ) : (
          'ยืนยันชุดข้อมูล'
        )}
      </button>
    </div>
  );
};

// ส่วนที่ 2: เลือกทรัพยากร (ปรับปรุงใหม่)
const ResourceSelectorStep = ({ resources, setResources, onConfirm, setUploadedScriptPath }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResources((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSubmitError(null);
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    const jobForm = new FormData();
    jobForm.append('ntasks', resources.nodes.toString());
    jobForm.append('gpus', resources.gpus.toString());
    jobForm.append('memory', resources.memory.toString());
    jobForm.append('time', resources.time);

    fetch('http://localhost:5000/UploadJobScript', {
      method: 'POST',
      body: jobForm,
    })
      .then((response) => {
        if (!response.ok) throw new Error('ไม่สามารถส่งข้อมูลทรัพยากรได้');
        return response.json();
      })
      .then((data) => {
        // บันทึก scriptPath ที่ได้รับจาก API ใน state
        if (data.scriptPath) {
          setUploadedScriptPath(data.scriptPath);
        }
        setIsSubmitting(false);
        onConfirm(true);
      })
      .catch((error) => {
        setIsSubmitting(false);
        setSubmitError(error.message);
        onConfirm(false);
      });
  };

  const resourceConfigs = [
    {
      id: 'time',
      label: 'ระยะเวลาที่ใช้งาน',
      icon: '🕒',
      placeholder: 'ตัวอย่าง: 01:00:00',
      description: 'เวลาที่ต้องการใช้งาน (HH:MM:SS)',
      type: 'text'
    },
    {
      id: 'nodes',
      label: 'จำนวน Node',
      icon: '💻',
      max: 10,
      description: 'จำนวนเครื่องประมวลผลที่ต้องการใช้ (สูงสุด 10)',
      type: 'number'
    },
    {
      id: 'gpus',
      label: 'จำนวน GPU',
      icon: '🎮',
      max: 4,
      description: 'จำนวนการ์ดจอที่ต้องการใช้ (สูงสุด 4 ต่อ Node)',
      type: 'number'
    },
    {
      id: 'memory',
      label: 'หน่วยความจำ (GB)',
      icon: '🧠',
      max: 512,
      description: 'ปริมาณหน่วยความจำที่ต้องการใช้ (สูงสุด 512 GB)',
      type: 'number'
    }
  ];

  // ปรับการวางตำแหน่งให้ทั้งหน้าอยู่ในหน้าจอโดยไม่ต้องเลื่อนลง
  return (
    <div className="p-5 bg-white rounded-xl shadow-md border border-gray-100 h-full flex flex-col justify-between">
      <div>
        {/* ส่วนหัว */}
        <div className="text-center mb-4">
          <span className="inline-block p-3 bg-purple-50 text-purple-600 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <h2 className="text-xl font-bold">เลือกทรัพยากร</h2>
          <p className="text-gray-600 mt-1">กำหนดทรัพยากรที่คุณต้องการใช้สำหรับการฝึกโมเดล</p>
        </div>

        {/* ตารางทรัพยากร - ปรับเป็น grid 2x2 ที่กระชับขึ้น */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          {resourceConfigs.map((resource) => (
            <div key={resource.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center mb-1">
                <span className="text-xl mr-2">{resource.icon}</span>
                <label className="font-medium text-gray-700">
                  {resource.label}
                </label>
              </div>
              <p className="text-xs text-gray-500 mb-1.5 h-8">{resource.description}</p>
              <input
                type={resource.type}
                name={resource.id}
                value={resources[resource.id]}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition"
                min={resource.type === 'number' ? 1 : undefined}
                max={resource.max}
                placeholder={resource.placeholder}
              />
            </div>
          ))}
        </div>

        {/* ข้อมูลสรุปทรัพยากร */}
        <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-100 mb-3">
          <h3 className="font-medium mb-2 text-purple-800">สรุปการใช้ทรัพยากร</h3>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="bg-white rounded p-2 text-center">
              <span className="block text-gray-500">เวลา</span>
              <span className="font-bold text-purple-700">{resources.time}</span>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <span className="block text-gray-500">Node</span>
              <span className="font-bold text-purple-700">{resources.nodes}</span>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <span className="block text-gray-500">GPU</span>
              <span className="font-bold text-purple-700">{resources.gpus}</span>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <span className="block text-gray-500">หน่วยความจำ</span>
              <span className="font-bold text-purple-700">{resources.memory} GB</span>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-md text-sm">
            <p>{submitError}</p>
          </div>
        )}
      </div>

      {/* ส่วนปุ่มยืนยัน - วางไว้ด้านล่างสุด */}
      <button
        onClick={handleConfirm}
        disabled={isSubmitting}
        className={`w-full py-3 rounded-md text-white font-medium transition-colors ${isSubmitting
          ? 'bg-purple-300 cursor-not-allowed'
          : 'bg-purple-600 hover:bg-purple-700 shadow-md'
          }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังส่งข้อมูล...
          </span>
        ) : (
          'ยืนยันทรัพยากร'
        )}
      </button>
    </div>
  );
};

// ส่วนที่ 3: เชื่อมต่อ Terminal
const terminalIP1 = process.env.REACT_APP_TERMINAL_IP1;
const terminalIP2 = process.env.REACT_APP_TERMINAL_IP2;

// แก้ไขส่วนของ AccessTerminalStep ให้รับ uploadedScriptPath เป็น prop
const AccessTerminalStep = ({ uploadedScriptPath }) => {
  const llamaURL = '54.208.200.174:7860';
  const [showLlama, setShowLlama] = useState(false);
  const [loadingLlama, setLoadingLlama] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [activeTerminal, setActiveTerminal] = useState('hpc'); // เพิ่ม state เพื่อตรวจสอบ terminal ที่กำลังใช้งาน

  // ประกาศ hpcSteps ก่อนที่จะใช้งาน
  const [hpcSteps, setHpcSteps] = useState([
    {
      text: 'เชื่อมต่อ HPC ด้วย SSH',
      command: 'ssh username@lanta.nstda.or.th',
      description: 'ใช้คำสั่งนี้เพื่อเชื่อมต่อไปยังระบบ HPC ของ LANTA โดยเปลี่ยน username เป็นของตนเอง',
      terminalType: 'hpc'
    },
    {
      text: 'กรอกรหัสผ่าน',
      command: '',
      description: 'ใส่รหัสผ่านสำหรับเข้าสู่ระบบของคุณ (รหัสผ่านจะไม่แสดงขณะพิมพ์)',
      terminalType: 'hpc'
    },
    {
      text: 'ยืนยันตัวตนด้วยรหัส OTP',
      command: '',
      description: 'กรอกรหัส 6 หลักจากแอปพลิเคชัน OTP ของคุณเพื่อยืนยันตัวตน',
      terminalType: 'hpc'
    },
    {
      text: 'ส่งงานด้วย sbatch',
      command: 'sbatch ~/project/scripts/llama_job.sh',
      description: 'รันคำสั่ง sbatch เพื่อเริ่มต้นการประมวลผลบน HPC',
      terminalType: 'hpc'
    },
    {
      text: 'ตรวจสอบ log',
      command: 'cat llama_webui_datetime.log',
      description: 'ใช้คำสั่ง cat เพื่อดูบันทึกการทำงานของงานที่กำลังรัน',
      terminalType: 'hpc'
    },
    {
      text: 'เปิด Port Forwarding',
      command: 'ssh -L 7860:$x12345x:7860 $USER@lanta.nstda.or.th',
      description: 'หลังจากอ่านไฟล์ในขั้นตอนที่ 5 จะได้คำสั่งเพื่อเชื่อมต่อ port สำหรับใช้งาน LLaMA Web UI โดยคำสั่งจะมีลักษณะคล้ายตัวอย่างด้านล่าง',
      terminalType: 'port'
    },
  ]);

  // ใช้ currentStep หลังจากการประกาศ hpcSteps
  const currentStep = hpcSteps[guideIndex];

  // เปลี่ยน terminal ที่ใช้งานตามขั้นตอน
  useEffect(() => {
    if (currentStep && currentStep.terminalType) {
      setActiveTerminal(currentStep.terminalType);
    }
  }, [guideIndex, currentStep]);

  // อัปเดต hpcSteps เมื่อ uploadedScriptPath เปลี่ยนแปลง
  useEffect(() => {
    if (uploadedScriptPath) {
      setHpcSteps(prev => {
        const newSteps = [...prev];
        // แยกชื่อไฟล์และนามสกุล
        const scriptPathParts = uploadedScriptPath.split('/');
        const scriptFileName = scriptPathParts[scriptPathParts.length - 1]; // เอาชื่อไฟล์ที่รวมนามสกุล
        
        // สร้าง path ของไฟล์ log
        const dateTimePart = scriptFileName.replace('llama_job_', '').replace('.sh', ''); // เอาส่วน datetime
        const logFileName = `llama_webui_${dateTimePart}.log`;
        
        newSteps[3] = {
          ...newSteps[3],
          command: `sbatch ${uploadedScriptPath}`,
          description: `ส่งงานไปประมวลผลด้วยคำสั่ง sbatch โดยใช้ไฟล์ที่คุณเพิ่งสร้าง: ${uploadedScriptPath}`,
          terminalType: 'hpc'
        };
        
        // อัปเดตคำสั่ง cat สำหรับตรวจสอบ log
        newSteps[4] = {
          ...newSteps[4],
          command: `cat ${logFileName}`,
          description: `ดูบันทึกการทำงานในไฟล์ log ที่สร้างขึ้น: ${logFileName}`,
          terminalType: 'hpc'
        };
        
        return newSteps;
      });
    }
  }, [uploadedScriptPath]);

  const checkLlamaReady = async () => {
    try {
      const response = await fetch(llamaURL);
      if (response.ok) {
        setShowLlama(true);
        setLoadingLlama(false);
      } else throw new Error('Not ready');
    } catch {
      setTimeout(checkLlamaReady, 2000);
    }
  };

  const handleOpenLlamaFactory = () => {
    setLoadingLlama(true);
    checkLlamaReady();
  };

  const copyCommand = () => {
    if (currentStep.command) {
      navigator.clipboard.writeText(currentStep.command);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  // สร้างชื่อที่แสดงในแท็บของ terminal
  const getTerminalName = (type) => {
    switch (type) {
      case 'hpc':
        return 'HPC Login Terminal';
      case 'port':
        return 'Port Forwarding Terminal';
      default:
        return 'Terminal';
    }
  };

  // ฟังก์ชันสำหรับแสดงไอคอนของ terminal
  const getTerminalIcon = (type) => {
    switch (type) {
      case 'hpc':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case 'port':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
    }
  };

  return (
    <div className="p-0 bg-white rounded-xl shadow-md border border-gray-100 w-full">
      {/* คู่มือขั้นตอนการดำเนินการ - ด้านบน */}
      <div className="bg-white border-b border-gray-200 p-4 rounded-t-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">คู่มือการเชื่อมต่อกับ HPC</h2>
          <div className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
            <span className="font-medium">ขั้นตอนที่ {guideIndex + 1}</span>
            <span className="mx-1">จาก</span>
            <span className="font-medium">{hpcSteps.length}</span>
          </div>
        </div>
        
        <div className="mb-4 relative">
          <div className="overflow-hidden h-1 mb-1 text-xs flex rounded bg-gray-200">
            <div style={{ width: `${(guideIndex / (hpcSteps.length - 1)) * 100}%` }} 
                 className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">เริ่มต้น</span>
            <span className="text-xs text-gray-500">เสร็จสิ้น</span>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full min-w-10 h-10 flex items-center justify-center font-bold mr-4 mt-1">
              {guideIndex + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{currentStep.text}</h3>
              <p className="text-gray-600 mb-4 text-base">{currentStep.description}</p>

              {currentStep.command && (
                <div className="mb-5">
                  <div className="bg-gray-800 rounded-md overflow-hidden relative">
                    <div className="flex items-center px-3 py-1.5 bg-gray-700 border-b border-gray-600">
                      <div className="flex space-x-1.5 mr-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-gray-300 font-mono">command</span>
                    </div>
                    <div className="text-green-400 font-mono px-4 py-4 overflow-x-auto pr-16 text-base">
                      <code>{currentStep.command}</code>
                    </div>
                    <button
                      onClick={copyCommand}
                      className={`absolute top-8 right-0 h-10 px-3 flex items-center justify-center transition-colors ${copiedCommand
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      title={copiedCommand ? "คัดลอกแล้ว" : "คัดลอกคำสั่ง"}
                    >
                      {copiedCommand ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {guideIndex === 3 && (
                    <div className="mt-2 text-blue-600 text-sm bg-blue-50 p-2 rounded">
                      💡 <strong>เกร็ดความรู้:</strong> หลังจากรันคำสั่ง sbatch คุณจะได้รับเลข Job ID ซึ่งสามารถใช้ตรวจสอบสถานะงานของคุณด้วยคำสั่ง squeue --me
                    </div>
                  )}
                  {guideIndex === 5 && (
                    <div className="mt-2 text-blue-600 text-sm bg-blue-50 p-2 rounded">
                      💡 <strong>เกร็ดความรู้:</strong> คำสั่ง port forwarding นี้จะต้องเปิดค้างไว้ตลอดเวลาที่ใช้งาน LLaMA-Factory แนะนำให้เปิดหน้าต่าง terminal ใหม่สำหรับคำสั่งนี้โดยเฉพาะ
                    </div>
                  )}
                </div>
              )}
              
              {/* คำแนะนำเมื่อเข้าสู่ขั้นตอนการกรอกรหัสผ่าน */}
              {guideIndex === 1 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0 text-yellow-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        ขณะพิมพ์รหัสผ่าน ตัวอักษรจะไม่แสดงบนหน้าจอเพื่อความปลอดภัย กรุณาพิมพ์รหัสผ่านให้ถูกต้องแล้วกด Enter
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setGuideIndex((i) => Math.max(0, i - 1))}
            disabled={guideIndex === 0}
            className={`px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors ${guideIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm hover:shadow'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ขั้นตอนก่อนหน้า
          </button>

          <button
            onClick={() => setGuideIndex((i) => Math.min(hpcSteps.length - 1, i + 1))}
            disabled={guideIndex === hpcSteps.length - 1}
            className={`px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors ${guideIndex === hpcSteps.length - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
              }`}
          >
            ขั้นตอนถัดไป
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Terminal แบบใหม่ - ด้านล่าง */}
      <div className="p-5 bg-gray-900 rounded-b-xl">
        {/* แท็บสำหรับสลับ terminal */}
        <div className="flex mb-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTerminal('hpc')}
            className={`flex items-center px-4 py-2 rounded-t-lg text-sm font-medium ${
              activeTerminal === 'hpc' 
                ? 'bg-black text-white border-t border-l border-r border-gray-600' 
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {getTerminalIcon('hpc')}
            <span className="ml-2">{getTerminalName('hpc')}</span>
            {activeTerminal === 'hpc' && currentStep.terminalType === 'hpc' && (
              <span className="ml-2 animate-pulse">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTerminal('port')}
            className={`flex items-center px-4 py-2 rounded-t-lg text-sm font-medium ${
              activeTerminal === 'port' 
                ? 'bg-black text-white border-t border-l border-r border-gray-600' 
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {getTerminalIcon('port')}
            <span className="ml-2">{getTerminalName('port')}</span>
            {activeTerminal === 'port' && currentStep.terminalType === 'port' && (
              <span className="ml-2 animate-pulse">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </span>
            )}
          </button>
        </div>

        {/* แสดง terminal ที่กำลังใช้งาน */}
        <div className="relative min-h-[30rem] bg-black rounded-b-lg overflow-hidden">
          {/* ส่วนหัวของ terminal */}
          <div className="absolute top-0 left-0 right-0 bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center">
              <div className="flex space-x-2 mr-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-gray-300 font-mono">{activeTerminal === 'hpc' ? 'connect to HPC' : 'port-forwarding'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs bg-green-800 text-green-300 px-2 py-0.5 rounded-full">Connected</span>
            </div>
          </div>

          {/* iframe สำหรับแสดง terminal */}
          <div className="pt-10 h-full">
            <iframe
              src={`http://${activeTerminal === 'hpc' ? terminalIP1 : terminalIP2}:${activeTerminal === 'hpc' ? '7681' : '7682'}`}
              title={activeTerminal === 'hpc' ? "HPC Terminal" : "Port Forwarding Terminal"}
              className="w-full h-[28rem] border-none"
            />
          </div>
        </div>
        
        {/* ส่วนแนะนำการใช้งาน terminal */}
        <div className="mt-4 bg-gray-800 rounded-lg p-4 text-sm text-gray-300">
          <h3 className="flex items-center text-white font-medium mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            คำแนะนำในการใช้งาน Terminal
          </h3>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>คุณสามารถคัดลอกคำสั่งจากคู่มือด้านบนและวางลงใน terminal ได้โดยตรง</li>
            <li>หากไม่สามารถวางด้วย Ctrl+V ให้ลองใช้คลิกขวา หรือ Shift+Insert</li>
            <li>รหัสผ่านและรหัส OTP จะไม่แสดงบนหน้าจอเมื่อพิมพ์ ให้พิมพ์ให้ถูกต้องแล้วกด Enter</li>
            <li>หากต้องการยกเลิกคำสั่ง กด Ctrl+C</li>
          </ul>
        </div>
      </div>

      {/* ส่วนของ LLaMA-Factory */}
      <div className="mt-8 p-5 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">เปิดใช้งาน LLaMA-Factory</h2>
          {!loadingLlama && !showLlama && (
            <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full">พร้อมใช้งาน</span>
          )}
          {loadingLlama && !showLlama && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังโหลด
            </span>
          )}
          {showLlama && (
            <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              กำลังทำงาน
            </span>
          )}
        </div>

        {!loadingLlama && !showLlama && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              <img src="/api/placeholder/128/128" alt="LLaMA-Factory Logo" className="inline-block rounded-lg" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">เริ่มต้นการฝึกโมเดลของคุณด้วย LLaMA-Factory</h3>
            <p className="text-gray-600 mb-6">
              หลังจากที่คุณได้ตั้งค่าทรัพยากรและรันคำสั่งทั้งหมดใน terminal เรียบร้อยแล้ว คุณสามารถเปิด LLaMA-Factory เพื่อเริ่มกระบวนการฝึกโมเดลได้
            </p>
            <button
              onClick={handleOpenLlamaFactory}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center font-medium transition-colors shadow-md mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              เปิด LLaMA-Factory
            </button>
          </div>
        )}

        {loadingLlama && !showLlama && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">กำลังเชื่อมต่อกับ LLaMA-Factory</h3>
            <p className="text-gray-600">
              ระบบกำลังเตรียมความพร้อม โปรดรอสักครู่...
            </p>
          </div>
        )}

        {showLlama && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gray-800 text-white py-2 px-4 flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">LLaMA-Factory Web UI</span>
              </div>
              <div className="flex">
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block mr-1.5"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-500 inline-block mr-1.5"></span>
                <span className="h-3 w-3 rounded-full bg-green-500 inline-block"></span>
              </div>
            </div>
            <iframe
              src={llamaURL}
              title="LLaMA-Factory"
              className="w-full h-[45rem] border-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ส่วนที่ 4: อินเทอร์เฟซหลัก
const LLMTuningInterface = () => {
  const [step, setStep] = useState(0);
  const [uploadReady, setUploadReady] = useState(false);
  const [resourceReady, setResourceReady] = useState(false);
  const [resources, setResources] = useState({
    time: '01:00:00',
    nodes: 1,
    gpus: 1,
    memory: 16,
  });
  // เพิ่ม state ใหม่เพื่อเก็บ path ของ script
  const [uploadedScriptPath, setUploadedScriptPath] = useState('');
  
  // เพิ่ม state สำหรับ popup alert
  const [showAlert, setShowAlert] = useState(true);

  const steps = [
    {
      title: 'อัปโหลดชุดข้อมูล',
      description: 'เลือกและอัปโหลดไฟล์ JSON สำหรับการฝึกโมเดล',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      component: <UploadDatasetStep onConfirm={setUploadReady} />,
      status: uploadReady ? 'complete' : 'pending'
    },
    {
      title: 'เลือกทรัพยากร',
      description: 'กำหนดจำนวนทรัพยากรที่ต้องการใช้ในการฝึกโมเดล',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      component: <ResourceSelectorStep 
                  resources={resources} 
                  setResources={setResources} 
                  onConfirm={setResourceReady} 
                  setUploadedScriptPath={setUploadedScriptPath} 
                />, // ส่ง setUploadedScriptPath ไปด้วย
      status: resourceReady ? 'complete' : step >= 1 ? 'pending' : 'inactive'
    },
    {
      title: 'เชื่อมต่อ Terminal',
      description: 'เชื่อมต่อกับเซิร์ฟเวอร์ HPC และรันคำสั่งเพื่อเริ่มการฝึกโมเดล',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      component: <AccessTerminalStep uploadedScriptPath={uploadedScriptPath} />, // ส่ง uploadedScriptPath ไปด้วย
      status: step >= 2 ? 'pending' : 'inactive'
    },
  ];

  const isNextDisabled = () => {
    if (step === 0) return !uploadReady;
    if (step === 1) return !resourceReady;
    return false;
  };

  const handleNext = () => {
    setStep((prev) => Math.min(steps.length - 1, prev + 1));
  };

  // useEffect เพื่อแสดง popup เมื่อโหลดหน้า
  useEffect(() => {
    setShowAlert(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* แสดง Popup แจ้งเตือนเมื่อเปิดหน้าเว็บ */}
      <AlertPopup
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message="ขณะนี้ระบบมีโมเดลให้ใช้งานได้เพียง llama3-8b และ llama3-70b เท่านั้น โปรดเลือกใช้เพียงโมเดลเหล่านี้สำหรับการฝึกโมเดลของท่าน หากต้องการใช้นอกเหนือจากโมเดลข้างต้น"
      />

      {/* Header with Navigation and Progress Steps */}
      <div className="bg-white border-b border-gray-200 py-6 shadow-sm">
        <div className="container mx-auto px-4 w-full">
          {/* Navigation และ Progress steps อยู่แนวเดียวกัน */}
          <div className="flex items-center justify-center relative">
            {/* Left Arrow - อยู่ที่ขอบสุดซ้าย */}
            <button
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${step === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              disabled={step === 0}
              aria-label="ย้อนกลับ"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Progress Steps - ขยายเต็ม width */}
            <div className="w-full max-w-6xl mx-auto px-16 relative">
              {/* Connector Lines */}
              <div className="absolute top-8 left-16 right-16 h-[3px]">
                <div className="grid grid-cols-2 h-full gap-0">
                  <div className={`h-full ${step > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className={`h-full ${step > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-0 relative">
                {/* Step Circles */}
                {steps.map((s, i) => (
                  <div key={i} className="flex flex-col items-center z-10">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-3 transition-colors bg-white ${s.status === 'complete'
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : s.status === 'pending'
                          ? 'bg-blue-100 border-blue-500 text-blue-600'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}
                    >
                      {s.status === 'complete' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="scale-110">{s.icon}</span>
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <div className={`font-bold text-base ${step === i ? 'text-blue-600' : s.status === 'complete' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                        {s.title}
                      </div>
                      <div className="hidden md:block text-xs text-gray-500 max-w-[180px] text-center mt-0.5">
                        {s.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow - อยู่ที่ขอบสุดขวา */}
            {step < steps.length - 1 && (
              <button
                onClick={handleNext}
                className={`absolute right-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isNextDisabled()
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                disabled={isNextDisabled()}
                aria-label="ดำเนินการต่อ"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="container mx-auto px-4 py-6 relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-3 text-lg text-gray-600 bg-gray-50 px-5 py-2 rounded-lg shadow-sm">
            <span className="font-semibold text-xl">ขั้นตอนที่ {step + 1}</span>
            <span>จาก</span>
            <span className="font-semibold">{steps.length}</span>
            <span>:</span>
            <span className="font-bold text-blue-600 ml-1 text-xl">{steps[step].title}</span>
          </div>
        </div>

        {/* Current step content */}
        <div className="w-full">
          <div className="flex justify-center">
            <div className={`${step === 2 ? 'max-w-6xl' : 'max-w-2xl'} w-full`}>
              {steps[step].component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMTuningInterface;
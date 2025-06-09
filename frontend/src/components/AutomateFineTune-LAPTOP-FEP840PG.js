import { useState, useEffect } from 'react';
import { Database, Check, Settings, Upload, InfoIcon, ChevronDown, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadModelPage = () => {
  const navigate = useNavigate();
  const [model, setModel] = useState('');
  const [dataset, setDataset] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tuningMethod, setTuningMethod] = useState('lora');
  const [learningRate, setLearningRate] = useState('0.001');
  const [epoch, setEpoch] = useState('10');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate recommendation based on model size and dataset
  useEffect(() => {
    if (model && dataset) {
      // Just marking that user has started configuring
      setHasInteracted(true);
    }
  }, [model, dataset]);

  const handleModelChange = (event) => setModel(event.target.value);
  const handleTuningMethodChange = (event) => setTuningMethod(event.target.value);

  const handleDatasetUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.json')) {
      setDataset({ name: file.name, size: file.size });
    } else {
      alert('กรุณาอัปโหลดเฉพาะไฟล์ .json เท่านั้น');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      setDataset({ name: file.name, size: file.size });
    } else {
      alert('กรุณาอัปโหลดเฉพาะไฟล์ .json เท่านั้น');
    }
  };

  const getFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const getModelLabel = () => {
    if (model === 'llama-3-8b') return 'Llama 3 (8B)';
    if (model === 'llama-3-70b') return 'Llama 3.3 (70B)';
    if (model === 'llama-4-109b') return 'Llama 4 (109B)';
    return '';
  };

  const getTuningMethodLabel = () => {
    switch (tuningMethod) {
      case 'full': return 'Full Fine-Tuning';
      case 'lora': return 'LoRA';
      case 'qlora': return 'QLoRA';
      default: return '';
    }
  };

  const getRecommendation = () => {
    if (model.includes('8b')) {
      return 'LoRA';
    } else if (model.includes('70b') || model.includes('109b')) {
      return 'QLoRA';
    }
    return 'LoRA';
  };
  
  const getEstimatedTime = () => {
    if (!model || !dataset) return null;
    
    // These are very rough estimates
    let baseTime = 10; // minutes per epoch for 8B model with LoRA
    
    // Adjust for model size
    if (model.includes('70b')) baseTime *= 4;
    if (model.includes('109b')) baseTime *= 7;
    
    // Adjust for tuning method
    if (tuningMethod === 'full') baseTime *= 5;
    if (tuningMethod === 'qlora') baseTime *= 0.7;
    
    // Calculate total time based on epochs
    const totalMinutes = baseTime * parseInt(epoch);
    
    if (totalMinutes < 60) {
      return `${Math.round(totalMinutes)} นาที`;
    } else {
      return `${Math.floor(totalMinutes/60)} ชั่วโมง ${Math.round(totalMinutes%60)} นาที`;
    }
  };

  const uploadToHPC = async () => {
    if (!dataset) {
      alert('กรุณาเลือกไฟล์ก่อน');
      return;
    }

    setIsLoading(true);

    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);
    formData.append('tuning', tuningMethod);
    formData.append('learningRate', learningRate);
    formData.append('epoch', epoch);

    try {
      // Simulating loading time
      setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:5000/AutomateFineTune', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Upload failed');

          // ✅ redirect to waiting page
          navigate('/waiting');
        } catch (error) {
          console.error('Upload error:', error);
          alert('ไม่สามารถอัปโหลดไฟล์ไปยัง LANTA HPC ได้');
          setIsLoading(false);
        }
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      alert('ไม่สามารถอัปโหลดไฟล์ไปยัง LANTA HPC ได้');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-indigo-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Database className="mr-3" size={24} />
            ปรับแต่งโมเดลภาษาด้วย LANTA HPC
          </h2>
          <p className="text-indigo-100 mt-2">
            สร้างโมเดลที่เข้าใจบริบทภาษาไทยได้อย่างแม่นยำด้วยการ Fine-tune
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Progress Indicator */}
          <div className="flex mb-8 relative">
            <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
            
            <div className="flex-1 text-center">
              <div className={`w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center ${model ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-300 text-indigo-500'}`}>
                1
              </div>
              <div className={`mt-2 text-sm font-medium ${model ? 'text-indigo-600' : 'text-gray-500'}`}>เลือกโมเดล</div>
            </div>
            
            <div className="flex-1 text-center">
              <div className={`w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center ${dataset ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-300 text-indigo-500'}`}>
                2
              </div>
              <div className={`mt-2 text-sm font-medium ${dataset ? 'text-indigo-600' : 'text-gray-500'}`}>อัปโหลดข้อมูล</div>
            </div>
            
            <div className="flex-1 text-center">
              <div className={`w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center ${(model && dataset && hasInteracted) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-300 text-indigo-500'}`}>
                3
              </div>
              <div className={`mt-2 text-sm font-medium ${(model && dataset && hasInteracted) ? 'text-indigo-600' : 'text-gray-500'}`}>ตั้งค่า</div>
            </div>
            
            <div className="flex-1 text-center">
              <div className="w-7 h-7 mx-auto rounded-full border-2 border-indigo-300 bg-white text-indigo-500 flex items-center justify-center">
                4
              </div>
              <div className="mt-2 text-sm font-medium text-gray-500">เริ่มประมวลผล</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-3">
                <label className="flex items-center text-gray-700 font-medium text-lg">
                  <Database className="mr-2 text-indigo-600" size={20} />
                  เลือกโมเดลภาษา (LLM)
                </label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={handleModelChange}
                    className={`w-full p-3.5 pl-4 pr-10 border ${
                      model ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300'
                    } rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none shadow-sm hover:shadow-md`}
                    required
                  >
                    <option value="">-- กรุณาเลือกโมเดล --</option>
                    <optgroup label="Llama">
                      <option value="llama-3-8b">Llama 3 - 8B</option>
                      <option value="llama-3-70b">Llama 3.3 - 70B</option>
                      <option value="llama-4-109b">Llama 4 - 109B</option>
                    </optgroup>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="text-indigo-600" size={20} />
                  </div>
                </div>
                
                {model && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-700 rounded-r-md">
                    <div className="flex items-start">
                      <InfoIcon className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <div>
                        <p className="font-medium">{getModelLabel()}</p>
                        <p className="mt-1 opacity-80">
                          {model.includes('8b') && 'เหมาะสำหรับการทดลองและการใช้งานระดับนำเข้า ช่วยประหยัดทรัพยากร'}
                          {model.includes('70b') && 'มีความสามารถในการเข้าใจและสร้างเนื้อหาที่ซับซ้อนได้ดี ต้องการทรัพยากรระดับกลาง'}
                          {model.includes('109b') && 'โมเดลประสิทธิภาพสูงสุด เหมาะสำหรับงานที่ซับซ้อน ต้องการทรัพยากรระดับสูง'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Dataset */}
              <div className="space-y-3">
                <label className="flex items-center text-gray-700 font-medium text-lg">
                  <Upload className="mr-2 text-indigo-600" size={20} />
                  อัปโหลดชุดข้อมูล (.json)
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
                    isDragging ? 'bg-indigo-50 border-indigo-400' : 
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
                    accept=".json"
                  />
                  <div className="flex flex-col items-center space-y-3">
                    {dataset ? (
                      <>
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <Check size={24} />
                        </div>
                        <p className="text-lg font-medium text-green-800">{dataset.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {getFileSize(dataset.size)}
                          </span>
                          <button 
                            className="text-red-500 text-sm font-medium hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDataset(null);
                            }}
                          >
                            ลบ
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-1">
                          <Upload size={28} />
                        </div>
                        <p className="text-lg font-medium text-gray-800">
                          {isDragging ? 'วางไฟล์ตรงนี้' : 'ลากไฟล์มาวางหรือคลิกเพื่อเลือก'}
                        </p>
                        <p className="text-sm text-gray-500">รองรับไฟล์ .json เท่านั้น (สูงสุด 500MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Method Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center text-gray-700 font-medium text-lg">
                    <Settings className="mr-2 text-indigo-600" size={20} />
                    วิธีการปรับแต่งโมเดล
                  </label>
                  
                  {model && tuningMethod !== getRecommendation().toLowerCase() && (
                    <div className="text-sm text-indigo-700 px-2 py-1 bg-indigo-50 rounded-full font-medium">
                      แนะนำ: {getRecommendation()}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      tuningMethod === 'full' 
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                        : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30'
                    }`}
                    onClick={() => setTuningMethod('full')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`h-4 w-4 rounded-full border ${tuningMethod === 'full' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                        {tuningMethod === 'full' && <div className="h-1.5 w-1.5 bg-white rounded-full m-auto mt-1.25"></div>}
                      </div>
                      <div className="bg-red-100 rounded-md h-5 w-5 flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">H</span>
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">Full Fine-Tuning</h3>
                    <p className="text-xs text-gray-500">ปรับพารามิเตอร์ทั้งหมด ใช้ทรัพยากรสูง</p>
                  </div>
                  
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      tuningMethod === 'lora' 
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                        : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30'
                    }`}
                    onClick={() => setTuningMethod('lora')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`h-4 w-4 rounded-full border ${tuningMethod === 'lora' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                        {tuningMethod === 'lora' && <div className="h-1.5 w-1.5 bg-white rounded-full m-auto mt-1.25"></div>}
                      </div>
                      <div className="bg-yellow-100 rounded-md h-5 w-5 flex items-center justify-center">
                        <span className="text-yellow-600 text-xs font-bold">M</span>
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">LoRA</h3>
                    <p className="text-xs text-gray-500">ปรับเฉพาะส่วน ใช้ทรัพยากรน้อยกว่า</p>
                  </div>
                  
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      tuningMethod === 'qlora' 
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                        : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30'
                    }`}
                    onClick={() => setTuningMethod('qlora')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`h-4 w-4 rounded-full border ${tuningMethod === 'qlora' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                        {tuningMethod === 'qlora' && <div className="h-1.5 w-1.5 bg-white rounded-full m-auto mt-1.25"></div>}
                      </div>
                      <div className="bg-green-100 rounded-md h-5 w-5 flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">L</span>
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">QLoRA</h3>
                    <p className="text-xs text-gray-500">ปรับเฉพาะส่วนแบบควอนไทซ์ ประหยัดสุด</p>
                  </div>
                </div>
              </div>
              
              {/* Advanced settings toggle */}
              <div className="pt-2">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-indigo-600 font-medium text-sm flex items-center hover:text-indigo-800"
                >
                  <ChevronDown className={`mr-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} size={16} />
                  {showAdvanced ? 'ซ่อนการตั้งค่าขั้นสูง' : 'แสดงการตั้งค่าขั้นสูง'}
                </button>
                
                {showAdvanced && (
                  <div className="mt-4 space-y-5 border-t pt-4 border-gray-200">
                    {/* Learning Rate */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-gray-700 font-medium">อัตราการเรียนรู้ (Learning Rate)</label>
                        <span className="text-sm font-medium text-indigo-600">{learningRate}</span>
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
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>ช้า/แม่นยำ (0.00001)</span>
                        <span>เร็ว/ทั่วไป (0.1)</span>
                      </div>
                    </div>
                    
                    {/* Epoch */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-gray-700 font-medium">จำนวนรอบการฝึกฝน (Epoch)</label>
                        <span className="text-sm font-medium text-indigo-600">{epoch} รอบ</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setEpoch(Math.max(1, parseInt(epoch) - 1).toString())}
                          className="border h-8 w-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"
                        >
                          -
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
                          className="border h-8 w-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Summary */}
              {model && dataset && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 mt-4">
                  <h3 className="font-medium text-indigo-900 mb-3 flex items-center">
                    <BarChart2 className="mr-2 text-indigo-700" size={18} />
                    สรุปการตั้งค่า
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-600">โมเดล:</div>
                    <div className="font-medium text-gray-900">{getModelLabel()}</div>
                    
                    <div className="text-gray-600">วิธีการปรับแต่ง:</div>
                    <div className="font-medium text-gray-900">{getTuningMethodLabel()}</div>
                    
                    <div className="text-gray-600">ไฟล์ข้อมูล:</div>
                    <div className="font-medium text-gray-900">{dataset.name}</div>
                    
                    <div className="text-gray-600">เวลาที่ใช้โดยประมาณ:</div>
                    <div className="font-medium text-gray-900">{getEstimatedTime()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button
              disabled={!model || !dataset || isLoading}
              onClick={uploadToHPC}
              className={`px-6 py-3.5 text-white font-medium rounded-lg flex items-center text-lg shadow-md transition-all ${
                model && dataset && !isLoading 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเริ่มการประมวลผล...
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
    </div>
  );
};

export default UploadModelPage;
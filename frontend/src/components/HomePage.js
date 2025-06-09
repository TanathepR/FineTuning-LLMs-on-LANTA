// SelectFineTuneMode.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Zap, ArrowRight } from 'lucide-react';

const SelectFineTuneMode = () => {
  const navigate = useNavigate();
  const [hoverState, setHoverState] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // แสดง tooltip หลังจากโหลดหน้าเว็บเรียบร้อยแล้ว
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // เวลาประมาณการณ์สำหรับแต่ละโหมด
  const getEstimatedTime = (mode) => {
    if (mode === 'manual') {
      return '15-60 นาที';
    } else {
      return '10-15 นาที';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 flex flex-col items-center justify-center px-4 relative">
      {/* แบ็คกราวด์ประดับตกแต่ง */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-blue-100 rounded-full opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-indigo-100 rounded-full opacity-30"></div>
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-emerald-100 rounded-full opacity-20"></div>

      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full border border-blue-100 relative">
        {/* เส้นประดับด้านบนการ์ด */}
        <div className="absolute top-0 left-8 right-8 h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-b-lg"></div>

        <div className="text-center pb-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">สวัสดีครับ! 👋</h1>
          <h2 className="text-xl text-blue-700 font-semibold mb-4">
            ยินดีต้อนรับเข้าสู่ระบบการปรับแต่งโมเดลภาษาบนซูเปอร์คอมพิวเตอร์
          </h2>
          <div className="w-16 h-1 bg-blue-200 mx-auto rounded-full my-4"></div>
          <p className="text-gray-700 mb-1">
            กรุณาเลือกวิธีการที่คุณต้องการใช้ในการปรับแต่งโมเดล LLM บน LANTA HPC
          </p>
          <p className="text-sm text-gray-500 mb-6">
            เลือกตามความต้องการและความเชี่ยวชาญของคุณได้เลย
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div 
            className="relative"
            onMouseEnter={() => setHoverState('manual')}
            onMouseLeave={() => setHoverState(null)}
          >
            <button
              onClick={() => navigate('/MannualFineTune')}
              className={`w-full flex items-center justify-between bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium py-4 px-6 rounded-xl shadow-md transition-all duration-300 ${
                hoverState === 'manual' ? 'shadow-lg shadow-indigo-200 translate-y-[-2px]' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Settings size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-semibold text-lg">ปรับแต่งโมเดลแบบละเอียด</span>
                  <span className="text-xs text-indigo-100">สำหรับผู้ที่ต้องการควบคุมพารามิเตอร์ต่างๆ เอง</span>
                </div>
              </div>
              <ArrowRight size={20} className={`transition-transform duration-300 ${hoverState === 'manual' ? 'translate-x-1' : ''}`} />
            </button>
            
            {hoverState === 'manual' && (
              <div className="mt-2 bg-white border border-indigo-100 rounded-lg p-3 shadow-md text-sm text-gray-600 absolute left-0 right-0 z-10 animate-fadeIn">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-indigo-500 mr-2">⦿</div>
                  <div>
                    <p className="font-medium">เหมาะสำหรับ: ผู้ที่มีความคุ้นเคยกับการปรับแต่งโมเดล LLM</p>
                    <p className="mt-1">ใช้เวลาประมาณ: {getEstimatedTime('manual')}</p>
                  </div>
                </div>
              </div>
            )}

            {showTooltip && hoverState !== 'manual' && (
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-indigo-700 text-white text-xs py-2 px-3 rounded shadow-lg whitespace-nowrap animate-bounce-slow">
                เลือกรูปแบบการปรับแต่งโมเดลตามความต้องการของคุณ
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-indigo-700 rotate-45"></div>
              </div>
            )}
          </div>

          <div 
            className="relative"
            onMouseEnter={() => setHoverState('auto')}
            onMouseLeave={() => setHoverState(null)}
          >
            <button
              onClick={() => navigate('/AutomateFineTune')}
              className={`w-full flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium py-4 px-6 rounded-xl shadow-md transition-all duration-300 ${
                hoverState === 'auto' ? 'shadow-lg shadow-emerald-200 translate-y-[-2px]' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Zap size={22} />
                </div>
                <div className="text-left">
                  <span className="block font-semibold text-lg">ปรับแต่งโมเดลอัตโนมัติ</span>
                  <span className="text-xs text-emerald-100">ระบบจะเลือกค่าที่เหมาะสมที่สุดให้อัตโนมัติ</span>
                </div>
              </div>
              <ArrowRight size={20} className={`transition-transform duration-300 ${hoverState === 'auto' ? 'translate-x-1' : ''}`} />
            </button>
            
            {hoverState === 'auto' && (
              <div className="mt-2 bg-white border border-emerald-100 rounded-lg p-3 shadow-md text-sm text-gray-600 absolute left-0 right-0 z-10 animate-fadeIn">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-emerald-500 mr-2">⦿</div>
                  <div>
                    <p className="font-medium">เหมาะสำหรับ: ผู้เริ่มต้นหรือผู้ที่ต้องการความสะดวกรวดเร็ว</p>
                    <p className="mt-1">ใช้เวลาประมาณ: {getEstimatedTime('auto')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            พัฒนาโดย ธนเทพ โรจนไพรวงศ์ {' '}
            <span className="text-gray-400">version 0.0.1</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// เพิ่ม CSS Animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0) translateX(-50%); }
    50% { transform: translateY(-10px) translateX(-50%); }
  }
  .animate-bounce-slow {
    animation: bounce-slow 2s infinite ease-in-out;
  }
`;
document.head.appendChild(style);

export default SelectFineTuneMode;
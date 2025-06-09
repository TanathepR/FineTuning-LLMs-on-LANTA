import { Loader2 } from 'lucide-react';

const WaitingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="bg-white p-10 rounded-xl shadow-lg border border-blue-100 text-center space-y-6">
        <Loader2 className="mx-auto animate-spin text-blue-600" size={48} />
        <h1 className="text-2xl font-bold text-blue-800 animate-pulse">
          กรุณารอสักครู่ . . .
        </h1>
        <p className="text-gray-700 text-lg">
          กำลังปรับแต่งโมเดลภาษาของคุณบนเครื่อง LANTA
        </p>
        <p className="text-sm text-gray-500 italic">โปรดอย่าปิดหน้านี้จนกว่าการปรับแต่งจะเสร็จสมบูรณ์</p>
      </div>
    </div>
  );
};

export default WaitingPage;

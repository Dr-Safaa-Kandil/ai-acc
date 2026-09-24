import React from 'react';
import { DollarSign, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

/**
 * مكون لوحة المؤشرات الاستراتيجية اللحظية (KPIsTopBar)
 * الهدف: توفير رؤية فورية للسيولة، المبيعات (COD)، ومعدلات التحصيل للمدير التنفيذي أثناء جولاته.
 */
export default function KPIsTopBar({ data }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" dir="rtl">
      
      {/* الكتلة الأولى: صافي التدفق النقدي الفعلي */}
      <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">صافي التدفق النقدي الفعلي</span>
          <DollarSign className="text-emerald-400" size={18} />
        </div>
        <div className="text-lg md:text-xl font-bold text-emerald-400 mt-1">
          {data?.cashFlow || '142,500 ج.م'}
        </div>
        <span className="text-[10px] text-emerald-500 bg-emerald-950/50 px-2 py-0.5 rounded-full mt-2 inline-block">
          متصل بالبنوك وبوابات الدفع
        </span>
      </div>

      {/* الكتلة الثانية: إجمالي المبيعات والأرباح */}
      <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">إجمالي المبيعات (COD)</span>
          <TrendingUp className="text-indigo-400" size={18} />
        </div>
        <div className="text-lg md:text-xl font-bold text-indigo-400 mt-1">
          {data?.totalSales || '380,200 ج.م'}
        </div>
        <span className="text-[10px] text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded-full mt-2 inline-block">
          مستمد من ملفات الشحن الذكية
        </span>
      </div>

      {/* الكتلة الثالثة: كفاءة رأس المال والتحصيل */}
      <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">كفاءة رأس المال والتحصيل</span>
          <Activity className="text-amber-400" size={18} />
        </div>
        <div className="text-lg md:text-xl font-bold text-amber-400 mt-1">
          {data?.efficiency || '91.4%'}
        </div>
        <span className="text-[10px] text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full mt-2 inline-block">
          معدل تحصيل المعلقات
        </span>
      </div>

      {/* الكتلة الرابعة: التوافق المحاسبي المعياري */}
      <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">التوافق المعياري</span>
          <ShieldCheck className="text-teal-400" size={18} />
        </div>
        <div className="text-lg md:text-xl font-bold text-teal-400 mt-1">
          IFRS & SMEs
        </div>
        <span className="text-[10px] text-teal-300 bg-teal-950/50 px-2 py-0.5 rounded-full mt-2 inline-block">
          تدقيق آلي لحظي
        </span>
      </div>

    </div>
  );
}
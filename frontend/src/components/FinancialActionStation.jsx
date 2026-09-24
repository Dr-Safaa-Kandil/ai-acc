import React from 'react';
import { FileText } from 'lucide-react';

/**
 * مكون محطة التقارير المالية الختامية الآلية (FinancialActionStation)
 * الهدف: توفير أزرار تفاعلية فورية تحت الطلب لاستخراج القوائم المالية (الدخل، المركز المالي، التدفقات، وميزان المراجعة).
 */
export default function FinancialActionStation({ onSelectReport, selectedReport, onClearReport }) {
  const reports = [
    'قائمة الدخل', 
    'قائمة المركز المالي', 
    'قائمة التدفقات النقدية', 
    'ميزان المراجعة', 
    'حسابات الشركاء', 
    'التكاليف والمصروفات'
  ];

  return (
    <section className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl mb-6 shadow-md" dir="rtl">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <FileText size={14} className="text-emerald-400" /> محطة التقارير المالية الاستراتيجية الفورية
      </h2>
      
      {/* شبكة الأزرار المتجاوبة */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {reports.map((report, idx) => (
          <button 
            key={idx} 
            onClick={() => onSelectReport(report)} 
            className="bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 p-3 rounded-xl text-xs font-medium transition-all text-center border border-slate-700 shadow-sm active:scale-95"
          >
            {report}
          </button>
        ))}
      </div>

      {/* صندوق عرض حالة التقرير المختار */}
      {selectedReport && (
        <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex justify-between items-center animate-fade-in">
          <span>تم استخراج وتدقيق: <strong>{selectedReport}</strong> لحظياً وفق القيود الثنائية المعتمدة.</span>
          <button onClick={onClearReport} className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-emerald-900/40 rounded-lg">
            إغلاق
          </button>
        </div>
      )}
    </section>
  );
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, RefreshCw, Layers } from 'lucide-react';
import KPIsTopBar from './KPIsTopBar';
import FinancialActionStation from './FinancialActionStation';

/**
 * المكون الرئيسي: لوحة التحكم الاستراتيجية (StrategicExecutiveDashboard)
 * الهدف: تجميع المكونات الفرعية، ربط الـ Backend، وإدارة حالة البيانات اللحظية وجداول الاستقبال الوسيطة.
 */
export default function StrategicExecutiveDashboard() {
  const [stagingData, setStagingData] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // دالة لجلب البيانات من خادم الـ Backend المحلي
  const fetchStagingData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/staging/sales');
      setStagingData(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("خطأ في الاتصال بالخادم:", err);
      setError("تعذر الاتصال بخادم قاعدة البيانات. تأكد من عمل الـ Backend على المنفذ 3001.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStagingData();
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      
      {/* رأس اللوحة وزر التحديث اللحظي */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="text-emerald-400" /> المخطط الاستراتيجي المالي (TaaS Dashboard)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            متابعة السيولة اللحظية، جداول الاستقبال الوسيطة، والدورة المستندية لصاعد التجارة الإلكترونية.
          </p>
        </div>
        <button 
          onClick={fetchStagingData}
          className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-4 py-2 rounded-xl text-xs md:text-sm font-medium flex items-center gap-2 transition-all shadow-md"
        >
          <RefreshCw size={14} /> تحديث لحظي للبيانات
        </button>
      </header>

      {/* الكتلة الأولى: مؤشرات الأداء العلوية */}
      <KPIsTopBar />

      {/* الكتلة الثانية: محطة التقارير المالية الفورية */}
      <FinancialActionStation 
        selectedReport={selectedReport} 
        onSelectReport={(rep) => setSelectedReport(rep)} 
        onClearReport={() => setSelectedReport(null)} 
      />

      {/* الكتلة الثالثة: قناة تجهيز البيانات الوسيطة وجداول الاستقبال */}
      <section className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="text-indigo-400" /> عرض ملف التجهيز الوسيط (staging_sales_journal)
          </h3>
          <span className="text-[10px] bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">التحديث اللحظي للقيود</span>
        </div>

        {loading && <div className="text-center py-8 text-xs text-slate-400">جاري تحميل حركات البيع الوسيطة بأمان تام...</div>}
        {error && <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 rounded-xl text-xs">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-r-xl">كود الطلب</th>
                  <th className="p-3">تفاصيل العميل / الجهة</th>
                  <th className="p-3">المبلغ الإجمالي</th>
                  <th className="p-3">الحالة المحاسبية</th>
                  <th className="p-3 rounded-l-xl">تاريخ المعاملة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stagingData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-500">لا توجد سجلات معلقة في جدول الاستقبال الوسيط حالياً.</td>
                  </tr>
                ) : (
                  stagingData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-semibold text-white">{row.order_code}</td>
                      <td className="p-3 text-slate-300">{row.customer_details || 'مبيعات إلكترونية عامة'}</td>
                      <td className="p-3 font-bold text-emerald-400">{row.total_amount} ج.م</td>
                      <td className="p-3">
                        <span className="bg-amber-950/80 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded-full text-[10px] font-medium">
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{row.transaction_date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
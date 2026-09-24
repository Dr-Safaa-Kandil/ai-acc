import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, ShieldCheck, Cpu, RefreshCw, Terminal } from 'lucide-react';

export default function HelpCenter() {
  const [innovations, setInnovations] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب البيانات من خادم الـ Node.js المحلي
  const fetchData = async () => {
    setLoading(true);
    try {
      // جلب توثيقات النظام ومفاهيم الـ TaaS
      const innovationsRes = await axios.get('http://localhost:3001/api/system/innovations');
      setInnovations(innovationsRes.data.data || []);

      // جلب المبيعات المعلقة من جداول الاستقبال الوسيطة (Staging)
      const salesRes = await axios.get('http://localhost:3001/api/staging/sales');
      setSalesData(salesRes.data.data || []);

      setError(null);
    } catch (err) {
      console.error("خطأ في الاتصال بالخادم:", err);
      setError("تعذر الاتصال بالخادم المحلي. تأكد من تشغيل ملف server.js على المنفذ 3001.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      {/* رأس الصفحة الرئيسي */}
      <header className="max-w-5xl mx-auto bg-white shadow-sm rounded-2xl p-6 mb-8 border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> مركز المساعدة والتوثيق الذكي (TaaS)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            منصة توثيق معمارية النظام ومتابعة جداول الاستقبال الوسيطة الآمنة
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <RefreshCw size={16} /> تحديث البيانات
        </button>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-5xl mx-auto space-y-6">
        {loading && (
          <div className="text-center py-12 text-slate-400">جاري تحميل التوثيقات والبيانات بأمان...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* قسم المفاهيم الابتكارية وتوثيق الـ TaaS */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Cpu className="text-emerald-600" /> المفاهيم المبتكرة والملكية الفكرية للنظام
              </h2>
              <div className="grid gap-4">
                {innovations.map((item) => (
                  <div key={item.id} className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        {item.concept_code}
                      </span>
                      <span className="text-xs text-slate-500">
                        مبتكر المفهوم: <strong className="text-slate-700">{item.inventor_name}</strong>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">{item.concept_title_ar}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.definition_details_ar}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* قسم جداول الاستقبال الوسيطة (Staging Sales Status) */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> حالة جداول الاستقبال الوسيطة (Staging Ingestion)
              </h2>
              {salesData.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl text-slate-400 text-sm">
                  لا توجد سجلات مبيعات معلقة (PENDING) حالياً في جدول الاستقبال الوسيط.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                      <tr>
                        <th className="p-3 rounded-r-xl">كود الطلب</th>
                        <th className="p-3">تفاصيل العميل</th>
                        <th className="p-3">المبلغ الإجمالي</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 rounded-l-xl">تاريخ المعاملة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesData.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-900">{sale.order_code}</td>
                          <td className="p-3 text-slate-600">{sale.customer_details || 'غير متوفر'}</td>
                          <td className="p-3 font-semibold text-emerald-600">{sale.total_amount} ج.م</td>
                          <td className="p-3">
                            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">
                              {sale.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{sale.transaction_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
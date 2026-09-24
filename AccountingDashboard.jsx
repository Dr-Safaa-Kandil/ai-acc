import React from 'react';
import { useAccountingState } from './useAccountingState';

/**
 * مكون واجهة المستخدم لعرض القيود المحاسبية اليومية وتحليل المدين والدائن
 * مُحدث ليتوافق مع هيكلية قاعدة البيانات وأعمدة journal_entry_lines الفعليه
 */
export default function AccountingDashboard() {
  const { journalEntries, loading, error } = useAccountingState();

  if (loading) return <div className="p-4 text-center text-blue-600">جاري تحميل لوحة القيادة المحاسبية...</div>;
  if (error) return <div className="p-4 text-center text-red-500">خطأ في التحميل: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen font-sans" dir="rtl">
      {/* ترويسة اللوحة وتوثيق المشروع */}
      <header className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">لوحة القيادة المحاسبية الذكية</h1>
          <p className="text-sm text-gray-500">نظام القيود الإيطالية - تصميم: د. صفاء رزق قنديل</p>
        </div>
        <div className="mt-2 md:mt-0 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
          متوافق مع معايير IFRS والنظام الموحد
        </div>
      </header>

      {/* تصميم الجدول التفاعلي المتجاوب مع الموبايل (Responsive Container) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-cyan-600 text-white text-xs md:text-sm">
              <th className="p-3">كود الحساب</th>
              <th className="p-3">اسم الحساب</th>
              <th className="p-3">مدين</th>
              <th className="p-3">دائن</th>
              <th className="p-3">ملاحظات ومطابقة المعايير</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs md:text-sm text-gray-700">
            {journalEntries && journalEntries.length > 0 ? (
              journalEntries.map((entry, index) => (
                <tr key={entry.id || index} className="hover:bg-gray-50 transition-colors">
                  {/* استخدام أسماء الحقول الفعلية المطابقة لقاعدة البيانات (camelCase أو snake_case حسب الـ Hook) */}
                  <td className="p-3 font-mono font-medium">{entry.account_code || entry.accountCode}</td>
                  <td className="p-3 font-semibold">{entry.account_name || entry.accountName}</td>
                  <td className="p-3 text-emerald-600 font-mono">{entry.debit ?? 0.00}</td>
                  <td className="p-3 text-rose-600 font-mono">{entry.credit ?? 0.00}</td>
                  <td className="p-3 text-gray-500 text-xs">{entry.notes || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  لا توجد سجلات محاسبية مسجلة حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
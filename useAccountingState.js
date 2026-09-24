import { useState, useEffect } from 'react';

/**
 * هوك مخصص (Custom Hook) لإدارة حالة وجلب بيانات القيود المحاسبية اليومية 
 * مصمم لربط واجهة React بالخادم المركزي (Node.js API) مع معالجة آمنة للأخطاء وحالة التحميل.
 */
export function useAccountingState() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAccountingData() {
      try {
        setLoading(true);
        setError(null);

        // الاتصال بنقطة النهاية الخاصة باليومية الإيطالية في الخادم المركزي
        const response = await fetch('/api/italian-journal');
        
        if (!response.ok) {
          throw new Error(`فشل الاتصال بالخادم: خطأ رقم ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          // التعامل مع بنية البيانات سواء كانت تأتي كقائمة قيود رئيسية أو خطوط إدخال مباشرة
          const entriesData = result.data || [];
          setJournalEntries(entriesData);
        } else {
          throw new Error(result.message || 'حدث خطأ غير معروف أثناء استرجاع البيانات');
        }

      } catch (err) {
        console.error('❌ خطأ في جلب بيانات المحاسبة:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAccountingData();
  }, []);

  return { journalEntries, loading, error };
}
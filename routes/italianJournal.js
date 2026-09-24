/**
 * ============================================================================
 * وحدة مسارات اليومية الإيطالية (Italian Journal Routes)
 * الغرض العلمي: ترجمة حركات المبيعات الإلكترونية وبوابات الدفع وشركات الشحن (COD)
 * إلى قيود مزدوجة متوازنة متوافقة مع معايير المحاسبة الدولية (IFRS) والنظام الموحد.
 * ============================================================================
 */

import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

// جلب سجلات اليومية الإيطالية الكاملة (باستخدام العرض الجاهز v_italian_journal أو الجداول الأساسية المتوافقة)
router.get('/', async (req, res) => {
  try {
    // الخيار الأدق لليومية الإيطالية هو جلب البيانات مباشرة من الـ View المرتبط v_italian_journal
    // أو جلبها من جدول journal_entries مع ربط جدول journal_entry_lines بالأعمدة الصحيحة:
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        id,
        reference_number,
        description,
        entry_date,
        total_debit,
        total_credit,
        status,
        journal_entry_lines (
          id,
          account_code,
          account_name,
          debit,
          credit,
          notes
        )
      `)
      .order('id', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'تم استرجاع سجلات اليومية الإيطالية للمبيعات بنجاح',
      data: data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// مسار بديل لجلب البيانات مباشرة من عرض اليومية الإيطالية (v_italian_journal) لسرعة العرض التحليلي
router.get('/view', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('v_italian_journal')
      .select('*');

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'تم استرجاع بيانات عرض اليومية الإيطالية (v_italian_journal) بنجاح',
      count: data.length,
      data: data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
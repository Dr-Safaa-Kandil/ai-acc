/**
 * ============================================================================
 * وحدة مسارات التكاليف والمصروفات (Costs and Expenses Routes)
 * الغرض العلمي: تبويب ومراقبة المصروفات التشغيلية والتسويقية واللوجستية بناءً 
 * على الشجرة المحاسبية ذات التكويد السداسي الدقيق لضمان دقة حساب الأرباح.
 * ============================================================================
 */

import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // جلب بنود التكاليف والمصروفات التي تقع ضمن نطاق الكود (تبدأ بـ 5) مع تحديد الأعمدة بدقة
    const { data, error } = await supabase
      .from('journal_entry_lines')
      .select(`
        id,
        journal_entry_id,
        account_code,
        account_name,
        debit,
        credit,
        notes,
        created_at
      `)
      .like('account_code', '5%')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'تم جلب كشف التكاليف والمصروفات التشغيلية بنجاح',
      count: data.length,
      data: data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
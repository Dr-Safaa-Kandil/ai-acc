/**
 * ============================================================================
 * وحدة مسارات حقوق الشركاء والأرباح المستبقاة (Stakeholders & Equity Routes)
 * الغرض العلمي: متابعة حقوق الملكية، رأس المال الافتتاحي، مسحوبات الشركاء، 
 * وتوزيعات الأرباح المستبقاة وفقاً للأعراف المحاسبية السليمة وعقد الشركة.
 * ============================================================================
 */

import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // استعلام بنود حقوق الملكية والشركاء (التي تبدأ بـ 3 وفق الشجرة المحاسبية) مع تحديد الأعمدة بدقة
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
      .like('account_code', '3%')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // توثيق عملية استعراض حسابات حقوق الملكية في سجلات النظام
    await supabase.from('system_logs').insert([
      {
        model_used: 'Equity-Valuation-Engine',
        action: 'FETCH_STAKEHOLDERS_EQUITY',
        status: 'SUCCESS',
        payload: { recordsCount: data ? data.length : 0 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'تم استعراض حسابات الشركاء والأرباح المستبقاة بنجاح',
      count: data ? data.length : 0,
      data: data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
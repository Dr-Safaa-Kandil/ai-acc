/**
 * ============================================================================
 * وحدة مسارات الضرائب والفواتير الإلكترونية (Tax & E-Invoicing Routes)
 * الغرض العلمي: احتساب وضبط ضريبة القيمة المضافة والخصم تحت حساب الضرائب،
 * وتجهيز مخرجات الفواتير وفق متطلبات الأنظمة الضريبية الرقمية المعتمدة.
 * ============================================================================
 */

import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    // جلب البنود المحاسبية المرتبطة بالضرائب أو القيود الموثقة مع تحديد الأعمدة بدقة
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
      .or('account_code.ilike.%tax%,account_name.ilike.%ضريبة%,notes.ilike.%ضريبة%')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // توثيق عملية مراجعة وملخص الضرائب في سجلات النظام
    await supabase.from('system_logs').insert([
      {
        model_used: 'Tax-Compliance-Engine',
        action: 'FETCH_TAX_SUMMARY',
        status: 'SUCCESS',
        payload: { recordsCount: data ? data.length : 0 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'وحدة حساب الضرائب والفواتير الإلكترونية متصلة وجاهزة للتدقيق الضريبي',
      count: data ? data.length : 0,
      taxRecords: data
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router;
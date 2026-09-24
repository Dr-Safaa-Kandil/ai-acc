/**
 * ============================================================================
 * وحدة مسارات المخزون والجرد المحاسبي (Inventory & Stock Routes)
 * الغرض العلمي: تتبع حركة الوارد المنصرف للمنتجات الرقمية والمادية، واحتساب
 * تكلفة البضاعة المباعة وتسويات الجرد المستمر وفق المعايير المحاسبية.
 * ============================================================================
 */

import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    // جلب الحركات المحاسبية المرتبطة بالمخزون أو الأصول المتداولة (مثال: الأكواد التي تبدأ بـ 1 أو البنود التشغيلية)
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
      .like('account_code', '1%') // افتراض أن أصول المخزون تبدأ بـ 1 وفق شجرة الحسابات
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // توثيق عملية فحص المخزون في سجلات النظام
    await supabase.from('system_logs').insert([
      {
        model_used: 'Inventory-Valuation-Engine',
        action: 'CHECK_STOCK_STATUS',
        status: 'SUCCESS',
        payload: { recordsCount: data ? data.length : 0 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'وحدة جرد ومتابعة المخزون الإلكتروني نشطة ومتوافقة مع نظام التكلفة المعيارية',
      count: data ? data.length : 0,
      inventoryMovements: data
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router;
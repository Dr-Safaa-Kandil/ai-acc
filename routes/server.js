/**
 * ============================================================================
 * خادم النواة المحاسبية المركزي الموحد (Main Backend Server)
 * الإصدار: 2.1.0 - Free Cloud Architecture & Wix Integration Ready
 * ============================================================================
 */

import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/journal/sync', async (req, res) => {
    try {
        const rows = req.body.rows;

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ success: false, message: 'لا توجد بيانات مرسلة للترحيل.' });
        }

        const processedRows = [];

        for (const row of rows) {
            // استقبال الأعمدة بناءً على الترتيب الجديد للشيت (مع التعامل مع الاحتمالات الفارغة)
            const transactionDate = row[0] || null;               // [0] تاريخ اليوم / التسجيل
            const entryNumber = parseInt(row[1]) || null;        // [1] رقم القيد
            const accountCode = row[2];                          // [2] كود الحساب
            const debit = parseFloat(row[4]) || 0;               // [4] مدين
            const credit = parseFloat(row[5]) || 0;              // [5] دائن
            const totalAmount = parseFloat(row[6]) || 0;          // [6] إجمالي المبلغ
            const paidAmount = parseFloat(row[7]) || 0;           // [7] المبلغ المدفوع
            const remainingCod = parseFloat(row[8]) || 0;        // [8] المتبقي COD
            
            // حقول العملة والصرف (مع وضع قيم افتراضية مرنة إذا كانت فارغة في الشيت المصدر)
            const foreignAmount = row[9] !== undefined && row[9] !== '' ? parseFloat(row[9]) : 0;
            const exchangeRate = row[10] !== undefined && row[10] !== '' && !isNaN(parseFloat(row[10])) ? parseFloat(row[10]) : 1.000000;
            
            // حساب المبلغ بالعملة المحلية إذا لم يكن مدرجاً بشكل صريح، أو الاعتماد على القيمة الواردة
            let baseCurrencyAmount = 0;
            if (row[11] !== undefined && row[11] !== '' && !isNaN(parseFloat(row[11]))) {
                baseCurrencyAmount = parseFloat(row[11]);
            } else {
                baseCurrencyAmount = foreignAmount > 0 ? (foreignAmount * exchangeRate) : totalAmount;
            }

            const customerDetails = row[12] || null;             // [12] بيان العميل والعنوان
            
            // إذا لم يوجد حقل كود الدولة أو العملة في الشيت، ندرج القيم الافتراضية أو نتركها للجدول
            const countryCode = (row[13] && row[13].toString().trim() !== '') ? row[13].toString().trim() : 'EG';
            const currencyCode = (row[14] && row[14].toString().trim() !== '') ? row[14].toString().trim() : 'EGP';
            
            const orderCode = row[15] || null;                   // [15] كود الأوردر
            const ifrsNotes = row[16] || null;                   // [16] ملاحظات ومطابقة المعايير الدولية

            // 1. التحقق من صحة كود الحساب في دليل الحسابات
            if (accountCode) {
                const { data: accountCheck, error: accError } = await supabase
                    .from('chart_of_accounts_coa')
                    .select('account_code')
                    .eq('account_code', accountCode)
                    .single();

                if (accError || !accountCheck) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `كود الحساب غير موجود بدليل الحسابات: ${accountCode}` 
                    });
                }
            }

            // 2. التحقق من القواعد المالية الأساسية
            if (debit < 0 || credit < 0 || foreignAmount < 0) {
                return res.status(400).json({ success: false, message: 'قيم المبالغ أو الأرصدة لا يمكن أن تكون سالبة.' });
            }
            if (debit > 0 && credit > 0) {
                return res.status(400).json({ success: false, message: `خطأ في الأوردر ${orderCode}: السطر لا يمكن أن يكون مديناً ودائناً معاً.` });
            }

            // تجهيز الصف بالشكل المطابق لجدول قاعدة البيانات
            processedRows.push({
                transaction_date: transactionDate,
                entry_number: entryNumber,
                account_code: accountCode,
                debit: debit,
                credit: credit,
                total_amount: totalAmount,
                paid_amount: paidAmount,
                remaining_cod: remainingCod,
                foreign_amount: foreignAmount,
                exchange_rate: exchangeRate,
                base_currency_amount: baseCurrencyAmount,
                customer_details: customerDetails,
                country_code: countryCode,
                currency_code: currencyCode,
                order_code: orderCode,
                ifrs_notes: ifrsNotes
            });
        }

        // 3. الإدخال في قاعدة البيانات
        const { data, error } = await supabase
            .from('italian_journal_table')
            .insert(processedRows)
            .select();

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: `تمت مزامنة وترحيل ${processedRows.length} سجل بنجاح من الشيت إلى قاعدة البيانات.`,
            data
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sync Server is running on port ${PORT}`);
});
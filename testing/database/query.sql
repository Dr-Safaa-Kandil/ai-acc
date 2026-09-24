SELECT 
    c.table_name AS "اسم الجدول",
    c.column_name AS "اسم العمود",
    c.data_type AS "نوع البيانات",
    c.is_nullable AS "يقبل قيم فارغة",
    c.column_default AS "القيمة الافتراضية"
FROM 
    information_schema.columns c
JOIN 
    information_schema.tables t ON c.table_name = t.table_name 
    AND c.table_schema = t.table_schema
WHERE 
    c.table_schema = 'public' -- يمكنك تغييرها إلى الـ Schema الخاصة بك إن وجدت
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    c.table_name, 
    c.ordinal_position;
-- ============================================================
--  Monsela — مواصفات خاصة بكل قسم
--  شغّله مرة واحدة في Supabase → SQL Editor
--  آمن: بيضيف خانة جديدة فاضية بس، مش بيمسح ولا يغيّر أي منتج
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS specs jsonb DEFAULT '{}'::jsonb;

-- للتأكد — المفروض يرجّع صف واحد
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'specs';

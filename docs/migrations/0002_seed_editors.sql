-- Tambahan untuk database yang sudah menjalankan docs/schema.sql versi awal
-- (hanya penulis redaksi, tanpa email). Aman dijalankan ulang.
-- R2 tidak diubah: hero_r2_key tetap TEXT dan boleh berisi https:// atau /path.

INSERT OR IGNORE INTO authors (slug, name, role, bio, email) VALUES
  ('rizal', 'Rizal', 'Editor', 'Editor bacaankunetwork.com.', 'rizal@bacaankunetwork.com'),
  ('jenny', 'Jenny', 'Editor', 'Editor bacaankunetwork.com.', 'jenny@bacaankunetwork.com'),
  ('rere', 'Rere', 'Editor', 'Editor bacaankunetwork.com.', 'rere@bacaankunetwork.com');

UPDATE authors SET email = 'redaksi@bacaankunetwork.com'
  WHERE slug = 'redaksi' AND (email IS NULL OR email = '');

# Merkezi Supabase Kurulum Rehberi

Bu dokümantasyon, QR Menü uygulaması için merkezi Supabase yapılandırmasını açıklar.

## 1. Merkezi Supabase Projesi Oluşturma

1. Yeni bir Supabase projesi oluşturun (merkezi yönetim için)
2. Bu proje sadece restoran yapılandırmalarını saklayacak
3. Her restoranın kendi Supabase projesi olmaya devam edecek

## 2. Themes Tablosu Oluşturma

Önce tema seçenekleri için `themes` tablosunu oluşturun:

```sql
-- Themes tablosu oluştur (basit yapı: sadece ad ve JSON)
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  theme JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index oluştur
CREATE INDEX idx_themes_active ON themes(is_active) WHERE is_active = true;
CREATE INDEX idx_themes_display_order ON themes(display_order);

-- Updated_at trigger
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Politikası
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Themes herkese açık okuma"
ON themes FOR SELECT
USING (is_active = true);
```

## 3. Restaurants Tablosu Oluşturma

Merkezi Supabase'de aşağıdaki SQL'i çalıştırın:

```sql
-- Restaurants tablosu oluştur (theme_id ile)
CREATE TABLE restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  logo TEXT,
  supabase_url TEXT NOT NULL,
  supabase_key TEXT NOT NULL,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index oluştur
CREATE INDEX idx_restaurants_active ON restaurants(is_active) WHERE is_active = true;
CREATE INDEX idx_restaurants_display_order ON restaurants(display_order);

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. Örnek Tema Verileri

Tema seçenekleri eklemek için (JSONB formatında):

```sql
-- Modern Mavi Tema
INSERT INTO themes (name, name_en, theme, display_order)
VALUES (
  'Modern Mavi',
  'Modern Blue',
  '{
    "primaryColor": "#2c3e50",
    "secondaryColor": "#3498db",
    "accentColor": "#e74c3c",
    "textColor": "#333",
    "textLight": "#666",
    "bgColor": "#f8f9fa",
    "cardBg": "#ffffff",
    "borderColor": "#e0e0e0",
    "borderRadius": "12px",
    "fontFamily": "-apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif"
  }'::jsonb,
  1
);

-- Sıcak Turuncu Tema
INSERT INTO themes (name, name_en, theme, display_order)
VALUES (
  'Sıcak Turuncu',
  'Warm Orange',
  '{
    "primaryColor": "#8B4513",
    "secondaryColor": "#D2691E",
    "accentColor": "#CD853F",
    "textColor": "#333",
    "textLight": "#666",
    "bgColor": "#FFF8DC",
    "cardBg": "#FFFFFF",
    "borderColor": "#e0e0e0",
    "borderRadius": "8px",
    "fontFamily": "-apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif"
  }'::jsonb,
  2
);

-- Koyu Tema
INSERT INTO themes (name, name_en, theme, display_order)
VALUES (
  'Koyu Tema',
  'Dark Theme',
  '{
    "primaryColor": "#1a1a1a",
    "secondaryColor": "#2d2d2d",
    "accentColor": "#ff6b6b",
    "textColor": "#ffffff",
    "textLight": "#cccccc",
    "bgColor": "#121212",
    "cardBg": "#1e1e1e",
    "borderColor": "#333333",
    "borderRadius": "12px",
    "fontFamily": "-apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif"
  }'::jsonb,
  3
);

-- Minimal Tema
INSERT INTO themes (name, name_en, theme, display_order)
VALUES (
  'Minimal',
  'Minimal',
  '{
    "primaryColor": "#000000",
    "secondaryColor": "#666666",
    "accentColor": "#000000",
    "textColor": "#333",
    "textLight": "#666",
    "bgColor": "#ffffff",
    "cardBg": "#ffffff",
    "borderColor": "#e0e0e0",
    "borderRadius": "0px",
    "fontFamily": "-apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif"
  }'::jsonb,
  4
);
```

## 5. Row Level Security (RLS) Ayarları

Restaurants tablosu herkese açık okuma için ayarlanmalı:

```sql
-- RLS'yi etkinleştir
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Herkese açık okuma politikası
CREATE POLICY "Restaurants herkese açık okuma"
ON restaurants FOR SELECT
USING (is_active = true);
```

## 6. Örnek Veri Ekleme

Mevcut restoranları merkezi Supabase'e eklemek için (theme_id ile):

```sql
-- Önce bir tema ID'si alın (örnek: Modern Mavi temasının ID'si)
-- SELECT id FROM themes WHERE name = 'Modern Mavi' LIMIT 1;

-- Örnek restoran ekleme (theme_id ile)
INSERT INTO restaurants (id, name, name_en, description, description_en, supabase_url, supabase_key, theme_id, display_order)
VALUES (
  'nalonaRestoran',
  'Nalona Restoran',
  'Nalona Restoran',
  'Lezzetli yemekler ve sıcak bir atmosfer',
  'Delicious food and warm atmosphere',
  'https://ysahpcvlquczubwywinh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYWhwY3ZscXVjenVid3l3aW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDQ3NzAsImV4cCI6MjA4MDYyMDc3MH0.Lm35XQYU1r0A-FvOP-dOtyu5yONVfHFjY4H2__JLIkk',
  (SELECT id FROM themes WHERE name = 'Modern Mavi' LIMIT 1), -- Tema ID'si
  1
);

INSERT INTO restaurants (id, name, name_en, description, description_en, supabase_url, supabase_key, theme_id, display_order)
VALUES (
  'aydinLahmacun',
  'Aydın Lahmacun',
  'Aydın Lahmacun',
  'Vartonun Lahmacuncusu',
  'Traditional flavors, modern presentation',
  'https://ysahpcvlquczubwywinh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYWhwY3ZscXVjenVid3l3aW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDQ3NzAsImV4cCI6MjA4MDYyMDc3MH0.Lm35XQYU1r0A-FvOP-dOtyu5yONVfHFjY4H2__JLIkk',
  (SELECT id FROM themes WHERE name = 'Sıcak Turuncu' LIMIT 1), -- Tema ID'si
  2
);
```

**Not**: Eğer `theme_id` NULL ise veya tema bulunamazsa, varsayılan tema kullanılır. Geriye dönük uyumluluk için `theme` JSONB alanı da kullanılabilir (öncelik `theme_id`'dedir).

## 7. Tema Yönetimi

### Tema Seçimi

Restoranlara tema atamak için:

```sql
-- Restoranın temasını güncelle
UPDATE restaurants 
SET theme_id = (SELECT id FROM themes WHERE name = 'Koyu Tema' LIMIT 1)
WHERE id = 'restaurant-id';
```

### Yeni Tema Oluşturma

```sql
INSERT INTO themes (name, name_en, theme, display_order)
VALUES (
  'Tema Adı',
  'Theme Name',
  '{
    "primaryColor": "#2c3e50",
    "secondaryColor": "#3498db",
    "accentColor": "#e74c3c",
    "textColor": "#333",
    "textLight": "#666",
    "bgColor": "#f8f9fa",
    "cardBg": "#ffffff",
    "borderColor": "#e0e0e0",
    "borderRadius": "12px",
    "fontFamily": "-apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif"
  }'::jsonb,
  5
);
```

### Tema JSON Yapısı

Tema JSON'u şu alanları içerebilir (hepsi opsiyonel, belirtilmeyenler varsayılan değerler kullanılır):

```json
{
  "primaryColor": "#2c3e50",
  "secondaryColor": "#3498db",
  "accentColor": "#e74c3c",
  "textColor": "#333",
  "textLight": "#666",
  "bgColor": "#f8f9fa",
  "cardBg": "#ffffff",
  "borderColor": "#e0e0e0",
  "borderRadius": "12px",
  "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
}
```

## 8. Merkezi Supabase Bağlantı Bilgileri

Merkezi Supabase projenizin URL ve anon key'ini almak için:
1. Supabase Dashboard'a gidin
2. Settings > API bölümüne gidin
3. `Project URL` ve `anon public` key'i kopyalayın
4. Bu bilgileri `.env` dosyasına ekleyin (veya doğrudan `restaurant-config.js` dosyasına)

## Notlar

- Merkezi Supabase'deki `supabase_key` alanı, her restoranın kendi Supabase projesinin anon key'idir
- Bu key'ler frontend'de kullanılacağı için anon key olmalıdır (service_role key değil)
- Tema sistemi: Öncelik `theme_id` ile veritabanından çekilen temadadır. Eğer `theme_id` yoksa veya tema bulunamazsa, `theme` JSONB alanı kontrol edilir. İkisi de yoksa varsayılan tema kullanılır
- Tema seçenekleri `themes` tablosunda merkezi olarak yönetilir, böylece aynı tema birden fazla restorana atanabilir


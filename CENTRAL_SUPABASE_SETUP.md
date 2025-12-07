# Merkezi Supabase Kurulum Rehberi

Bu dokümantasyon, QR Menü uygulaması için merkezi Supabase yapılandırmasını açıklar.

## 1. Merkezi Supabase Projesi Oluşturma

1. Yeni bir Supabase projesi oluşturun (merkezi yönetim için)
2. Bu proje sadece restoran yapılandırmalarını saklayacak
3. Her restoranın kendi Supabase projesi olmaya devam edecek

## 2. Restaurants Tablosu Oluşturma

Merkezi Supabase'de aşağıdaki SQL'i çalıştırın:

```sql
-- Restaurants tablosu oluştur
CREATE TABLE restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  logo TEXT,
  supabase_url TEXT NOT NULL,
  supabase_key TEXT NOT NULL,
  theme JSONB DEFAULT '{}'::jsonb,
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

## 3. Row Level Security (RLS) Ayarları

Restaurants tablosu herkese açık okuma için ayarlanmalı:

```sql
-- RLS'yi etkinleştir
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Herkese açık okuma politikası
CREATE POLICY "Restaurants herkese açık okuma"
ON restaurants FOR SELECT
USING (is_active = true);
```

## 4. Örnek Veri Ekleme

Mevcut restoranları merkezi Supabase'e eklemek için:

```sql
-- Örnek restoran ekleme
INSERT INTO restaurants (id, name, name_en, description, description_en, supabase_url, supabase_key, theme, display_order)
VALUES (
  'nalonaRestoran',
  'Nalona Restoran',
  'Nalona Restoran',
  'Lezzetli yemekler ve sıcak bir atmosfer',
  'Delicious food and warm atmosphere',
  'https://ysahpcvlquczubwywinh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYWhwY3ZscXVjenVid3l3aW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDQ3NzAsImV4cCI6MjA4MDYyMDc3MH0.Lm35XQYU1r0A-FvOP-dOtyu5yONVfHFjY4H2__JLIkk',
  '{
    "primaryColor": "#2c3e50",
    "secondaryColor": "#3498db",
    "accentColor": "#e74c3c",
    "textColor": "#333",
    "bgColor": "#f8f9fa",
    "cardBg": "#ffffff",
    "borderRadius": "12px"
  }'::jsonb,
  1
);

INSERT INTO restaurants (id, name, name_en, description, description_en, supabase_url, supabase_key, theme, display_order)
VALUES (
  'aydinLahmacun',
  'Aydın Lahmacun',
  'Aydın Lahmacun',
  'Vartonun Lahmacuncusu',
  'Traditional flavors, modern presentation',
  'https://ysahpcvlquczubwywinh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYWhwY3ZscXVjenVid3l3aW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDQ3NzAsImV4cCI6MjA4MDYyMDc3MH0.Lm35XQYU1r0A-FvOP-dOtyu5yONVfHFjY4H2__JLIkk',
  '{
    "primaryColor": "#8B4513",
    "secondaryColor": "#D2691E",
    "accentColor": "#CD853F",
    "textColor": "#333",
    "bgColor": "#FFF8DC",
    "cardBg": "#FFFFFF",
    "borderRadius": "8px"
  }'::jsonb,
  2
);
```

## 5. Tema JSON Yapısı

Her restoran için tema ayarları JSON formatında saklanır:

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

## 6. Merkezi Supabase Bağlantı Bilgileri

Merkezi Supabase projenizin URL ve anon key'ini almak için:
1. Supabase Dashboard'a gidin
2. Settings > API bölümüne gidin
3. `Project URL` ve `anon public` key'i kopyalayın
4. Bu bilgileri `.env` dosyasına ekleyin (veya doğrudan `restaurant-config.js` dosyasına)

## Notlar

- Merkezi Supabase'deki `supabase_key` alanı, her restoranın kendi Supabase projesinin anon key'idir
- Bu key'ler frontend'de kullanılacağı için anon key olmalıdır (service_role key değil)
- Tema ayarları opsiyoneldir, belirtilmezse varsayılan tema kullanılır


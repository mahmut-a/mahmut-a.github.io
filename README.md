# QR Menü Uygulaması

Restoranlar için QR kod tabanlı dijital menü uygulaması. Her restoranın kendi Supabase veritabanı ile menülerini görüntüleyebileceği, responsive ve çok dilli bir web uygulaması.

## Özellikler

- 📱 **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- 🌍 **Çoklu Dil Desteği**: Türkçe ve İngilizce
- 🏪 **Merkezi Restoran Yönetimi**: Tüm restoranlar merkezi Supabase'den yönetilir
- 🛒 **Sepet Sistemi**: Ürün ekleme, çıkarma ve fiyat hesaplama
- 🎨 **Özelleştirilebilir Temalar**: Her restoran kendi temasını özelleştirebilir
- ⚡ **Hızlı ve Hafif**: Pure JavaScript, framework yok
- 🔒 **Güvenli API Key Yönetimi**: API key'ler merkezi Supabase'de saklanır
- 📊 **Modern UI**: Gelişmiş animasyonlar ve kullanıcı deneyimi

## Teknolojiler

- HTML5
- CSS3 (Flexbox/Grid)
- Vanilla JavaScript (ES6+)
- Supabase (Veritabanı)
- GitHub Pages (Hosting)

## Kurulum

### 1. Projeyi İndirin

```bash
git clone https://github.com/kullaniciadi/QRMenu.git
cd QRMenu
```

### 2. Merkezi Supabase Kurulumu

**ÖNEMLİ**: Önce merkezi Supabase projesi oluşturulmalıdır. Bu proje tüm restoran yapılandırmalarını saklar.

Detaylı kurulum talimatları için `CENTRAL_SUPABASE_SETUP.md` dosyasına bakın.

#### Merkezi Supabase'de Restaurants Tablosu

Merkezi Supabase projenizde `restaurants` tablosunu oluşturun:

```sql
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

-- RLS Politikası
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants herkese açık okuma"
ON restaurants FOR SELECT
USING (is_active = true);
```

#### Merkezi Supabase Bağlantı Bilgileri

`js/restaurant-config.js` dosyasında merkezi Supabase bağlantı bilgilerini ayarlayın:

```javascript
const CENTRAL_SUPABASE_URL = 'https://your-central-project.supabase.co';
const CENTRAL_SUPABASE_KEY = 'your-anon-key-here';
```

**Not**: Production ortamında bu değerler environment variables veya build-time injection ile sağlanmalıdır.

### 3. Restoran Supabase Veritabanı Kurulumu

Her restoran için kendi Supabase projesi oluşturulmalıdır (menü verileri için).

#### Supabase'de Tabloları Oluşturma

**categories tablosu:**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**products tablosu:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Row Level Security (RLS) Ayarları

Tabloları herkese açık okuma için ayarlayın:

```sql
-- categories tablosu için
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kategoriler herkese açık okuma"
ON categories FOR SELECT
USING (true);

-- products tablosu için
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ürünler herkese açık okuma"
ON products FOR SELECT
USING (true);
```

### 4. Restoran Yapılandırması

Yeni restoran eklemek için merkezi Supabase'deki `restaurants` tablosuna kayıt ekleyin:

```sql
INSERT INTO restaurants (id, name, name_en, description, description_en, supabase_url, supabase_key, theme, display_order)
VALUES (
  'restaurant-id',
  'Restoran Adı',
  'Restaurant Name',
  'Restoran açıklaması',
  'Restaurant description',
  'https://your-project.supabase.co',
  'your-anon-key',
  '{
    "primaryColor": "#2c3e50",
    "secondaryColor": "#3498db",
    "accentColor": "#e74c3c",
    "borderRadius": "12px"
  }'::jsonb,
  1
);
```

**Tema Özelleştirme:**

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

**Supabase URL ve Key Nasıl Bulunur:**
1. Restoranın Supabase projesine giriş yapın
2. Settings > API bölümüne gidin
3. `Project URL` ve `anon public` key'i kopyalayın
4. Bu bilgileri merkezi Supabase'deki `restaurants` tablosuna ekleyin

### 5. QR Kod Oluşturma

Her restoran için QR kod oluşturun. QR kod şu formatta bir URL içermelidir:

```
https://kullaniciadi.github.io/QRMenu/menu.html?restaurant=restaurant-id
```

QR kod oluşturmak için online araçlar kullanabilirsiniz:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

## GitHub Pages'e Yayınlama

### 1. GitHub Repository Oluşturma

1. GitHub'da yeni bir repository oluşturun
2. Tüm dosyaları repository'ye yükleyin

```bash
git init
git add .
git commit -m "İlk commit"
git branch -M main
git remote add origin https://github.com/kullaniciadi/QRMenu.git
git push -u origin main
```

### 2. GitHub Pages Ayarları

1. Repository sayfasında **Settings** sekmesine gidin
2. Sol menüden **Pages** seçeneğini bulun
3. **Source** bölümünden **main** branch'ini seçin
4. **Save** butonuna tıklayın

Birkaç dakika sonra siteniz şu adreste yayında olacak:
```
https://kullaniciadi.github.io/QRMenu/
```

## Kullanım

### Ana Sayfa

Ana sayfa (`index.html`) tüm kayıtlı restoranları listeler. Kullanıcılar buradan bir restoran seçerek menüsünü görüntüleyebilir.

### Menü Sayfası

Menü sayfası (`menu.html`) sadece QR kod ile erişilebilir. URL'de restoran ID'si parametre olarak geçilir:

```
menu.html?restaurant=restaurant-id
```

Normal kullanıcılar bu sayfaya doğrudan erişemezler, sadece QR kod okutarak erişebilirler.

### Sepet Sistemi

- Ürün kartlarındaki +/- butonları ile ürün miktarı ayarlanabilir
- Sağ alt köşedeki sepet butonu ile sepet görüntülenebilir
- Sepet içeriği localStorage'da saklanır
- Toplam fiyat otomatik hesaplanır
- Sepet temizlenebilir

### Tema Sistemi

Her restoran kendi temasını özelleştirebilir:
- Renkler (primary, secondary, accent)
- Arka plan renkleri
- Border radius
- Font family
- Tema ayarları merkezi Supabase'deki `restaurants` tablosunda `theme` JSONB alanında saklanır

## Veri Yapısı

### Categories (Kategoriler)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Benzersiz kimlik |
| name | TEXT | Kategori adı (Türkçe) |
| name_en | TEXT | Kategori adı (İngilizce) |
| display_order | INTEGER | Görüntüleme sırası |
| created_at | TIMESTAMP | Oluşturulma tarihi |

### Products (Ürünler)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUID | Benzersiz kimlik |
| category_id | UUID | Kategori referansı |
| name | TEXT | Ürün adı (Türkçe) |
| name_en | TEXT | Ürün adı (İngilizce) |
| description | TEXT | Ürün açıklaması (Türkçe) |
| description_en | TEXT | Ürün açıklaması (İngilizce) |
| price | DECIMAL | Fiyat |
| image_url | TEXT | Ürün resmi URL'si |
| display_order | INTEGER | Görüntüleme sırası |
| created_at | TIMESTAMP | Oluşturulma tarihi |

## Dil Desteği

Uygulama Türkçe ve İngilizce dillerini destekler. Dil tercihi localStorage'da saklanır ve sayfa yenilendiğinde korunur.

Yeni çeviriler eklemek için `js/language.js` dosyasındaki `translations` objesine ekleme yapabilirsiniz.

## Özelleştirme

### Tema Özelleştirme

Restoran temaları merkezi Supabase'deki `restaurants` tablosunda saklanır. Tema ayarları JSON formatında `theme` alanında tutulur.

Varsayılan tema ayarları `js/theme.js` dosyasında tanımlıdır. Tema sistemi CSS custom properties kullanır.

### Stil

Tüm stiller `css/style.css` ve `css/responsive.css` dosyalarında bulunur. İstediğiniz gibi özelleştirebilirsiniz.

### Yeni Özellikler Ekleme

- **Sepet**: `js/cart.js` - Sepet yönetimi
- **Tema**: `js/theme.js` - Tema yönetimi
- **Dil**: `js/language.js` - Çoklu dil desteği

## Sorun Giderme

### Menü Yüklenmiyor

1. Merkezi Supabase bağlantı bilgilerinin doğru olduğundan emin olun (`js/restaurant-config.js`)
2. Restoranın Supabase URL ve Key'inin merkezi Supabase'de doğru kayıtlı olduğunu kontrol edin
3. Supabase'de RLS politikalarının doğru ayarlandığını kontrol edin
4. Tarayıcı konsolunda hata mesajlarını kontrol edin

### Restoranlar Görünmüyor

1. Merkezi Supabase'deki `restaurants` tablosunda `is_active = true` olan kayıtların olduğundan emin olun
2. Merkezi Supabase bağlantı bilgilerinin doğru olduğunu kontrol edin
3. Tarayıcı konsolunda hata mesajlarını kontrol edin

### QR Kod Çalışmıyor

1. QR kod URL'sinin doğru formatta olduğundan emin olun
2. GitHub Pages'in aktif olduğunu kontrol edin
3. URL'de restoran ID'sinin doğru olduğundan emin olun

### Sepet Çalışmıyor

1. Tarayıcı localStorage'ın aktif olduğundan emin olun
2. Tarayıcı konsolunda JavaScript hatalarını kontrol edin
3. `js/cart.js` dosyasının yüklendiğinden emin olun

## Lisans

Bu proje açık kaynaklıdır ve serbestçe kullanılabilir.

## Dosya Yapısı

```
QRMenu/
├── index.html              # Ana sayfa
├── menu.html               # Menü sayfası
├── css/
│   ├── style.css          # Ana stiller
│   └── responsive.css     # Responsive stiller
├── js/
│   ├── language.js        # Dil yönetimi
│   ├── restaurant-config.js  # Restoran yapılandırması (merkezi Supabase)
│   ├── supabase-client.js   # Supabase istemci yönetimi
│   ├── theme.js           # Tema yönetimi
│   ├── cart.js            # Sepet yönetimi
│   ├── menu.js            # Menü sayfası logic
│   └── main.js            # Ana sayfa logic
├── CENTRAL_SUPABASE_SETUP.md  # Merkezi Supabase kurulum rehberi
└── README.md              # Bu dosya
```

## Yeni Özellikler

### v2.0 - Merkezi Yönetim ve Sepet Sistemi

- ✅ Merkezi Supabase ile restoran yönetimi
- ✅ Güvenli API key saklama
- ✅ Sepet sistemi (ürün ekleme, çıkarma, fiyat hesaplama)
- ✅ Restoran bazlı tema özelleştirme
- ✅ Gelişmiş UI/UX iyileştirmeleri
- ✅ Mobil uyumlu sepet arayüzü

## Destek

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.



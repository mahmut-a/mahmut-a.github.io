# QR Menü Uygulaması

Restoranlar için QR kod tabanlı dijital menü uygulaması. Her restoranın kendi Supabase veritabanı ile menülerini görüntüleyebileceği, responsive ve çok dilli bir web uygulaması.

## Özellikler

- 📱 **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- 🌍 **Çoklu Dil Desteği**: Türkçe ve İngilizce
- 🏪 **Çoklu Restoran**: Her restoranın kendi Supabase projesi
- 🎨 **Modern UI**: Temiz ve kullanıcı dostu arayüz
- ⚡ **Hızlı ve Hafif**: Pure JavaScript, framework yok
- 🔒 **QR Kod Erişimi**: Menü sayfası sadece QR kod ile erişilebilir

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

### 2. Supabase Veritabanı Kurulumu

Her restoran için kendi Supabase projesi oluşturulmalıdır.

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

### 3. Restoran Yapılandırması

`js/restaurant-config.js` dosyasına yeni restoran ekleyin:

```javascript
'restaurant-id': {
    id: 'restaurant-id',
    name: 'Restoran Adı',
    name_en: 'Restaurant Name',
    description: 'Restoran açıklaması',
    description_en: 'Restaurant description',
    logo: 'https://example.com/logo.png', // Opsiyonel
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseKey: 'your-anon-key'
}
```

**Supabase URL ve Key Nasıl Bulunur:**
1. Supabase projenize giriş yapın
2. Settings > API bölümüne gidin
3. `Project URL` ve `anon public` key'i kopyalayın

### 4. QR Kod Oluşturma

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

### Renkler

Renkleri değiştirmek için `css/style.css` dosyasındaki CSS değişkenlerini düzenleyin:

```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    /* ... */
}
```

### Stil

Tüm stiller `css/style.css` ve `css/responsive.css` dosyalarında bulunur. İstediğiniz gibi özelleştirebilirsiniz.

## Sorun Giderme

### Menü Yüklenmiyor

1. Supabase URL ve Key'in doğru olduğundan emin olun
2. Supabase'de RLS politikalarının doğru ayarlandığını kontrol edin
3. Tarayıcı konsolunda hata mesajlarını kontrol edin

### QR Kod Çalışmıyor

1. QR kod URL'sinin doğru formatta olduğundan emin olun
2. GitHub Pages'in aktif olduğunu kontrol edin
3. URL'de restoran ID'sinin doğru olduğundan emin olun

## Lisans

Bu proje açık kaynaklıdır ve serbestçe kullanılabilir.

## Destek

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.


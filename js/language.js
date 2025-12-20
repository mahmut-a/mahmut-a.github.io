// Dil Yönetim Sistemi (TR/EN)

const translations = {
    tr: {
        'app-title': 'QR Menü',
        'restaurants-title': 'Restoranlar',
        'menu-title': 'Menü',
        'loading': 'Yükleniyor...',
        'error-loading': 'Yüklenirken bir hata oluştu',
        'no-restaurants': 'Henüz restoran bulunmamaktadır',
        'no-menu': 'Menü bulunamadı',
        'no-categories': 'Kategori bulunamadı',
        'no-products': 'Ürün bulunamadı',
        'try-again': 'Tekrar Deneyin',
        'cart-title': 'Sepet',
        'total': 'Toplam:',
        'clear-cart': 'Sepeti Temizle',
        'empty-cart': 'Sepetiniz boş',
        'add-to-cart': 'Sepete Ekle',
        'remove-from-cart': 'Sepetten Çıkar',
        'whatsapp-order': 'WhatsApp ile Sipariş Ver',
        'order-contact-info': 'İletişim Bilgileri',
        'order-name': 'Ad Soyad',
        'order-phone': 'Telefon',
        'order-address': 'Adres',
        'order-submit': 'Siparişi Gönder',
        'order-cancel': 'İptal',
        'order-required-field': 'Bu alan zorunludur',
        'order-invalid-phone': 'Geçerli bir telefon numarası girin',
        'order-sending': 'Gönderiliyor...',
        'order-success': 'Siparişiniz başarıyla gönderildi!'
    },
    en: {
        'app-title': 'QR Menu',
        'restaurants-title': 'Restaurants',
        'menu-title': 'Menu',
        'loading': 'Loading...',
        'error-loading': 'An error occurred while loading',
        'no-restaurants': 'No restaurants found yet',
        'no-menu': 'Menu not found',
        'no-categories': 'No categories found',
        'no-products': 'No products found',
        'try-again': 'Try Again',
        'cart-title': 'Cart',
        'total': 'Total:',
        'clear-cart': 'Clear Cart',
        'empty-cart': 'Your cart is empty',
        'add-to-cart': 'Add to Cart',
        'remove-from-cart': 'Remove from Cart',
        'whatsapp-order': 'Order via WhatsApp',
        'order-contact-info': 'Contact Information',
        'order-name': 'Full Name',
        'order-phone': 'Phone',
        'order-address': 'Address',
        'order-submit': 'Submit Order',
        'order-cancel': 'Cancel',
        'order-required-field': 'This field is required',
        'order-invalid-phone': 'Enter a valid phone number',
        'order-sending': 'Sending...',
        'order-success': 'Your order has been sent successfully!'
    }
};

// Mevcut dili localStorage'dan al veya varsayılan olarak 'tr' kullan
let currentLanguage = localStorage.getItem('language') || 'tr';

// Dil değiştirme fonksiyonu
function changeLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        translatePage();
        updateLanguageToggle();
        
        // Dil değişikliği event'i fırlat
        const event = new CustomEvent('languageChanged', { detail: { language: lang } });
        document.dispatchEvent(event);
    }
}

// Sayfayı çevir
function translatePage() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[currentLanguage][key];
            } else {
                element.textContent = translations[currentLanguage][key];
            }
        }
    });
}

// Dil değiştirme butonunu güncelle
function updateLanguageToggle() {
    const toggle = document.getElementById('language-toggle');
    const currentLangSpan = document.getElementById('current-lang');
    if (toggle && currentLangSpan) {
        currentLangSpan.textContent = currentLanguage.toUpperCase();
    }
}

// Çeviri anahtarına göre metin al
function t(key) {
    return translations[currentLanguage][key] || translations['tr'][key] || key;
}

// Sayfa yüklendiğinde çeviriyi uygula
document.addEventListener('DOMContentLoaded', () => {
    translatePage();
    updateLanguageToggle();

    // Dil değiştirme butonu event listener
    const toggle = document.getElementById('language-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const newLang = currentLanguage === 'tr' ? 'en' : 'tr';
            changeLanguage(newLang);
        });
    }
});

// Mevcut dili döndür
function getCurrentLanguage() {
    return currentLanguage;
}


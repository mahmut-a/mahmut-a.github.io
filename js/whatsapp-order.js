// WhatsApp Sipariş Modülü
// Sepet içeriğini WhatsApp mesajı formatına dönüştürür ve WhatsApp Web linki oluşturur

// Sipariş mesajını formatla
function formatOrderMessage(cartItems, restaurantConfig, customerInfo) {
    const currentLang = getCurrentLanguage();
    const restaurantName = currentLang === 'en' && restaurantConfig.name_en ? restaurantConfig.name_en : restaurantConfig.name;
    
    // Tarih ve saat formatla
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    // Sipariş mesajı başlığı
    let message = '🍽️ *' + (currentLang === 'en' ? 'Order' : 'Sipariş') + '*\n\n';
    
    // Tarih ve restoran bilgisi
    message += '📅 ' + (currentLang === 'en' ? 'Date' : 'Tarih') + ': ' + dateStr + ' ' + timeStr + '\n';
    message += '🏪 ' + (currentLang === 'en' ? 'Restaurant' : 'Restoran') + ': ' + restaurantName + '\n\n';
    
    // Müşteri bilgileri
    if (customerInfo) {
        message += '👤 *' + (currentLang === 'en' ? 'Customer Information' : 'Müşteri Bilgileri') + ':*\n';
        message += (currentLang === 'en' ? 'Full Name' : 'Ad Soyad') + ': ' + customerInfo.name + '\n';
        message += (currentLang === 'en' ? 'Phone' : 'Telefon') + ': ' + customerInfo.phone + '\n';
        message += (currentLang === 'en' ? 'Address' : 'Adres') + ': ' + customerInfo.address + '\n\n';
    }
    
    // Sipariş detayları
    message += '📦 *' + (currentLang === 'en' ? 'Order Details' : 'Sipariş Detayları') + ':*\n';
    
    cartItems.forEach(item => {
        const itemName = currentLang === 'en' && item.name_en ? item.name_en : item.name;
        const itemTotal = item.price * item.quantity;
        message += '• ' + itemName + ' x' + item.quantity + ' - ' + formatPrice(itemTotal) + '\n';
    });
    
    // Toplam
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += '\n💰 *' + (currentLang === 'en' ? 'Total' : 'Toplam') + ': ' + formatPrice(total) + '*\n\n';
    
    // Teşekkür mesajı
    message += (currentLang === 'en' ? 'Thank you!' : 'Teşekkürler!') + ' 🙏';
    
    return message;
}

// WhatsApp Web linki oluştur
function createWhatsAppLink(phoneNumber, message) {
    // Telefon numarasından + ve boşlukları temizle
    const cleanPhone = phoneNumber.replace(/[\s\+\-\(\)]/g, '');
    
    // Mesajı URL encode et
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp Web linki oluştur
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

// Siparişi WhatsApp API ile gönder
async function sendOrderViaAPI(cartItems, restaurantConfig, customerInfo) {
    if (!restaurantConfig.whatsapp_api_url) {
        throw new Error('WhatsApp API URL bulunamadı');
    }
    
    if (!restaurantConfig.whatsapp_number) {
        throw new Error('WhatsApp numarası bulunamadı');
    }
    
    // Sipariş mesajını formatla
    const orderMessage = formatOrderMessage(cartItems, restaurantConfig, customerInfo);
    
    // API isteği için payload hazırla
    const payload = {
        phone: restaurantConfig.whatsapp_number,
        message: orderMessage,
        customer: customerInfo
    };
    
    // API headers
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // API key varsa header'a ekle
    if (restaurantConfig.whatsapp_api_key) {
        headers['Authorization'] = `Bearer ${restaurantConfig.whatsapp_api_key}`;
        // Veya farklı bir format kullanılıyorsa:
        // headers['X-API-Key'] = restaurantConfig.whatsapp_api_key;
    }
    
    try {
        const response = await fetch(restaurantConfig.whatsapp_api_url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'API hatası' }));
            throw new Error(errorData.message || `API hatası: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('WhatsApp API hatası:', error);
        throw error;
    }
}

// Siparişi WhatsApp'a gönder (API veya Web linki)
async function sendOrderToWhatsApp(cartItems, restaurantConfig, customerInfo) {
    if (!restaurantConfig.whatsapp_number) {
        console.error('WhatsApp numarası bulunamadı');
        return { success: false, error: 'WhatsApp numarası bulunamadı' };
    }
    
    if (!cartItems || cartItems.length === 0) {
        console.error('Sepet boş');
        return { success: false, error: 'Sepet boş' };
    }
    
    // API kullanılıyorsa
    if (restaurantConfig.whatsapp_api_enabled && restaurantConfig.whatsapp_api_url) {
        try {
            const result = await sendOrderViaAPI(cartItems, restaurantConfig, customerInfo);
            return { success: true, method: 'api', data: result };
        } catch (error) {
            console.error('API ile gönderim başarısız, Web linki deneniyor:', error);
            // API başarısız olursa Web linkine fallback
            // Fallback kodu aşağıda
        }
    }
    
    // Web linki kullan (varsayılan veya API başarısız olduğunda)
    const orderMessage = formatOrderMessage(cartItems, restaurantConfig, customerInfo);
    const whatsappLink = createWhatsAppLink(restaurantConfig.whatsapp_number, orderMessage);
    window.open(whatsappLink, '_blank');
    
    return { success: true, method: 'web', link: whatsappLink };
}

// Telefon numarası formatını kontrol et
function validatePhoneNumber(phone) {
    if (!phone) return false;
    
    // Telefon numarasından boşluk, tire, parantez gibi karakterleri temizle
    const cleanPhone = phone.replace(/[\s\+\-\(\)]/g, '');
    
    // Sadece rakam olmalı ve en az 10 karakter olmalı
    return /^\d{10,15}$/.test(cleanPhone);
}

// Telefon numarasını formatla (görüntüleme için)
function formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Sadece rakamları al
    const digits = phone.replace(/\D/g, '');
    
    // Türkiye formatı: 0XXX XXX XX XX
    if (digits.length === 11 && digits.startsWith('0')) {
        return digits.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    
    // Uluslararası format: +90 XXX XXX XX XX
    if (digits.length === 12 && digits.startsWith('90')) {
        return '+' + digits.replace(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    
    return phone;
}


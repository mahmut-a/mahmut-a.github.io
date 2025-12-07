// Sepet Yönetimi Modülü
// Ürün ekleme, çıkarma, toplam hesaplama ve localStorage yönetimi

const CART_STORAGE_KEY = 'qrmenu_cart';

// Sepet verisi
let cart = [];

// Sepet event'leri için custom event
const cartEvents = {
    updated: new CustomEvent('cartUpdated'),
    cleared: new CustomEvent('cartCleared')
};

// Sepeti localStorage'dan yükle
function loadCart() {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            cart = JSON.parse(stored);
        } else {
            cart = [];
        }
    } catch (error) {
        console.error('Sepet yüklenirken hata:', error);
        cart = [];
    }
}

// Sepeti localStorage'a kaydet
function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        // Sepet güncellendi event'i fırlat
        document.dispatchEvent(cartEvents.updated);
    } catch (error) {
        console.error('Sepet kaydedilirken hata:', error);
    }
}

// Sepeti temizle
function clearCart() {
    cart = [];
    saveCart();
    document.dispatchEvent(cartEvents.cleared);
}

// Ürünü sepete ekle
function addToCart(product, quantity = 1) {
    if (!product || !product.id) {
        console.error('Geçersiz ürün');
        return;
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        // Ürün zaten sepette, miktarı artır
        existingItem.quantity += quantity;
    } else {
        // Yeni ürün ekle
        cart.push({
            id: product.id,
            name: product.name,
            name_en: product.name_en || product.name,
            price: parseFloat(product.price) || 0,
            quantity: quantity,
            image_url: product.image_url || null
        });
    }

    saveCart();
}

// Üründen sepete çıkar (miktarı azalt)
function removeFromCart(productId, quantity = 1) {
    const item = cart.find(item => item.id === productId);

    if (!item) {
        return;
    }

    item.quantity -= quantity;

    // Miktar 0 veya daha azsa sepette çıkar
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
}

// Ürünü sepette tamamen çıkar
function removeItemFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

// Sepetteki ürün miktarını güncelle
function updateCartItemQuantity(productId, quantity) {
    if (quantity <= 0) {
        removeItemFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        saveCart();
    }
}

// Sepetteki ürün miktarını al
function getCartItemQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
}

// Sepetteki toplam ürün sayısını al
function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Sepetteki toplam fiyatı hesapla
function getCartTotal() {
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// Sepetteki tüm ürünleri al
function getCartItems() {
    return [...cart]; // Kopya döndür
}

// Sepet boş mu kontrol et
function isCartEmpty() {
    return cart.length === 0;
}

// Fiyat formatla
function formatPrice(price) {
    if (!price) return '';
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

// Sepeti başlat (sayfa yüklendiğinde çağrılır)
function initCart() {
    loadCart();
}

// Sayfa yüklendiğinde sepeti başlat
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initCart();
    });
}


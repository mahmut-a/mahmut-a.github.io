// Menü Sayfası JavaScript

let menuData = null;
let restaurantConfig = null;

// Menü içeriğini render et
function renderMenu() {
    const menuContainer = document.getElementById('menu-container');
    const restaurantNameElement = document.getElementById('restaurant-name');

    if (!menuData || !restaurantConfig) return;

    // Restoran adını güncelle
    const currentLang = getCurrentLanguage();
    const restaurantName = currentLang === 'en' && restaurantConfig.name_en ? restaurantConfig.name_en : restaurantConfig.name;
    restaurantNameElement.textContent = restaurantName;

    if (!menuData || menuData.length === 0) {
        menuContainer.innerHTML = `
            <div class="empty-state">
                <h3>${t('no-categories')}</h3>
            </div>
        `;
        return;
    }

    // Menü içeriğini oluştur
    menuContainer.innerHTML = menuData.map(category => {
        const categoryName = getCurrentLanguage() === 'en' && category.name_en ? category.name_en : category.name;
        
        if (!category.products || category.products.length === 0) {
            return '';
        }

        const productsHtml = category.products.map(product => {
            const productName = getCurrentLanguage() === 'en' && product.name_en ? product.name_en : product.name;
            const productDescription = getCurrentLanguage() === 'en' && product.description_en ? product.description_en : product.description;
            const cartQuantity = getCartItemQuantity(product.id);

            return `
                <div class="product-card" data-product-id="${product.id}">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${productName}" class="product-image">` : '<div class="product-image"></div>'}
                    <div class="product-content">
                        <h3 class="product-name">${productName}</h3>
                        ${productDescription ? `<p class="product-description">${productDescription}</p>` : ''}
                        <div class="product-price">${formatPrice(product.price)}</div>
                        <div class="product-quantity-controls">
                            <button class="product-quantity-btn" onclick="decreaseProductQuantity('${product.id}')" aria-label="Azalt">−</button>
                            <span class="product-quantity-display" id="quantity-${product.id}">${cartQuantity}</span>
                            <button class="product-quantity-btn" onclick="increaseProductQuantity('${product.id}')" aria-label="Artır">+</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="category-section">
                <h2 class="category-title">${categoryName}</h2>
                <div class="products-grid">
                    ${productsHtml}
                </div>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    // Tüm cache'leri temizle (restoran menüsü açıldığında)
    clearRestaurantsCache();
    // Sepet cache'ini temizleme - kullanıcı deneyimi için sepet korunmalı
    // clearCart(); // Yorum satırına alındı - sepet korunmalı
    
    const menuContainer = document.getElementById('menu-container');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');

    // URL parametrelerinden restoran ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('restaurant');

    // Eğer restoran ID'si yoksa hata göster
    if (!restaurantId) {
        loading.style.display = 'none';
        errorDiv.textContent = t('no-menu');
        errorDiv.style.display = 'block';
        return;
    }

    // Restoran yapılandırmasını al (async)
    restaurantConfig = await getRestaurantById(restaurantId);
    if (!restaurantConfig) {
        loading.style.display = 'none';
        errorDiv.textContent = t('no-menu');
        errorDiv.style.display = 'block';
        return;
    }

    try {
        // Supabase istemcisini başlat
        initSupabaseClient(restaurantConfig);

        // Tema ayarlarını uygula (veritabanından veya config'den)
        const centralClient = getCentralSupabaseClient();
        await loadAndApplyTheme(restaurantConfig, centralClient);

        // Menü verilerini yükle
        menuData = await fetchMenuData();

        // Menüyü render et
        renderMenu();

        // Sepet UI'sını başlat
        initCartUI();

        loading.style.display = 'none';
    } catch (error) {
        console.error('Menü yüklenirken hata:', error);
        loading.style.display = 'none';
        errorDiv.textContent = `${t('error-loading')}: ${error.message}`;
        errorDiv.style.display = 'block';
    }
});

// Dil değiştiğinde menüyü yeniden render et
document.addEventListener('languageChanged', () => {
    renderMenu();
    renderCart();
});

// Sepet güncellendiğinde UI'ı güncelle
document.addEventListener('cartUpdated', () => {
    updateCartUI();
    updateProductQuantities();
    renderCart();
});

// Ürün miktarını artır
function increaseProductQuantity(productId) {
    const product = findProductById(productId);
    if (product) {
        addToCart(product, 1);
    } else {
        console.error('Ürün bulunamadı:', productId);
        console.log('MenuData:', menuData);
    }
}

// Ürün miktarını azalt
function decreaseProductQuantity(productId) {
    removeFromCart(productId, 1);
}

// Ürün ID'sine göre ürün bul
function findProductById(productId) {
    if (!menuData) {
        console.warn('menuData henüz yüklenmedi');
        return null;
    }
    
    for (const category of menuData) {
        if (category.products && Array.isArray(category.products)) {
            const product = category.products.find(p => p.id === productId);
            if (product) {
                return product;
            }
        }
    }
    
    console.warn('Ürün bulunamadı:', productId);
    return null;
}

// Ürün miktarlarını güncelle
function updateProductQuantities() {
    if (!menuData) return;
    
    menuData.forEach(category => {
        if (category.products) {
            category.products.forEach(product => {
                const quantityElement = document.getElementById(`quantity-${product.id}`);
                if (quantityElement) {
                    const quantity = getCartItemQuantity(product.id);
                    quantityElement.textContent = quantity;
                }
            });
        }
    });
}

// Sepet UI'sını başlat
function initCartUI() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClear = document.getElementById('cart-clear');

    if (cartToggle) {
        cartToggle.addEventListener('click', toggleCart);
    }

    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    if (cartClear) {
        cartClear.addEventListener('click', () => {
            if (confirm(t('clear-cart') + '?')) {
                clearCart();
            }
        });
    }

    // İlk render
    updateCartUI();
    renderCart();
    
    // WhatsApp sipariş butonu ve modal entegrasyonu
    initWhatsAppOrder();
}

// Sepeti aç/kapat
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// Sepeti kapat
function closeCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// Sepet UI'sını güncelle (buton, sayı vb.)
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartToggle = document.getElementById('cart-toggle');
    
    const count = getCartItemCount();
    
    if (cartCount) {
        cartCount.textContent = count;
        if (count === 0) {
            cartCount.style.display = 'none';
        } else {
            cartCount.style.display = 'flex';
        }
    }

    if (cartToggle) {
        if (count === 0) {
            cartToggle.style.opacity = '0.7';
        } else {
            cartToggle.style.opacity = '1';
        }
    }
}

// Sepet içeriğini render et
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    if (!cartItems) return;

    const items = getCartItems();
    const total = getCartTotal();
    const currentLang = getCurrentLanguage();

    if (items.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <p>${t('empty-cart')}</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = items.map(item => {
            const itemName = currentLang === 'en' && item.name_en ? item.name_en : item.name;
            
            return `
                <div class="cart-item">
                    ${item.image_url ? `<img src="${item.image_url}" alt="${itemName}" class="cart-item-image">` : '<div class="cart-item-image"></div>'}
                    <div class="cart-item-content">
                        <div class="cart-item-name">${itemName}</div>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="decreaseProductQuantity('${item.id}')">−</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="increaseProductQuantity('${item.id}')">+</button>
                            <button class="cart-item-remove" onclick="removeItemFromCart('${item.id}')" aria-label="${t('remove-from-cart')}">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (cartTotalPrice) {
        cartTotalPrice.textContent = formatPrice(total);
    }
}

// Fiyat formatla
function formatPrice(price) {
    if (!price) return '';
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

// WhatsApp Sipariş Entegrasyonu
function initWhatsAppOrder() {
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    const orderModal = document.getElementById('order-modal');
    const orderModalClose = document.getElementById('order-modal-close');
    const orderModalOverlay = document.querySelector('.order-modal-overlay');
    const orderForm = document.getElementById('order-form');
    const orderCancelBtn = document.getElementById('order-cancel-btn');
    
    // WhatsApp butonu görünürlüğünü kontrol et
    updateWhatsAppButtonVisibility();
    
    // WhatsApp butonu event listener
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (!isCartEmpty()) {
                openOrderModal();
            }
        });
    }
    
    // Modal kapatma
    if (orderModalClose) {
        orderModalClose.addEventListener('click', closeOrderModal);
    }
    
    if (orderModalOverlay) {
        orderModalOverlay.addEventListener('click', closeOrderModal);
    }
    
    if (orderCancelBtn) {
        orderCancelBtn.addEventListener('click', closeOrderModal);
    }
    
    // Form submit
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    // Sepet güncellendiğinde buton görünürlüğünü güncelle
    document.addEventListener('cartUpdated', () => {
        updateWhatsAppButtonVisibility();
    });
}

// WhatsApp butonu görünürlüğünü güncelle
function updateWhatsAppButtonVisibility() {
    const whatsappBtn = document.getElementById('whatsapp-order-btn');
    
    if (!whatsappBtn || !restaurantConfig) {
        return;
    }
    
    // Sadece whatsapp_order_enabled = true ve sepet dolu ise göster
    const isEnabled = restaurantConfig.whatsapp_order_enabled === true;
    const hasItems = !isCartEmpty();
    
    if (isEnabled && hasItems) {
        whatsappBtn.style.display = 'flex';
    } else {
        whatsappBtn.style.display = 'none';
    }
}

// Sipariş modalını aç
function openOrderModal() {
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        orderModal.classList.add('active');
        // Formu temizle
        resetOrderForm();
        // İlk input'a focus
        const firstInput = document.getElementById('order-name');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Sipariş modalını kapat
function closeOrderModal() {
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        orderModal.classList.remove('active');
        resetOrderForm();
    }
}

// Formu sıfırla
function resetOrderForm() {
    const form = document.getElementById('order-form');
    if (form) {
        form.reset();
        // Hata mesajlarını temizle
        clearFormErrors();
    }
}

// Form hatalarını temizle
function clearFormErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
    });
    
    const errorInputs = document.querySelectorAll('.form-group input.error, .form-group textarea.error');
    errorInputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Form validasyonu
function validateOrderForm() {
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const address = document.getElementById('order-address').value.trim();
    
    let isValid = true;
    
    // Ad Soyad kontrolü
    if (!name) {
        showFieldError('order-name', 'error-name', t('order-required-field'));
        isValid = false;
    } else {
        clearFieldError('order-name', 'error-name');
    }
    
    // Telefon kontrolü
    if (!phone) {
        showFieldError('order-phone', 'error-phone', t('order-required-field'));
        isValid = false;
    } else if (!validatePhoneNumber(phone)) {
        showFieldError('order-phone', 'error-phone', t('order-invalid-phone'));
        isValid = false;
    } else {
        clearFieldError('order-phone', 'error-phone');
    }
    
    // Adres kontrolü
    if (!address) {
        showFieldError('order-address', 'error-address', t('order-required-field'));
        isValid = false;
    } else {
        clearFieldError('order-address', 'error-address');
    }
    
    return isValid;
}

// Alan hatası göster
function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    
    if (input) {
        input.classList.add('error');
    }
    
    if (error) {
        error.textContent = message;
    }
}

// Alan hatasını temizle
function clearFieldError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    
    if (input) {
        input.classList.remove('error');
    }
    
    if (error) {
        error.textContent = '';
    }
}

// Form submit işlemi
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    // Validasyon
    if (!validateOrderForm()) {
        return;
    }
    
    // Submit butonunu devre dışı bırak
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = t('order-sending') || 'Gönderiliyor...';
    }
    
    try {
        // Müşteri bilgilerini al
        const customerInfo = {
            name: document.getElementById('order-name').value.trim(),
            phone: document.getElementById('order-phone').value.trim(),
            address: document.getElementById('order-address').value.trim()
        };
        
        // Sepet içeriğini al
        const cartItems = getCartItems();
        
        // WhatsApp'a gönder
        const result = await sendOrderToWhatsApp(cartItems, restaurantConfig, customerInfo);
        
        // Modalı kapat
        closeOrderModal();
        
        // Başarı bildirimi göster
        if (result.success) {
            showOrderSuccessNotification();
            
            // API ile gönderildiyse sepeti temizle
            if (result.method === 'api') {
                clearCart();
            }
        } else {
            showOrderErrorNotification(result.error || 'Sipariş gönderilemedi');
        }
    } catch (error) {
        console.error('Sipariş gönderilirken hata:', error);
        showOrderErrorNotification(error.message || 'Sipariş gönderilemedi');
    } finally {
        // Submit butonunu tekrar aktif et
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// Sipariş başarı bildirimi göster
function showOrderSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'order-notification success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-message">${t('order-success') || 'Siparişiniz başarıyla gönderildi!'}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animasyon için
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Sipariş hata bildirimi göster
function showOrderErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'order-notification error';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">❌</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animasyon için
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 5 saniye sonra kaldır
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}


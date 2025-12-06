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

            return `
                <div class="product-card">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${productName}" class="product-image">` : '<div class="product-image"></div>'}
                    <div class="product-content">
                        <h3 class="product-name">${productName}</h3>
                        ${productDescription ? `<p class="product-description">${productDescription}</p>` : ''}
                        <div class="product-price">${formatPrice(product.price)}</div>
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

    // Restoran yapılandırmasını al
    restaurantConfig = getRestaurantById(restaurantId);
    if (!restaurantConfig) {
        loading.style.display = 'none';
        errorDiv.textContent = t('no-menu');
        errorDiv.style.display = 'block';
        return;
    }

    try {
        // Supabase istemcisini başlat
        initSupabaseClient(restaurantConfig);

        // Menü verilerini yükle
        menuData = await fetchMenuData();

        // Menüyü render et
        renderMenu();

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
});

// Fiyat formatla
function formatPrice(price) {
    if (!price) return '';
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}


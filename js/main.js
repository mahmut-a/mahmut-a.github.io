// Ana Sayfa JavaScript

// Restoran listesini render et
async function renderRestaurants() {
    const restaurantsContainer = document.getElementById('restaurants-container');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');

    try {
        // Restoranları yükle (async)
        const restaurants = await getAllRestaurants();

        if (restaurants.length === 0) {
            loading.style.display = 'none';
            restaurantsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>${t('no-restaurants')}</h3>
                </div>
            `;
            return;
        }

        // Restoran kartlarını oluştur
        restaurantsContainer.innerHTML = restaurants.map(restaurant => {
            const currentLang = getCurrentLanguage();
            const name = currentLang === 'en' && restaurant.name_en ? restaurant.name_en : restaurant.name;
            const description = currentLang === 'en' && restaurant.description_en ? restaurant.description_en : restaurant.description;

            return `
                <div class="restaurant-card" onclick="goToMenu('${restaurant.id}')">
                    ${restaurant.logo ? `<img src="${restaurant.logo}" alt="${name}" class="restaurant-card-image">` : '<div class="restaurant-card-image"></div>'}
                    <div class="restaurant-card-content">
                        <h3>${name}</h3>
                        <p>${description}</p>
                    </div>
                </div>
            `;
        }).join('');

        loading.style.display = 'none';
    } catch (error) {
        console.error('Restoranlar yüklenirken hata:', error);
        loading.style.display = 'none';
        errorDiv.textContent = `${t('error-loading')}: ${error.message || error}`;
        errorDiv.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderRestaurants();
});

// Dil değiştiğinde restoran listesini yeniden render et
document.addEventListener('languageChanged', () => {
    renderRestaurants();
});

// Menü sayfasına yönlendir
function goToMenu(restaurantId) {
    window.location.href = `menu.html?restaurant=${restaurantId}`;
}


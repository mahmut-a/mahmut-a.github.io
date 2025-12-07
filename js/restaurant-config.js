// Restoran Yapılandırma Dosyası
// Merkezi Supabase'den restoran yapılandırmalarını çeker

// Merkezi Supabase bağlantı bilgileri
// Bu değerleri .env dosyasından veya environment variables'dan alabilirsiniz
// Production'da bu değerler build time'da inject edilmeli
const CENTRAL_SUPABASE_URL = window.CENTRAL_SUPABASE_URL || 'https://msyhtxtjtpebdcubxboa.supabase.co';
const CENTRAL_SUPABASE_KEY = window.CENTRAL_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeWh0eHRqdHBlYmRjdWJ4Ym9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDQ2MzIsImV4cCI6MjA4MDY4MDYzMn0.rhXFr6aS0OdnPrUMGIOkF9SZ-PaoRwzW3vq8VxCmij8';

// Merkezi Supabase istemcisi
let centralSupabaseClient = null;

// Merkezi Supabase istemcisini başlat
function initCentralSupabaseClient() {
    if (!centralSupabaseClient) {
        centralSupabaseClient = supabase.createClient(
            CENTRAL_SUPABASE_URL,
            CENTRAL_SUPABASE_KEY
        );
    }
    return centralSupabaseClient;
}

// Restoran yapılandırmalarını cache'le
let restaurantsCache = null;
let restaurantsCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// Tüm restoranları merkezi Supabase'den getir
async function fetchAllRestaurants() {
    try {
        const client = initCentralSupabaseClient();
        
        const { data, error } = await client
            .from('restaurants')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Restoranlar yüklenirken hata:', error);
            throw error;
        }

        // Veriyi formatla (theme_id ile birlikte)
        const formattedRestaurants = (data || []).map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            name_en: restaurant.name_en || restaurant.name,
            description: restaurant.description || '',
            description_en: restaurant.description_en || restaurant.description || '',
            logo: restaurant.logo || null,
            supabaseUrl: restaurant.supabase_url,
            supabaseKey: restaurant.supabase_key,
            theme_id: restaurant.theme_id || null
        }));

        // Cache'e kaydet
        restaurantsCache = formattedRestaurants;
        restaurantsCacheTime = Date.now();

        return formattedRestaurants;
    } catch (error) {
        console.error('Restoranlar yüklenirken hata:', error);
        
        // Hata durumunda cache'den dön
        if (restaurantsCache) {
            console.warn('Cache\'den restoran verileri kullanılıyor');
            return restaurantsCache;
        }
        
        throw error;
    }
}

// Cache'den restoranları getir (eğer geçerliyse)
function getCachedRestaurants() {
    if (restaurantsCache && restaurantsCacheTime) {
        const now = Date.now();
        if (now - restaurantsCacheTime < CACHE_DURATION) {
            return restaurantsCache;
        }
    }
    return null;
}

// Tüm restoranları listeleme fonksiyonu
async function getAllRestaurants() {
    // Önce cache'i kontrol et
    const cached = getCachedRestaurants();
    if (cached) {
        return cached;
    }
    
    // Cache yoksa veya süresi dolmuşsa fetch et
    return await fetchAllRestaurants();
}

// ID'ye göre restoran bulma fonksiyonu
async function getRestaurantById(id) {
    // Önce cache'i kontrol et
    const cached = getCachedRestaurants();
    if (cached) {
        const restaurant = cached.find(r => r.id === id);
        if (restaurant) {
            return restaurant;
        }
    }
    
    // Cache'de yoksa veya süresi dolmuşsa fetch et
    const restaurants = await fetchAllRestaurants();
    return restaurants.find(r => r.id === id) || null;
}

// Senkron versiyon (cache'den döner, eğer cache yoksa null döner)
// Bu fonksiyon sayfa ilk yüklendiğinde kullanılabilir
function getAllRestaurantsSync() {
    return restaurantsCache || [];
}

function getRestaurantByIdSync(id) {
    if (!restaurantsCache) return null;
    return restaurantsCache.find(r => r.id === id) || null;
}

// Cache'i temizle
function clearRestaurantsCache() {
    restaurantsCache = null;
    restaurantsCacheTime = null;
}

// Merkezi Supabase istemcisini döndür (diğer modüller için)
function getCentralSupabaseClient() {
    return initCentralSupabaseClient();
}

// Sayfa yüklendiğinde restoranları önceden yükle
if (typeof window !== 'undefined') {
    // Sayfa yüklendiğinde restoranları arka planda yükle
    document.addEventListener('DOMContentLoaded', () => {
        fetchAllRestaurants().catch(error => {
            console.error('Restoranlar önceden yüklenirken hata:', error);
        });
    });
}

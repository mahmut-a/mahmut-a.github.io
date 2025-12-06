// Supabase İstemci Yönetimi
// Her restoran için dinamik Supabase bağlantısı oluşturur

let supabaseClient = null;
let currentRestaurantConfig = null;

// Restoran yapılandırmasına göre Supabase istemcisi başlat
function initSupabaseClient(restaurantConfig) {
    if (!restaurantConfig || !restaurantConfig.supabaseUrl || !restaurantConfig.supabaseKey) {
        throw new Error('Geçersiz restoran yapılandırması');
    }

    currentRestaurantConfig = restaurantConfig;
    
    // Yeni Supabase istemcisi oluştur
    supabaseClient = supabase.createClient(
        restaurantConfig.supabaseUrl,
        restaurantConfig.supabaseKey
    );

    return supabaseClient;
}

// Kategorileri getir
async function fetchCategories() {
    if (!supabaseClient) {
        throw new Error('Supabase istemcisi başlatılmamış');
    }

    try {
        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
        throw error;
    }
}

// Ürünleri getir
async function fetchProducts(categoryId = null) {
    if (!supabaseClient) {
        throw new Error('Supabase istemcisi başlatılmamış');
    }

    try {
        let query = supabaseClient
            .from('products')
            .select('*');

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query.order('display_order', { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        throw error;
    }
}

// Kategorileri ve ürünlerini birlikte getir
async function fetchMenuData() {
    try {
        const categories = await fetchCategories();
        const allProducts = await fetchProducts();

        // Ürünleri kategori ID'sine göre grupla
        const menuData = categories.map(category => ({
            ...category,
            products: allProducts.filter(product => product.category_id === category.id)
        }));

        return menuData;
    } catch (error) {
        console.error('Menü verileri yüklenirken hata:', error);
        throw error;
    }
}

// Mevcut restoran yapılandırmasını al
function getCurrentRestaurantConfig() {
    return currentRestaurantConfig;
}


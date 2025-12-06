// Restoran Yapılandırma Dosyası
// Her restoran için Supabase bağlantı bilgileri burada saklanır

const RESTAURANTS_CONFIG = {
    // Örnek Restoran 1
    'nalonaRestoran': {
        id: 'nalonaRestoran',
        name: 'Nalona Restoran',
        name_en: 'Nalona Restoran',
        description: 'Lezzetli yemekler ve sıcak bir atmosfer',
        description_en: 'Delicious food and warm atmosphere',
        logo: null, // Logo URL'si buraya eklenebilir
        supabaseUrl: 'https://ysahpcvlquczubwywinh.supabase.co', // Restoranın Supabase URL'si
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYWhwY3ZscXVjenVid3l3aW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDQ3NzAsImV4cCI6MjA4MDYyMDc3MH0.Lm35XQYU1r0A-FvOP-dOtyu5yONVfHFjY4H2__JLIkk' // Restoranın Supabase anon key'i
    },

    // Örnek Restoran 2
    'aydinLahmacun': {
        id: 'aydinLahmacun',
        name: 'Aydın Lahmacun',
        name_en: 'Aydın Lahmacun',
        description: 'Vartonun Lahmacuncusu',
        description_en: 'Traditional flavors, modern presentation',
        logo: null,
        supabaseUrl: 'https://ysahpcvlquczubwywinh.supabase.co', // Restoranın Supabase URL'si
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYWhwY3ZscXVjenVid3l3aW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDQ3NzAsImV4cCI6MjA4MDYyMDc3MH0.Lm35XQYU1r0A-FvOP-dOtyu5yONVfHFjY4H2__JLIkk' // Restoranın Supabase anon key'i
    }

    // Yeni restoran eklemek için buraya yeni bir giriş ekleyin
    // 'restaurant-3': {
    //     id: 'restaurant-3',
    //     name: 'Yeni Restoran',
    //     name_en: 'New Restaurant',
    //     description: 'Açıklama',
    //     description_en: 'Description',
    //     logo: null,
    //     supabaseUrl: 'https://xxx.supabase.co',
    //     supabaseKey: 'xxx'
    // }
};

// Tüm restoranları listeleme fonksiyonu
function getAllRestaurants() {
    return Object.values(RESTAURANTS_CONFIG);
}

// ID'ye göre restoran bulma fonksiyonu
function getRestaurantById(id) {
    return RESTAURANTS_CONFIG[id] || null;
}


// Tema Yönetimi Modülü
// CSS custom properties kullanarak dinamik tema uygulama
// Veritabanından tema çekme desteği

// Varsayılan tema ayarları
const defaultTheme = {
    primaryColor: '#2c3e50',
    secondaryColor: '#3498db',
    accentColor: '#e74c3c',
    textColor: '#333',
    textLight: '#666',
    bgColor: '#f8f9fa',
    cardBg: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: '12px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
};

// Tema cache
let themesCache = new Map();

// Tema ayarlarını uygula
function applyTheme(themeConfig) {
    if (!themeConfig || typeof themeConfig !== 'object') {
        console.warn('Geçersiz tema yapılandırması, varsayılan tema kullanılıyor');
        applyTheme(defaultTheme);
        return;
    }

    // Tema ayarlarını varsayılanlarla birleştir
    const theme = { ...defaultTheme, ...themeConfig };
    
    // CSS custom properties'i güncelle
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', theme.primaryColor || defaultTheme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor || defaultTheme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor || defaultTheme.accentColor);
    root.style.setProperty('--text-color', theme.textColor || defaultTheme.textColor);
    root.style.setProperty('--text-light', theme.textLight || defaultTheme.textLight);
    root.style.setProperty('--bg-color', theme.bgColor || defaultTheme.bgColor);
    root.style.setProperty('--card-bg', theme.cardBg || defaultTheme.cardBg);
    root.style.setProperty('--border-color', theme.borderColor || defaultTheme.borderColor);
    root.style.setProperty('--border-radius', theme.borderRadius || defaultTheme.borderRadius);
    root.style.setProperty('--font-family', theme.fontFamily || defaultTheme.fontFamily);
    
    // Ek tema özellikleri (opsiyonel)
    if (theme.shadow) {
        root.style.setProperty('--shadow', theme.shadow);
    }
    
    if (theme.shadowHover) {
        root.style.setProperty('--shadow-hover', theme.shadowHover);
    }
    
    // Font family'yi body'ye de uygula
    if (theme.fontFamily) {
        document.body.style.fontFamily = theme.fontFamily;
    }
}

// Tema ayarlarını sıfırla (varsayılan temaya dön)
function resetTheme() {
    applyTheme(defaultTheme);
}

// Tema ayarlarını al (mevcut CSS custom properties'den)
function getCurrentTheme() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    return {
        primaryColor: computedStyle.getPropertyValue('--primary-color').trim() || defaultTheme.primaryColor,
        secondaryColor: computedStyle.getPropertyValue('--secondary-color').trim() || defaultTheme.secondaryColor,
        accentColor: computedStyle.getPropertyValue('--accent-color').trim() || defaultTheme.accentColor,
        textColor: computedStyle.getPropertyValue('--text-color').trim() || defaultTheme.textColor,
        textLight: computedStyle.getPropertyValue('--text-light').trim() || defaultTheme.textLight,
        bgColor: computedStyle.getPropertyValue('--bg-color').trim() || defaultTheme.bgColor,
        cardBg: computedStyle.getPropertyValue('--card-bg').trim() || defaultTheme.cardBg,
        borderColor: computedStyle.getPropertyValue('--border-color').trim() || defaultTheme.borderColor,
        borderRadius: computedStyle.getPropertyValue('--border-radius').trim() || defaultTheme.borderRadius,
        fontFamily: computedStyle.getPropertyValue('--font-family').trim() || defaultTheme.fontFamily
    };
}

// Tema ayarlarını localStorage'a kaydet
function saveThemeToLocalStorage(themeConfig) {
    try {
        localStorage.setItem('qrmenu_theme', JSON.stringify(themeConfig));
    } catch (error) {
        console.error('Tema kaydedilirken hata:', error);
    }
}

// Tema ayarlarını localStorage'dan yükle
function loadThemeFromLocalStorage() {
    try {
        const stored = localStorage.getItem('qrmenu_theme');
        if (stored) {
            const theme = JSON.parse(stored);
            applyTheme(theme);
            return theme;
        }
    } catch (error) {
        console.error('Tema yüklenirken hata:', error);
    }
    return null;
}

// Tema ayarlarını localStorage'dan temizle
function clearThemeFromLocalStorage() {
    try {
        localStorage.removeItem('qrmenu_theme');
    } catch (error) {
        console.error('Tema temizlenirken hata:', error);
    }
}

// Merkezi Supabase'den tema çek (theme_id ile)
async function fetchThemeFromDatabase(themeId, centralSupabaseClient) {
    if (!themeId || !centralSupabaseClient) {
        console.warn('fetchThemeFromDatabase: themeId veya client eksik', { themeId, hasClient: !!centralSupabaseClient });
        return null;
    }

    // Cache'den kontrol et
    if (themesCache.has(themeId)) {
        console.log('Tema cache\'den yüklendi:', themeId);
        return themesCache.get(themeId);
    }

    try {
        console.log('Tema veritabanından çekiliyor:', themeId);
        
        const { data, error } = await centralSupabaseClient
            .from('themes')
            .select('theme')
            .eq('id', themeId)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('Tema yüklenirken hata:', error);
            return null;
        }

        if (!data) {
            console.warn('Tema bulunamadı (data yok):', themeId);
            return null;
        }

        if (!data.theme) {
            console.warn('Tema JSONB alanı boş:', themeId);
            return null;
        }

        // JSONB'den direkt tema al (zaten doğru formatta)
        const theme = data.theme;
        
        console.log('Tema başarıyla yüklendi:', themeId, theme);

        // Cache'e kaydet
        themesCache.set(themeId, theme);

        return theme;
    } catch (error) {
        console.error('Tema veritabanından yüklenirken hata:', error);
        return null;
    }
}

// Tema cache'ini temizle
function clearThemesCache() {
    themesCache.clear();
}

// Restoran config'inden tema yükle ve uygula
// Öncelik sırası: theme_id (veritabanı) > varsayılan
async function loadAndApplyTheme(restaurantConfig, centralSupabaseClient) {
    if (!restaurantConfig) {
        applyTheme(defaultTheme);
        return;
    }

    let themeToApply = null;

    // 1. theme_id ile veritabanından tema çek
    if (restaurantConfig.theme_id && centralSupabaseClient) {
        themeToApply = await fetchThemeFromDatabase(restaurantConfig.theme_id, centralSupabaseClient);
        
        if (themeToApply) {
            console.log('Tema veritabanından yüklendi:', restaurantConfig.theme_id);
        } else {
            console.warn('Tema veritabanından yüklenemedi:', restaurantConfig.theme_id);
        }
    } else {
        if (!restaurantConfig.theme_id) {
            console.warn('Restoran için theme_id bulunamadı');
        }
        if (!centralSupabaseClient) {
            console.warn('Merkezi Supabase istemcisi bulunamadı');
        }
    }

    // 2. Hiçbiri yoksa varsayılan tema
    if (!themeToApply) {
        console.log('Varsayılan tema kullanılıyor');
        themeToApply = defaultTheme;
    }

    applyTheme(themeToApply);
}


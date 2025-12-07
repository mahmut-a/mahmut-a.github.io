// Tema Yönetimi Modülü
// CSS custom properties kullanarak dinamik tema uygulama

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


// Internationalization Context - Language Management System
const I18nContext = React.createContext();

// Available languages
const LANGUAGES = {
    en: { code: 'en', name: 'English', flag: '🇺🇸' },
    pt: { code: 'pt', name: 'Português', flag: '🇵🇹' }
};

// Default language
const DEFAULT_LANGUAGE = 'en';

// Translation hook
const useTranslation = () => {
    const context = React.useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};

// I18n Provider Component
const I18nProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = React.useState(() => {
        // Load saved language preference or use browser language
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && LANGUAGES[savedLanguage]) {
            return savedLanguage;
        }
        
        // Check browser language
        const browserLanguage = navigator.language.split('-')[0];
        return LANGUAGES[browserLanguage] ? browserLanguage : DEFAULT_LANGUAGE;
    });

    const [translations, setTranslations] = React.useState({});

    // Load translations
    React.useEffect(() => {
        const loadTranslations = async () => {
            try {
                // In a real app, you'd fetch from API or import JSON files
                // For now, we'll use the global translations object
                if (window.translations && window.translations[currentLanguage]) {
                    setTranslations(window.translations[currentLanguage]);
                } else {
                    console.warn(`Translations for language '${currentLanguage}' not found`);
                    setTranslations({});
                }
            } catch (error) {
                console.error('Error loading translations:', error);
                setTranslations({});
            }
        };

        loadTranslations();
    }, [currentLanguage]);

    // Change language function
    const changeLanguage = (languageCode) => {
        if (LANGUAGES[languageCode]) {
            setCurrentLanguage(languageCode);
            localStorage.setItem('preferred-language', languageCode);
        } else {
            console.error(`Invalid language code: ${languageCode}`);
        }
    };

    // Translation function with fallback
    const t = (key, fallback = key, params = {}) => {
        let translation = translations[key] || fallback;
        
        // Replace parameters in translation
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{{${param}}}`, params[param]);
        });
        
        return translation;
    };

    // Translation function for plurals
    const tn = (key, count, fallbackSingular = key, fallbackPlural = key + 's') => {
        const pluralKey = count === 1 ? key : `${key}_plural`;
        const fallback = count === 1 ? fallbackSingular : fallbackPlural;
        return t(pluralKey, fallback, { count });
    };

    // Format date according to current language
    const formatDate = (date, options = {}) => {
        const locale = currentLanguage === 'pt' ? 'pt-PT' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(new Date(date));
    };

    // Format number according to current language
    const formatNumber = (number, options = {}) => {
        const locale = currentLanguage === 'pt' ? 'pt-PT' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    };

    const contextValue = {
        currentLanguage,
        availableLanguages: LANGUAGES,
        changeLanguage,
        t,
        tn,
        formatDate,
        formatNumber,
        isRTL: false // Neither English nor Portuguese are RTL
    };

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
};

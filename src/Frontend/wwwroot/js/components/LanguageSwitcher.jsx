// Language Switcher Component
const LanguageSwitcher = () => {
    const { currentLanguage, availableLanguages, changeLanguage, t } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleLanguageChange = (languageCode) => {
        changeLanguage(languageCode);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('.language-switcher')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    const currentLang = availableLanguages[currentLanguage];

    return (
        <div className="language-switcher">
            <button
                className={`language-toggle ${isOpen ? 'active' : ''}`}
                onClick={toggleDropdown}
                title={t('language.switch', 'Switch Language')}
                aria-label={t('language.current', 'Current Language') + ': ' + currentLang.name}
            >
                <span className="language-flag">{currentLang.flag}</span>
                <span className="language-code">{currentLang.code.toUpperCase()}</span>
                <span className="dropdown-arrow">
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>

            {isOpen && (
                <div className="language-dropdown">
                    <div className="dropdown-header">
                        <span className="dropdown-title">{t('language.switch', 'Switch Language')}</span>
                    </div>
                    <ul className="language-options">
                        {Object.values(availableLanguages).map(language => (
                            <li key={language.code}>
                                <button
                                    className={`language-option ${currentLanguage === language.code ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange(language.code)}
                                >
                                    <span className="option-flag">{language.flag}</span>
                                    <span className="option-name">{language.name}</span>
                                    {currentLanguage === language.code && (
                                        <span className="option-check">✓</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

console.log('Language Switcher component loaded!');
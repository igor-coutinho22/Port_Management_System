// Home Page Component - React
const HomePage = () => {
    const features = [
        {
            titleKey: 'home.feature.management.title',
            descKey: 'home.feature.management.desc',
            route: 'management'
        },
        {
            titleKey: 'home.feature.3d_view.title',
            descKey: 'home.feature.3d_view.desc',
            route: '3d-view'
        },
        {
            titleKey: 'home.feature.api_docs.title',
            descKey: 'home.feature.api_docs.desc',
            route: 'api-docs'
        }];
    const { t } = useTranslation();
    

    return (
        <div className="page-section">
            <h2 className="page-title">{t('home.welcome_message')}</h2>
            <p>{t('home.description')}</p>

            <div className="feature-grid">
                {features.map((feature, index) => (
                    <FeatureCard 
                        key={index} 
                        titleKey={feature.titleKey}
                        descKey={feature.descKey}
                        route={feature.route}
                    />
                ))}
            </div>
        </div>
    );
};

// Feature Card Sub-component
const FeatureCard = ({ titleKey, descKey, route }) => {
    const { t } = useTranslation();
    
    return (
        <div 
            className="feature-card"
            onClick={() => window.app.navigate(route)}
            style={{ cursor: 'pointer' }}
        >
            <h3>{t(titleKey)}</h3>
            <p>{t(descKey)}</p>
        </div>
    );
};
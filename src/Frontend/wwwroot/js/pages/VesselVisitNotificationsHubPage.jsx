// Vessel Visit Notifications Management Hub Page - Swagger-style expandable interface

const VesselVisitNotificationsHubPage = () => {
	const { t } = useTranslation();
	const [expandedSection, setExpandedSection] = React.useState(null);
	const [notifications, setNotifications] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [showQuickView, setShowQuickView] = React.useState(false);

	// Toggle section expansion
	const toggleSection = (sectionName) => {
		setExpandedSection(expandedSection === sectionName ? null : sectionName);
	};

	// Load all notifications for quick view
	const loadNotifications = async () => {
		setIsLoading(true);
		try {
			const data = await apiService.getVesselVisitNotifications();
			setNotifications(data);
		} catch (error) {
			console.error('Error loading notifications:', error);
			setNotifications([]);
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		if (showQuickView) {
			loadNotifications();
		}
	}, [showQuickView]);

	const sections = [
		{
			id: 'register',
			title: t('vesselVisitNotificationsHubPage.section.register.title'),
			description: t('vesselVisitNotificationsHubPage.section.register.description'),
			color: '#27ae60',
			component: 'RegisterVesselVisitNotificationForm'
		},
		{
			id: 'search',
			title: t('vesselVisitNotificationsHubPage.section.search.title'),
			description: t('vesselVisitNotificationsHubPage.section.search.description'),
			color: '#3498db',
			component: 'SearchVesselVisitNotificationsForm'
		},
		{
			id: 'getById',
			title: t('vesselVisitNotificationsHubPage.section.getById.title'),
			description: t('vesselVisitNotificationsHubPage.section.getById.description'),
			color: '#2980b9',
			component: 'GetVesselVisitNotificationByIdForm'
		},
		{
			id: 'edit',
			title: t('vesselVisitNotificationsHubPage.section.edit.title'),
			description: t('vesselVisitNotificationsHubPage.section.edit.description'),
			color: '#f39c12',
			component: 'EditVesselVisitNotificationForm'
		},
		{
			id: 'approve',
			title: t('vesselVisitNotificationsHubPage.section.approve.title'),
			description: t('vesselVisitNotificationsHubPage.section.approve.description'),
			color: '#2ecc71',
			component: 'ApproveVesselVisitNotificationForm'
		},
		{
			id: 'reject',
			title: t('vesselVisitNotificationsHubPage.section.reject.title'),
			description: t('vesselVisitNotificationsHubPage.section.reject.description'),
			color: '#e74c3c',
			component: 'RejectVesselVisitNotificationForm'
		},
		{
			id: 'manage LM',
			title: t('vesselVisitNotificationsHubPage.section.manageLM.title'),
			description: t('vesselVisitNotificationsHubPage.section.manageLM.description'),
			color: '#8e44ad',
			component: 'ManageLoadingManifestsForm'
		},
		{
			id: 'manage UM',
			title: t('vesselVisitNotificationsHubPage.section.manageUM.title'),
			description: t('vesselVisitNotificationsHubPage.section.manageUM.description'),
			color: '#9b59b6',
			component: 'ManageUnloadingManifestsForm'
		},
		{
			id: 'manage CM',
			title: t('vesselVisitNotificationsHubPage.section.manageCM.title'),
			description: t('vesselVisitNotificationsHubPage.section.manageCM.description'),
			color: '#d35400',
			component: 'ManageCrewMembersForm'
		},
		{
			id: 'delete',
			title: t('vesselVisitNotificationsHubPage.section.delete.title'),
			description: t('vesselVisitNotificationsHubPage.section.delete.description'),
			color: '#c0392b',
			component: 'DeleteVesselVisitNotificationForm'
		}
	];

	return (
		<div className="page-section">
			<div className="hub-header">
				<h2 className="page-title">
					{t('vesselVisitNotificationsHubPage.title')}
				</h2>
				<p>{t('vesselVisitNotificationsHubPage.description')}</p>
			</div>

			{/* Quick Data View Button */}
			<div className="quick-view-container">
				<button 
					className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
					onClick={() => setShowQuickView(!showQuickView)}
				>
					<span className="quick-view-icon">📊</span>
					{t('vesselVisitNotificationsHubPage.quickView.button')}
					<span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
						{showQuickView ? '▲' : '▼'}
					</span>
				</button>

				{showQuickView && (
					<div className="quick-view-panel">
						{isLoading ? (
							<div className="loading">{t('vesselVisitNotificationsHubPage.quickView.loading')}</div>
						) : (
							<VesselVisitNotificationsQuickTable notifications={notifications} onRefresh={loadNotifications} />
						)}
					</div>
				)}
			</div>

			{/* Swagger-style Expandable Sections */}
			<div className="operations-container">
				{sections.map((section) => (
					<div key={section.id} className="operation-section">
						<div 
							className={`operation-header ${expandedSection === section.id ? 'expanded' : ''}`}
							onClick={() => toggleSection(section.id)}
							style={{ borderLeftColor: section.color }}
						>
							<div className="operation-info">
								<h3 className="operation-title">{section.title}</h3>
								<p className="operation-description">{section.description}</p>
							</div>
							<div className="operation-controls">
								<span 
									className="http-method" 
									style={{ backgroundColor: section.color }}
								>
									{t(`sectionBadge.${section.id}`, section.id).toUpperCase()}
								</span>
								<span className={`expand-arrow ${expandedSection === section.id ? 'up' : 'down'}`}>
									{expandedSection === section.id ? '▲' : '▼'}
								</span>
							</div>
						</div>

						{expandedSection === section.id && (
							<div className="operation-content">
								<div className="operation-body">
									{section.component === 'RegisterVesselVisitNotificationForm' && <RegisterVesselVisitNotificationForm onSuccess={loadNotifications} />}
									{section.component === 'SearchVesselVisitNotificationsForm' && <SearchVesselVisitNotificationsForm />}
									{section.component === 'GetVesselVisitNotificationByIdForm' && <GetVesselVisitNotificationByIdForm />}
									{section.component === 'EditVesselVisitNotificationForm' && <EditVesselVisitNotificationForm onSuccess={loadNotifications} />}
									{section.component === 'ApproveVesselVisitNotificationForm' && <ApproveVesselVisitNotificationForm onSuccess={loadNotifications} />}
									{section.component === 'RejectVesselVisitNotificationForm' && <RejectVesselVisitNotificationForm onSuccess={loadNotifications} />}
									{section.component === 'ManageLoadingManifestsForm' && <ManageLoadingManifestsForm onSuccess={loadNotifications} />}
									{section.component === 'ManageUnloadingManifestsForm' && <ManageUnloadingManifestsForm onSuccess={loadNotifications} />}
									{section.component === 'ManageCrewMembersForm' && <ManageCrewMembersForm onSuccess={loadNotifications} />}
									{section.component === 'DeleteVesselVisitNotificationForm' && <DeleteVesselVisitNotificationForm onSuccess={loadNotifications} />}
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

// Quick Table Component for Vessel Visit Notifications Data
const VesselVisitNotificationsQuickTable = ({ notifications, onRefresh }) => {
	const { t } = useTranslation();
	const [vessels, setVessels] = React.useState([]);
	const [docks, setDocks] = React.useState([]);
	const [shippingAgentOrganizations, setShippingAgentOrganizations] = React.useState([]);

	React.useEffect(() => {
		// Fetch all vessels and docks once for name lookup
		async function fetchMeta() {
			const v = await apiService.getVessels();
			const o = await apiService.getOrganizations(); // Fetch organizations
			const d = await apiService.getDocks();
			setVessels(v || []);
			setDocks(d || []);
			setShippingAgentOrganizations(o || []); // And save them to state

		}
		fetchMeta();
	}, []);

	function getVesselName(imo) {
		const vessel = vessels.find(v => v.imo === imo);
		return vessel ? vessel.vesselName || vessel.name || t('vesselVisitNotificationsHubPage.table.notAvailable') : t('vesselVisitNotificationsHubPage.table.notAvailable');
	}
	function getDockName(id) {
		const dock = docks.find(d => d.id === id);
		return dock ? dock.name || t('vesselVisitNotificationsHubPage.table.notAvailable') : t('vesselVisitNotificationsHubPage.table.notAvailable');
	}
	function getOrganizationLegalName(id) {
		const org = shippingAgentOrganizations.find(o => o.id === id);
		return org ? org.legalName || t('vesselVisitNotificationsHubPage.table.notAvailable') : t('vesselVisitNotificationsHubPage.table.notAvailable');
	}

	return (
		<div className="quick-table-container">
			<div className="quick-table-header">
				<h4>{t('vesselVisitNotificationsHubPage.quickView.overview')} ({notifications.length} total)</h4>
				<button className="refresh-btn" onClick={onRefresh}>{t('vesselVisitNotificationsHubPage.quickView.refresh')}</button>
			</div>
			{notifications.length === 0 ? (
				<div className="no-data">
					<h3>{t('vesselVisitNotificationsHubPage.quickView.noData.title')}</h3>
					<p>{t('vesselVisitNotificationsHubPage.quickView.noData.description')}</p>
				</div>
			) : (
				<div className="table-container">
					<table className="data-table quick-table">
						<thead>
							<tr>
								<th>{t('vesselVisitNotificationsHubPage.table.id')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.vesselImo')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.dockId')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.visitDate')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.status')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.purpose')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.crewSize')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.loadingManifest')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.unloadingManifest')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.organization')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.arrivalTime')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.departureTime')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.loadingTime')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.unloadingTime')}</th>
							</tr>
						</thead>
						<tbody>
							{notifications.map((n) => (
								<tr key={n.id}>
									<td className="id-cell">{n.id || t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.vesselIMO ? `${n.vesselIMO} (${getVesselName(n.vesselIMO)})` : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.dockId ? `${n.dockId} (${getDockName(n.dockId)})` : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.visitDate ? new Date(n.visitDate).toLocaleDateString() : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>
										<span className={`status-badge status-${(n.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
											{n.status || t('vesselVisitNotificationsHubPage.table.notAvailable')}
										</span>
									</td>
									<td>{n.purpose || t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.crew ? n.crew.length : 0}</td>
									<td>
										{n.loadingManifest && n.loadingManifest.containers && n.loadingManifest.containers.length > 0
											? n.loadingManifest.containers.map(c => c.identifier).join(', ')
											: <span style={{ color: '#888' }}>{t('vesselVisitNotificationsHubPage.table.none')}</span>}
									</td>
									<td>
										{n.unloadingManifest && n.unloadingManifest.containers && n.unloadingManifest.containers.length > 0
											? n.unloadingManifest.containers.map(c => c.identifier).join(', ')
											: <span style={{ color: '#888' }}>{t('vesselVisitNotificationsHubPage.table.none')}</span>}
									</td>
									<td>{getOrganizationLegalName(n.shippingAgentOrganizationId) || t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.arrivalTime ? new Date(n.arrivalTime).toLocaleString() : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.desiredDepartureTime ? new Date(n.desiredDepartureTime).toLocaleString() : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.estimatedLoadingDurationMinutes != null ? `${n.estimatedLoadingDurationMinutes} min` : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.estimatedUnloadingDurationMinutes != null ? `${n.estimatedUnloadingDurationMinutes} min` : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

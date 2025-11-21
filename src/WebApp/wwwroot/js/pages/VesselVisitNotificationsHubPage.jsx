// Vessel Visit Notifications Management Hub Page - Swagger-style expandable interface
console.log('VesselVisitNotificationsHubPage.jsx is loading...');

const VesselVisitNotificationsHubPage = () => {
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
			title: `📝 Register Notification`,
			description: 'Register a new vessel visit notification',
			color: '#27ae60',
			component: 'RegisterVesselVisitNotificationForm'
		},
		{
			id: 'search',
			title: `🔍 Search Notifications`,
			description: 'Search notifications by vessel IMO, status, date, or representative',
			color: '#3498db',
			component: 'SearchVesselVisitNotificationsForm'
		},
		{
			id: 'getById',
			title: `🎯 Get Notification by ID`,
			description: 'Retrieve details of a specific notification',
			color: '#2980b9',
			component: 'GetVesselVisitNotificationByIdForm'
		},
		{
			id: 'edit',
			title: `✏️ Edit Notification`,
			description: 'Update notification details',
			color: '#f39c12',
			component: 'EditVesselVisitNotificationForm'
		},
		{
			id: 'submit',
			title: `📤 Submit Notification`,
			description: 'Submit a notification for approval',
			color: '#16a085',
			component: 'SubmitVesselVisitNotificationForm'
		},
		{
			id: 'approve',
			title: `✅ Approve Notification`,
			description: 'Approve a submitted notification',
			color: '#2ecc71',
			component: 'ApproveVesselVisitNotificationForm'
		},
		{
			id: 'reject',
			title: `❌ Reject Notification`,
			description: 'Reject a submitted notification',
			color: '#e74c3c',
			component: 'RejectVesselVisitNotificationForm'
		},
		{
			id: 'manage LM',
			title: `Manage Loading Manifests`,
			description: 'Add or remove the loading cargo manifest from a notification',
			color: '#8e44ad',
			component: 'ManageLoadingManifestsForm'
		},
		{
			id: 'manage UM',
			title: `Manage Unloading Manifests`,
			description: 'Add or remove the unloading cargo manifest from a notification',
			color: '#9b59b6',
			component: 'ManageUnloadingManifestsForm'
		},
		{
			id: 'manage CM',
			title: `Manage Crew Members`,
			description: 'Add or remove crew members associated with a notification',
			color: '#d35400',
			component: 'ManageCrewMembersForm'
		},
		{
			id: 'delete',
			title: `🗑️ Delete Notification`,
			description: 'Remove a vessel visit notification from the system',
			color: '#c0392b',
			component: 'DeleteVesselVisitNotificationForm'
		}
	];

	return (
		<div className="page-section">
			<div className="hub-header">
				<h2 className="page-title">
					🚢 Vessel Visit Notifications Management
				</h2>
				<p>Comprehensive management for vessel visit notifications</p>
			</div>

			{/* Quick Data View Button */}
			<div className="quick-view-container">
				<button 
					className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
					onClick={() => setShowQuickView(!showQuickView)}
				>
					<span className="quick-view-icon">📊</span>
					Quick Data View
					<span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
						{showQuickView ? '▲' : '▼'}
					</span>
				</button>

				{showQuickView && (
					<div className="quick-view-panel">
						{isLoading ? (
							<div className="loading">Loading notifications...</div>
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
									{section.id.toUpperCase()}
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
									{section.component === 'SubmitVesselVisitNotificationForm' && <SubmitVesselVisitNotificationForm onSuccess={loadNotifications} />}
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
	const [vessels, setVessels] = React.useState([]);
	const [docks, setDocks] = React.useState([]);

	React.useEffect(() => {
		// Fetch all vessels and docks once for name lookup
		async function fetchMeta() {
			const v = await apiService.getVessels();
			const d = await apiService.getDocks();
			setVessels(v || []);
			setDocks(d || []);
		}
		fetchMeta();
	}, []);

	function getVesselName(imo) {
		const vessel = vessels.find(v => v.imo === imo);
		return vessel ? vessel.vesselName || vessel.name || 'N/A' : 'N/A';
	}
	function getDockName(id) {
		const dock = docks.find(d => d.id === id);
		return dock ? dock.name || 'N/A' : 'N/A';
	}

	return (
		<div className="quick-table-container">
			<div className="quick-table-header">
				<h4>Notifications Overview ({notifications.length} total)</h4>
				<button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
			</div>
			{notifications.length === 0 ? (
				<div className="no-data">
					<h3>No notifications found</h3>
					<p>Register your first notification to get started</p>
				</div>
			) : (
				<div className="table-container">
					<table className="data-table quick-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Vessel IMO (Name)</th>
								<th>Dock ID (Name)</th>
								<th>Visit Date</th>
								<th>Status</th>
								<th>Purpose</th>
								<th>Crew Size</th>
								<th>Loading Manifest</th>
								<th>Unloading Manifest</th>
							</tr>
						</thead>
						<tbody>
							{notifications.map((n) => (
								<tr key={n.id}>
									<td className="id-cell">{n.id || 'N/A'}</td>
									<td>{n.vesselIMO ? `${n.vesselIMO} (${getVesselName(n.vesselIMO)})` : 'N/A'}</td>
									<td>{n.dockId ? `${n.dockId} (${getDockName(n.dockId)})` : 'N/A'}</td>
									<td>{n.visitDate ? new Date(n.visitDate).toLocaleDateString() : 'N/A'}</td>
									<td>
										<span className={`status-badge status-${(n.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
											{n.status || 'N/A'}
										</span>
									</td>
									<td>{n.purpose || 'N/A'}</td>
									<td>{n.crew ? n.crew.length : 0}</td>
									<td>
										{n.loadingManifest && n.loadingManifest.containers && n.loadingManifest.containers.length > 0
											? n.loadingManifest.containers.map(c => c.identifier).join(', ')
											: <span style={{ color: '#888' }}>None</span>}
									</td>
									<td>
										{n.unloadingManifest && n.unloadingManifest.containers && n.unloadingManifest.containers.length > 0
											? n.unloadingManifest.containers.map(c => c.identifier).join(', ')
											: <span style={{ color: '#888' }}>None</span>}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

console.log('VesselVisitNotificationsHubPage component loaded!');
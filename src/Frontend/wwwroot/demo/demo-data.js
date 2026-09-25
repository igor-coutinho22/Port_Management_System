// Sample data for the demo mode (see demo-mode.js).
// Generated from the seeded WebApp and OEM APIs on 2026-09-25; dates are shifted to the current day at runtime.
window.DEMO_DATA = {
 "docks": [
  {
   "id": "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
   "name": "Dock A",
   "location": "North Terminal",
   "lengthMeters": 300,
   "depthMeters": 15,
   "maxDraftMeters": 12,
   "allowedVesselTypes": [
    {
     "name": "Bulk Carrier",
     "description": "Vessel designed for transporting bulk cargo",
     "maxBays": 15,
     "maxRows": 12,
     "maxTiers": 6,
     "maxTEUCapacity": 1080
    },
    {
     "name": "RoRo Ship",
     "description": "Roll-on/roll-off vessel for vehicles and trailers",
     "maxBays": 12,
     "maxRows": 15,
     "maxTiers": 3,
     "maxTEUCapacity": 540
    }
   ]
  },
  {
   "id": "732bd310-1ca9-4bde-a892-c8eb44e828ec",
   "name": "Dock C",
   "location": "East Terminal",
   "lengthMeters": 400,
   "depthMeters": 18,
   "maxDraftMeters": 15,
   "allowedVesselTypes": [
    {
     "name": "Bulk Carrier",
     "description": "Vessel designed for transporting bulk cargo",
     "maxBays": 15,
     "maxRows": 12,
     "maxTiers": 6,
     "maxTEUCapacity": 1080
    },
    {
     "name": "Container Ship",
     "description": "Large container vessel for international shipping",
     "maxBays": 20,
     "maxRows": 18,
     "maxTiers": 8,
     "maxTEUCapacity": 2880
    },
    {
     "name": "RoRo Ship",
     "description": "Roll-on/roll-off vessel for vehicles and trailers",
     "maxBays": 12,
     "maxRows": 15,
     "maxTiers": 3,
     "maxTEUCapacity": 540
    }
   ]
  },
  {
   "id": "8bc5f15c-c44f-40bc-bfc2-0d4096624031",
   "name": "Dock B",
   "location": "South Terminal",
   "lengthMeters": 250,
   "depthMeters": 12,
   "maxDraftMeters": 10,
   "allowedVesselTypes": [
    {
     "name": "Container Ship",
     "description": "Large container vessel for international shipping",
     "maxBays": 20,
     "maxRows": 18,
     "maxTiers": 8,
     "maxTEUCapacity": 2880
    },
    {
     "name": "Tanker",
     "description": "Vessel for liquid cargo transport",
     "maxBays": 18,
     "maxRows": 10,
     "maxTiers": 4,
     "maxTEUCapacity": 720
    }
   ]
  }
 ],
 "vessels": [
  {
   "imo": "0260090",
   "vesselName": "Iberian Tanker",
   "operatorName": "Iberian Maritime",
   "cargoGrid": {
    "grid": [
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null
    ],
    "bays": 4,
    "rows": 8,
    "tiers": 3
   },
   "vesselTypeName": "RoRo Ship",
   "vesselType": {
    "name": "RoRo Ship",
    "description": "Roll-on/roll-off vessel for vehicles and trailers",
    "maxBays": 12,
    "maxRows": 15,
    "maxTiers": 3,
    "maxTEUCapacity": 540
   },
   "requiredCraneCount": 3,
   "requiredDockLength": 2001,
   "bays": 4,
   "rows": 8,
   "tiers": 3
  },
  {
   "imo": "2221610",
   "vesselName": "Baltic Bulk",
   "operatorName": "Nordic Logistics",
   "cargoGrid": {
    "grid": [
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null
    ],
    "bays": 9,
    "rows": 7,
    "tiers": 1
   },
   "vesselTypeName": "Container Ship",
   "vesselType": {
    "name": "Container Ship",
    "description": "Large container vessel for international shipping",
    "maxBays": 20,
    "maxRows": 18,
    "maxTiers": 8,
    "maxTEUCapacity": 2880
   },
   "requiredCraneCount": 2,
   "requiredDockLength": 220,
   "bays": 9,
   "rows": 7,
   "tiers": 1
  },
  {
   "imo": "6268446",
   "vesselName": "Atlantic Carrier",
   "operatorName": "Atlantic Shipping SA",
   "cargoGrid": {
    "grid": [
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null
    ],
    "bays": 12,
    "rows": 9,
    "tiers": 2
   },
   "vesselTypeName": "Bulk Carrier",
   "vesselType": {
    "name": "Bulk Carrier",
    "description": "Vessel designed for transporting bulk cargo",
    "maxBays": 15,
    "maxRows": 12,
    "maxTiers": 6,
    "maxTEUCapacity": 1080
   },
   "requiredCraneCount": 4,
   "requiredDockLength": 280,
   "bays": 12,
   "rows": 9,
   "tiers": 2
  },
  {
   "imo": "8666692",
   "vesselName": "Mediterranean Express",
   "operatorName": "BlueOcean Logistics GmbH",
   "cargoGrid": {
    "grid": [
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null,
     null
    ],
    "bays": 8,
    "rows": 6,
    "tiers": 3
   },
   "vesselTypeName": "Bulk Carrier",
   "vesselType": {
    "name": "Bulk Carrier",
    "description": "Vessel designed for transporting bulk cargo",
    "maxBays": 15,
    "maxRows": 12,
    "maxTiers": 6,
    "maxTEUCapacity": 1080
   },
   "requiredCraneCount": 6,
   "requiredDockLength": 350,
   "bays": 8,
   "rows": 6,
   "tiers": 3
  }
 ],
 "vesselTypes": [
  {
   "name": "Bulk Carrier",
   "description": "Vessel designed for transporting bulk cargo",
   "maxBays": 15,
   "maxRows": 12,
   "maxTiers": 6,
   "maxTEUCapacity": 1080
  },
  {
   "name": "Container Ship",
   "description": "Large container vessel for international shipping",
   "maxBays": 20,
   "maxRows": 18,
   "maxTiers": 8,
   "maxTEUCapacity": 2880
  },
  {
   "name": "RoRo Ship",
   "description": "Roll-on/roll-off vessel for vehicles and trailers",
   "maxBays": 12,
   "maxRows": 15,
   "maxTiers": 3,
   "maxTEUCapacity": 540
  },
  {
   "name": "Tanker",
   "description": "Vessel for liquid cargo transport",
   "maxBays": 18,
   "maxRows": 10,
   "maxTiers": 4,
   "maxTEUCapacity": 720
  }
 ],
 "storageAreas": [
  {
   "storageArea": {
    "id": 1,
    "name": "Container Yard North",
    "type": "ContainerYard",
    "maxCapacityTeu": 1000,
    "currentOccupancyTeu": 0,
    "dockConnections": []
   },
   "dockIds": []
  },
  {
   "storageArea": {
    "id": 2,
    "name": "Container Yard South",
    "type": "ContainerYard",
    "maxCapacityTeu": 800,
    "currentOccupancyTeu": 0,
    "dockConnections": []
   },
   "dockIds": [
    "732bd310-1ca9-4bde-a892-c8eb44e828ec"
   ]
  },
  {
   "storageArea": {
    "id": 3,
    "name": "Container Yard Central",
    "type": "ContainerYard",
    "maxCapacityTeu": 1200,
    "currentOccupancyTeu": 0,
    "dockConnections": []
   },
   "dockIds": [
    "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
    "8bc5f15c-c44f-40bc-bfc2-0d4096624031"
   ]
  },
  {
   "storageArea": {
    "id": 4,
    "name": "Warehouse North",
    "type": "Warehouse",
    "maxCapacityTeu": 500,
    "currentOccupancyTeu": 0,
    "dockConnections": []
   },
   "specializedCargoType": "Perishable"
  },
  {
   "storageArea": {
    "id": 5,
    "name": "Warehouse South",
    "type": "Warehouse",
    "maxCapacityTeu": 300,
    "currentOccupancyTeu": 0,
    "dockConnections": []
   },
   "specializedCargoType": "Hazardous"
  },
  {
   "storageArea": {
    "id": 6,
    "name": "Warehouse Central",
    "type": "Warehouse",
    "maxCapacityTeu": 400,
    "currentOccupancyTeu": 0,
    "dockConnections": []
   },
   "specializedCargoType": "General"
  }
 ],
 "resources": [
  {
   "id": "R001",
   "description": "STS Crane #1",
   "resourceType": "STSCrane",
   "operationalCapacity": 60,
   "status": "Active",
   "setupTime": 120,
   "qualificationRequirements": [
    {
     "code": "Q1",
     "name": "Crane Operator License"
    },
    {
     "code": "Q3",
     "name": "Hazardous Cargo Handling"
    }
   ]
  },
  {
   "id": "R002",
   "description": "Yard Crane #1",
   "resourceType": "YardCrane",
   "operationalCapacity": 40,
   "status": "Active",
   "setupTime": 40,
   "qualificationRequirements": [
    {
     "code": "Q1",
     "name": "Crane Operator License"
    }
   ]
  },
  {
   "id": "R003",
   "description": "Truck #1",
   "resourceType": "Truck",
   "operationalCapacity": 20,
   "status": "UnderMaintenance",
   "setupTime": 5,
   "qualificationRequirements": [
    {
     "code": "Q4",
     "name": "Driver's License"
    }
   ]
  }
 ],
 "staff": [
  {
   "mecanographicNumber": "S001",
   "shortName": "Alice",
   "email": "alice@port.pt",
   "phone": "911111111",
   "status": "Available",
   "operationalWindow": "06:00-14:00",
   "qualifications": [
    {
     "code": "Q1",
     "name": "Crane Operator License"
    }
   ]
  },
  {
   "mecanographicNumber": "S002",
   "shortName": "Bruno",
   "email": "bruno@port.pt",
   "phone": "922222222",
   "status": "Unavailable",
   "operationalWindow": "14:00-22:00",
   "qualifications": [
    {
     "code": "Q2",
     "name": "Heavy Vehicle Driver's License"
    }
   ]
  },
  {
   "mecanographicNumber": "S003",
   "shortName": "Carla",
   "email": "carla@port.pt",
   "phone": "933333333",
   "status": "Available",
   "operationalWindow": "06:00-14:00",
   "qualifications": [
    {
     "code": "Q1",
     "name": "Crane Operator License"
    },
    {
     "code": "Q3",
     "name": "Hazardous Cargo Handling"
    }
   ]
  }
 ],
 "qualifications": [
  {
   "code": "Q1",
   "name": "Crane Operator License"
  },
  {
   "code": "Q2",
   "name": "Heavy Vehicle Driver's License"
  },
  {
   "code": "Q3",
   "name": "Hazardous Cargo Handling"
  },
  {
   "code": "Q4",
   "name": "Driver's License"
  }
 ],
 "organizations": [
  {
   "id": "5bd7930f-79c4-4c03-b186-dee3d8753964",
   "identifier": "MSC-PT - Mediterranean Shipping Company Portugal",
   "legalName": "Atlantic Shipping SA",
   "alternativeNames": "Atlantic; ASL",
   "address": "Av. do Porto 100, 4050-123 Porto, PT",
   "taxNumber": "1-0001",
   "isActive": true,
   "representatives": [
    {
     "id": "4aa0ca42-7288-420e-aa48-8f806e335b6e",
     "organizationId": "5bd7930f-79c4-4c03-b186-dee3d8753964",
     "name": "Ana Martins",
     "citizenId": "CITPT001",
     "nationality": "PRT",
     "email": "ana.martins@atlantic.com",
     "phone": "+351912345678",
     "isActive": true
    },
    {
     "id": "75448b14-c254-46d4-81e7-30d811828f2e",
     "organizationId": "5bd7930f-79c4-4c03-b186-dee3d8753964",
     "name": "Miguel Sousa",
     "citizenId": "CITPT002",
     "nationality": "PRT",
     "email": "miguel.sousa@atlantic.com",
     "phone": "+351913000111",
     "isActive": true
    }
   ],
   "vesselVisitNotifications": [
    {
     "id": "86dbe038-28a2-41d5-8505-8b3506742b7e",
     "vesselIMO": "6268446",
     "shippingAgentOrganizationId": "5bd7930f-79c4-4c03-b186-dee3d8753964",
     "dockId": "732bd310-1ca9-4bde-a892-c8eb44e828ec",
     "visitDate": "2026-09-25T00:00:00",
     "status": "Approved",
     "purpose": "Commercial",
     "loadingManifest": null,
     "unloadingManifest": null,
     "crew": [],
     "arrivalTime": "2026-09-25T13:00:00",
     "desiredDepartureTime": "2026-09-25T18:00:00",
     "estimatedLoadingDurationMinutes": 5,
     "estimatedUnloadingDurationMinutes": 120
    },
    {
     "id": "f578c1ed-3e0b-40c4-9113-fda0ac143dd4",
     "vesselIMO": "8666692",
     "shippingAgentOrganizationId": "5bd7930f-79c4-4c03-b186-dee3d8753964",
     "dockId": "732bd310-1ca9-4bde-a892-c8eb44e828ec",
     "visitDate": "2026-09-25T00:00:00",
     "status": "Approved",
     "purpose": "Commercial",
     "loadingManifest": null,
     "unloadingManifest": null,
     "crew": [],
     "arrivalTime": "2026-09-25T09:00:00",
     "desiredDepartureTime": "2026-09-25T12:00:00",
     "estimatedLoadingDurationMinutes": 40,
     "estimatedUnloadingDurationMinutes": 30
    }
   ]
  },
  {
   "id": "01529742-09f4-457a-bbad-98920fe60c99",
   "identifier": "BOL-DE - BlueOcean Logistics Germany",
   "legalName": "BlueOcean Logistics GmbH",
   "alternativeNames": "BlueOcean; BOL",
   "address": "Hafenstrasse 12, 20457 Hamburg, DE",
   "taxNumber": "2-2025",
   "isActive": true,
   "representatives": [
    {
     "id": "075ff8f4-7e1f-4615-9b40-773701c3549e",
     "organizationId": "01529742-09f4-457a-bbad-98920fe60c99",
     "name": "Laura Klein",
     "citizenId": "DEID2025Y",
     "nationality": "DEU",
     "email": "laura.klein@blueocean.de",
     "phone": "+49407654321",
     "isActive": true
    },
    {
     "id": "c99aa4f4-2ae8-443e-b2e3-fe10cf4f346a",
     "organizationId": "01529742-09f4-457a-bbad-98920fe60c99",
     "name": "Jonas Weber",
     "citizenId": "DEID2025X",
     "nationality": "DEU",
     "email": "jonas.weber@blueocean.de",
     "phone": "+49401234567",
     "isActive": true
    }
   ],
   "vesselVisitNotifications": [
    {
     "id": "1c6ac81e-4471-4a13-ac5a-10260cdce39c",
     "vesselIMO": "2221610",
     "shippingAgentOrganizationId": "01529742-09f4-457a-bbad-98920fe60c99",
     "dockId": "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
     "visitDate": "2026-09-25T00:00:00",
     "status": "Approved",
     "purpose": "Commercial",
     "loadingManifest": null,
     "unloadingManifest": null,
     "crew": [],
     "arrivalTime": "2026-09-25T11:00:00",
     "desiredDepartureTime": "2026-09-25T15:00:00",
     "estimatedLoadingDurationMinutes": 90,
     "estimatedUnloadingDurationMinutes": 5
    },
    {
     "id": "fa3b6b9d-72f6-414a-9e7f-de6dc187aa04",
     "vesselIMO": "0260090",
     "shippingAgentOrganizationId": "01529742-09f4-457a-bbad-98920fe60c99",
     "dockId": "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
     "visitDate": "2026-09-25T00:00:00",
     "status": "Approved",
     "purpose": "Commercial",
     "loadingManifest": null,
     "unloadingManifest": null,
     "crew": [],
     "arrivalTime": "2026-09-25T06:00:00",
     "desiredDepartureTime": "2026-09-25T10:00:00",
     "estimatedLoadingDurationMinutes": 60,
     "estimatedUnloadingDurationMinutes": 45
    }
   ]
  }
 ],
 "representatives": [
  {
   "id": "4aa0ca42-7288-420e-aa48-8f806e335b6e",
   "organizationId": "5bd7930f-79c4-4c03-b186-dee3d8753964",
   "name": "Ana Martins",
   "citizenId": "CITPT001",
   "nationality": "PRT",
   "email": "ana.martins@atlantic.com",
   "phone": "+351912345678",
   "isActive": true
  },
  {
   "id": "c99aa4f4-2ae8-443e-b2e3-fe10cf4f346a",
   "organizationId": "01529742-09f4-457a-bbad-98920fe60c99",
   "name": "Jonas Weber",
   "citizenId": "DEID2025X",
   "nationality": "DEU",
   "email": "jonas.weber@blueocean.de",
   "phone": "+49401234567",
   "isActive": true
  },
  {
   "id": "075ff8f4-7e1f-4615-9b40-773701c3549e",
   "organizationId": "01529742-09f4-457a-bbad-98920fe60c99",
   "name": "Laura Klein",
   "citizenId": "DEID2025Y",
   "nationality": "DEU",
   "email": "laura.klein@blueocean.de",
   "phone": "+49407654321",
   "isActive": true
  },
  {
   "id": "75448b14-c254-46d4-81e7-30d811828f2e",
   "organizationId": "5bd7930f-79c4-4c03-b186-dee3d8753964",
   "name": "Miguel Sousa",
   "citizenId": "CITPT002",
   "nationality": "PRT",
   "email": "miguel.sousa@atlantic.com",
   "phone": "+351913000111",
   "isActive": true
  }
 ],
 "vvns": [
  {
   "id": "1c6ac81e-4471-4a13-ac5a-10260cdce39c",
   "vesselIMO": "2221610",
   "shippingAgentOrganizationId": "01529742-09f4-457a-bbad-98920fe60c99",
   "dockId": "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
   "visitDate": "2026-09-25T00:00:00",
   "status": "Approved",
   "purpose": "Commercial",
   "loadingManifest": {
    "id": "610d88ab-bf43-4baf-949e-65ffa8807ca1",
    "type": "Loading",
    "containers": [
     {
      "identifier": "MSCU1000022",
      "teu": 1
     },
     {
      "identifier": "MSCU1000038",
      "teu": 1
     }
    ]
   },
   "unloadingManifest": null,
   "crew": [
    {
     "name": "Maria Silva",
     "citizenId": "C4567",
     "nationality": "ES"
    }
   ],
   "arrivalTime": "2026-09-25T11:00:00",
   "desiredDepartureTime": "2026-09-25T15:00:00",
   "estimatedLoadingDurationMinutes": 90,
   "estimatedUnloadingDurationMinutes": 5
  },
  {
   "id": "86dbe038-28a2-41d5-8505-8b3506742b7e",
   "vesselIMO": "6268446",
   "shippingAgentOrganizationId": "5bd7930f-79c4-4c03-b186-dee3d8753964",
   "dockId": "732bd310-1ca9-4bde-a892-c8eb44e828ec",
   "visitDate": "2026-09-25T00:00:00",
   "status": "Approved",
   "purpose": "Commercial",
   "loadingManifest": null,
   "unloadingManifest": {
    "id": "9eb8ea92-4f9b-46ce-b663-52b062f8929e",
    "type": "Unloading",
    "containers": [
     {
      "identifier": "MSCU1000043",
      "teu": 1
     }
    ]
   },
   "crew": [
    {
     "name": "Carlos Mendes",
     "citizenId": "C78910",
     "nationality": "BR"
    }
   ],
   "arrivalTime": "2026-09-25T13:00:00",
   "desiredDepartureTime": "2026-09-25T18:00:00",
   "estimatedLoadingDurationMinutes": 5,
   "estimatedUnloadingDurationMinutes": 120
  },
  {
   "id": "f578c1ed-3e0b-40c4-9113-fda0ac143dd4",
   "vesselIMO": "8666692",
   "shippingAgentOrganizationId": "5bd7930f-79c4-4c03-b186-dee3d8753964",
   "dockId": "732bd310-1ca9-4bde-a892-c8eb44e828ec",
   "visitDate": "2026-09-25T00:00:00",
   "status": "Approved",
   "purpose": "Commercial",
   "loadingManifest": {
    "id": "edbf2e3c-e860-4864-8045-ed06fe0f89f3",
    "type": "Loading",
    "containers": [
     {
      "identifier": "MSCU1000059",
      "teu": 1
     }
    ]
   },
   "unloadingManifest": {
    "id": "d9f69c03-d5d6-4607-8a66-65d362349fc3",
    "type": "Unloading",
    "containers": [
     {
      "identifier": "MSCU1000064",
      "teu": 1
     }
    ]
   },
   "crew": [
    {
     "name": "Eva Liu",
     "citizenId": "C9999",
     "nationality": "CN"
    }
   ],
   "arrivalTime": "2026-09-25T09:00:00",
   "desiredDepartureTime": "2026-09-25T12:00:00",
   "estimatedLoadingDurationMinutes": 40,
   "estimatedUnloadingDurationMinutes": 30
  },
  {
   "id": "fa3b6b9d-72f6-414a-9e7f-de6dc187aa04",
   "vesselIMO": "0260090",
   "shippingAgentOrganizationId": "01529742-09f4-457a-bbad-98920fe60c99",
   "dockId": "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
   "visitDate": "2026-09-25T00:00:00",
   "status": "Approved",
   "purpose": "Commercial",
   "loadingManifest": {
    "id": "c9fdbf7c-a87b-489f-9ef0-c03cfa0ae4a8",
    "type": "Loading",
    "containers": [
     {
      "identifier": "MSCU1000001",
      "teu": 1
     }
    ]
   },
   "unloadingManifest": {
    "id": "722cf397-ea4d-4c26-8a73-93a6e63b5400",
    "type": "Unloading",
    "containers": [
     {
      "identifier": "MSCU1000017",
      "teu": 1
     }
    ]
   },
   "crew": [
    {
     "name": "John Doe",
     "citizenId": "C1234",
     "nationality": "PT"
    }
   ],
   "arrivalTime": "2026-09-25T06:00:00",
   "desiredDepartureTime": "2026-09-25T10:00:00",
   "estimatedLoadingDurationMinutes": 60,
   "estimatedUnloadingDurationMinutes": 45
  }
 ],
 "vves": [
  {
   "id": "ddf221a4-f1d8-46c4-a9f4-b108b96fb863",
   "vesselVisitId": "fa3b6b9d-72f6-414a-9e7f-de6dc187aa04",
   "vesselIMO": "0260090",
   "actualArrivalTime": "2026-09-25T12:15:00.000Z",
   "status": "InProgress",
   "createdBy": "Demo Admin",
   "createdAt": "2026-09-25T15:04:52.378Z",
   "completedTime": null,
   "actualUnberthTime": null,
   "actualPortDepartureTime": null,
   "berthTime": null,
   "dockId": "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
   "discrepancy": null,
   "auditLog": [
    {
     "timestamp": "2026-09-25T15:04:52.378Z",
     "author": "Demo Admin",
     "action": "Created",
     "details": "Initial VVE creation"
    }
   ],
   "executedOperations": [],
   "metrics": {
    "waitingTimeMinutes": null,
    "berthOccupancyMinutes": null,
    "totalTurnaroundMinutes": null
   }
  },
  {
   "id": "a9b412b7-dd6e-4a11-976b-841fc42642f1",
   "vesselVisitId": "f578c1ed-3e0b-40c4-9113-fda0ac143dd4",
   "vesselIMO": "8666692",
   "actualArrivalTime": "2026-09-25T10:15:00.000Z",
   "status": "InProgress",
   "createdBy": "Demo Admin",
   "createdAt": "2026-09-25T15:04:52.372Z",
   "completedTime": null,
   "actualUnberthTime": null,
   "actualPortDepartureTime": null,
   "berthTime": null,
   "dockId": "732bd310-1ca9-4bde-a892-c8eb44e828ec",
   "discrepancy": null,
   "auditLog": [
    {
     "timestamp": "2026-09-25T15:04:52.372Z",
     "author": "Demo Admin",
     "action": "Created",
     "details": "Initial VVE creation"
    }
   ],
   "executedOperations": [],
   "metrics": {
    "waitingTimeMinutes": null,
    "berthOccupancyMinutes": null,
    "totalTurnaroundMinutes": null
   }
  },
  {
   "id": "592ade23-7e44-4361-b817-8391cb6a4e7d",
   "vesselVisitId": "86dbe038-28a2-41d5-8505-8b3506742b7e",
   "vesselIMO": "6268446",
   "actualArrivalTime": "2026-09-25T08:15:00.000Z",
   "status": "InProgress",
   "createdBy": "Demo Admin",
   "createdAt": "2026-09-25T15:04:52.365Z",
   "completedTime": null,
   "actualUnberthTime": null,
   "actualPortDepartureTime": null,
   "berthTime": null,
   "dockId": "732bd310-1ca9-4bde-a892-c8eb44e828ec",
   "discrepancy": null,
   "auditLog": [
    {
     "timestamp": "2026-09-25T15:04:52.365Z",
     "author": "Demo Admin",
     "action": "Created",
     "details": "Initial VVE creation"
    }
   ],
   "executedOperations": [],
   "metrics": {
    "waitingTimeMinutes": null,
    "berthOccupancyMinutes": null,
    "totalTurnaroundMinutes": null
   }
  },
  {
   "id": "2554f32c-5dc3-4041-8c58-47a573d5941c",
   "vesselVisitId": "1c6ac81e-4471-4a13-ac5a-10260cdce39c",
   "vesselIMO": "2221610",
   "actualArrivalTime": "2026-09-25T06:15:00.000Z",
   "status": "InProgress",
   "createdBy": "Demo Admin",
   "createdAt": "2026-09-25T15:04:52.351Z",
   "completedTime": null,
   "actualUnberthTime": null,
   "actualPortDepartureTime": null,
   "berthTime": null,
   "dockId": "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
   "discrepancy": null,
   "auditLog": [
    {
     "timestamp": "2026-09-25T15:04:52.347Z",
     "author": "Demo Admin",
     "action": "Created",
     "details": "Initial VVE creation"
    }
   ],
   "executedOperations": [],
   "metrics": {
    "waitingTimeMinutes": null,
    "berthOccupancyMinutes": null,
    "totalTurnaroundMinutes": null
   }
  }
 ],
 "incidentTypes": [
  {
   "id": "6ab68d9480725ae143a7553d",
   "code": "EQ-01",
   "name": "Equipment Failure",
   "description": "Breakdown of cranes or yard equipment",
   "severity": "Critical",
   "parentTypeId": null
  },
  {
   "id": "6ab68d9480725ae143a7553e",
   "code": "SF-01",
   "name": "Safety Inspection",
   "description": "Unplanned safety or security inspection",
   "severity": "Minor",
   "parentTypeId": null
  },
  {
   "id": "6ab68d9480725ae143a7553c",
   "code": "WX-01",
   "name": "Adverse Weather",
   "description": "Strong winds or fog affecting crane operations",
   "severity": "Major",
   "parentTypeId": null
  }
 ],
 "incidents": [
  {
   "id": "6ab68d9480725ae143a75541",
   "type": {
    "id": "6ab68d9480725ae143a7553e",
    "name": "Safety Inspection",
    "code": "SF-01"
   },
   "description": "Customs inspection of reefer containers",
   "startTime": "2026-09-25T11:00:00.000Z",
   "endTime": null,
   "status": "Active",
   "severity": "Minor",
   "scope": "Specific",
   "affectedVesselVisitIds": [
    {
     "vesselVisitId": "f578c1ed-3e0b-40c4-9113-fda0ac143dd4",
     "vesselIMO": "8666692",
     "id": "a9b412b7-dd6e-4a11-976b-841fc42642f1"
    }
   ],
   "createdBy": "Demo Admin",
   "durationMinutes": 244,
   "affectedVessels": [
    {
     "id": "a9b412b7-dd6e-4a11-976b-841fc42642f1",
     "name": "Unknown Vessel"
    }
   ]
  },
  {
   "id": "6ab68d9480725ae143a75540",
   "type": {
    "id": "6ab68d9480725ae143a7553d",
    "name": "Equipment Failure",
    "code": "EQ-01"
   },
   "description": "STS Crane #1 hydraulic failure at Dock A",
   "startTime": "2026-09-25T09:30:00.000Z",
   "endTime": null,
   "status": "Active",
   "severity": "Critical",
   "scope": "Specific",
   "affectedVesselVisitIds": [
    {
     "vesselVisitId": "1c6ac81e-4471-4a13-ac5a-10260cdce39c",
     "vesselIMO": "2221610",
     "id": "2554f32c-5dc3-4041-8c58-47a573d5941c"
    }
   ],
   "createdBy": "Demo Admin",
   "durationMinutes": 334,
   "affectedVessels": [
    {
     "id": "2554f32c-5dc3-4041-8c58-47a573d5941c",
     "name": "Unknown Vessel"
    }
   ]
  },
  {
   "id": "6ab68d9480725ae143a7553f",
   "type": {
    "id": "6ab68d9480725ae143a7553c",
    "name": "Adverse Weather",
    "code": "WX-01"
   },
   "description": "Wind gusts above 60 km/h: crane operations suspended",
   "startTime": "2026-09-25T07:00:00.000Z",
   "endTime": null,
   "status": "Active",
   "severity": "Major",
   "scope": "Global",
   "affectedVesselVisitIds": [],
   "createdBy": "Demo Admin",
   "durationMinutes": 484
  }
 ],
 "taskCategories": [
  {
   "id": "6ab68d9480725ae143a75542",
   "code": "CLEAN-01",
   "name": "Hold Cleaning",
   "description": "Cleaning of cargo holds between operations",
   "defaultDuration": 0,
   "expectedImpact": "Parallel"
  },
  {
   "id": "6ab68d9480725ae143a75543",
   "code": "MAINT-01",
   "name": "Preventive Maintenance",
   "description": "Scheduled maintenance of port equipment",
   "defaultDuration": 0,
   "expectedImpact": "Suspension"
  },
  {
   "id": "6ab68d9480725ae143a75544",
   "code": "SEC-01",
   "name": "Security Check",
   "description": "ISPS security verification",
   "defaultDuration": 0,
   "expectedImpact": "Parallel"
  }
 ],
 "tasks": [
  {
   "id": "6ab68d9480725ae143a75547",
   "category": {
    "id": "6ab68d9480725ae143a75544",
    "code": "SEC-01",
    "name": "Security Check",
    "description": "ISPS security verification",
    "defaultDuration": 0,
    "expectedImpact": "Parallel"
   },
   "responsibleTeam": "Port Security",
   "startTime": "2026-09-25T14:00:00.000Z",
   "endTime": null,
   "status": "Ongoing",
   "vesselVisitExecutionId": {
    "vesselVisitId": "fa3b6b9d-72f6-414a-9e7f-de6dc187aa04",
    "vesselIMO": "0260090",
    "actualArrivalTime": "2026-09-25T12:15:00.000Z",
    "berthTime": null,
    "dockId": "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
    "createdBy": "Demo Admin",
    "status": "InProgress",
    "completedTime": null,
    "actualUnberthTime": null,
    "actualPortDepartureTime": null,
    "executedOperations": [],
    "auditLog": [
     {
      "timestamp": "2026-09-25T15:04:52.378Z",
      "author": "Demo Admin",
      "action": "Created",
      "details": "Initial VVE creation"
     }
    ],
    "createdAt": "2026-09-25T15:04:52.378Z",
    "updatedAt": "2026-09-25T15:04:52.378Z",
    "id": "ddf221a4-f1d8-46c4-a9f4-b108b96fb863"
   }
  },
  {
   "id": "6ab68d9480725ae143a75546",
   "category": {
    "id": "6ab68d9480725ae143a75543",
    "code": "MAINT-01",
    "name": "Preventive Maintenance",
    "description": "Scheduled maintenance of port equipment",
    "defaultDuration": 0,
    "expectedImpact": "Suspension"
   },
   "responsibleTeam": "Maintenance Team",
   "startTime": "2026-09-25T12:30:00.000Z",
   "endTime": null,
   "status": "Ongoing",
   "vesselVisitExecutionId": {
    "vesselVisitId": "86dbe038-28a2-41d5-8505-8b3506742b7e",
    "vesselIMO": "6268446",
    "actualArrivalTime": "2026-09-25T08:15:00.000Z",
    "berthTime": null,
    "dockId": "732bd310-1ca9-4bde-a892-c8eb44e828ec",
    "createdBy": "Demo Admin",
    "status": "InProgress",
    "completedTime": null,
    "actualUnberthTime": null,
    "actualPortDepartureTime": null,
    "executedOperations": [],
    "auditLog": [
     {
      "timestamp": "2026-09-25T15:04:52.365Z",
      "author": "Demo Admin",
      "action": "Created",
      "details": "Initial VVE creation"
     }
    ],
    "createdAt": "2026-09-25T15:04:52.365Z",
    "updatedAt": "2026-09-25T15:04:52.365Z",
    "id": "592ade23-7e44-4361-b817-8391cb6a4e7d"
   }
  },
  {
   "id": "6ab68d9480725ae143a75545",
   "category": {
    "id": "6ab68d9480725ae143a75542",
    "code": "CLEAN-01",
    "name": "Hold Cleaning",
    "description": "Cleaning of cargo holds between operations",
    "defaultDuration": 0,
    "expectedImpact": "Parallel"
   },
   "responsibleTeam": "Cleaning Crew B",
   "startTime": "2026-09-25T10:00:00.000Z",
   "endTime": null,
   "status": "Ongoing",
   "vesselVisitExecutionId": {
    "vesselVisitId": "1c6ac81e-4471-4a13-ac5a-10260cdce39c",
    "vesselIMO": "2221610",
    "actualArrivalTime": "2026-09-25T06:15:00.000Z",
    "berthTime": null,
    "dockId": "08a7dcb9-11d2-4ba5-bbd0-ccb796ec9361",
    "createdBy": "Demo Admin",
    "status": "InProgress",
    "completedTime": null,
    "actualUnberthTime": null,
    "actualPortDepartureTime": null,
    "executedOperations": [],
    "auditLog": [
     {
      "timestamp": "2026-09-25T15:04:52.347Z",
      "author": "Demo Admin",
      "action": "Created",
      "details": "Initial VVE creation"
     }
    ],
    "createdAt": "2026-09-25T15:04:52.351Z",
    "updatedAt": "2026-09-25T15:04:52.351Z",
    "id": "2554f32c-5dc3-4041-8c58-47a573d5941c"
   }
  }
 ],
 "operationPlans": [
  {
   "id": "6d1f8c83-3e7a-4c73-8e09-362df095827d",
   "scheduleDate": "2026-09-25",
   "heuristicUsed": "Genetic Algorithm",
   "status": "Draft",
   "totalDelayMinutes": 25,
   "runtimeSeconds": 1.8,
   "author": "Demo Admin",
   "items": [
    {
     "id": "256adb6d-480f-4b91-aa0c-82b4e01ac9db",
     "vesselVisitId": "1c6ac81e-4471-4a13-ac5a-10260cdce39c",
     "vesselIMO": "2221610",
     "serviceStartTime": "2026-09-25T06:00:00.000Z",
     "serviceEndTime": "2026-09-25T08:30:00.000Z",
     "unloadingStartTime": "2026-09-25T06:00:00.000Z",
     "unloadingEndTime": "2026-09-25T06:07:53.684Z",
     "loadingStartTime": "2026-09-25T06:07:53.684Z",
     "loadingEndTime": "2026-09-25T08:29:59.999Z",
     "numberOfCranes": 1,
     "numberOfStaff": 1
    },
    {
     "id": "68f6d18b-c92c-4dbe-8cbb-2ad15e504d71",
     "vesselVisitId": "86dbe038-28a2-41d5-8505-8b3506742b7e",
     "vesselIMO": "6268446",
     "serviceStartTime": "2026-09-25T09:00:00.000Z",
     "serviceEndTime": "2026-09-25T11:30:00.000Z",
     "unloadingStartTime": "2026-09-25T09:00:00.000Z",
     "unloadingEndTime": "2026-09-25T11:24:00.000Z",
     "loadingStartTime": "2026-09-25T11:24:00.000Z",
     "loadingEndTime": "2026-09-25T11:30:00.000Z",
     "numberOfCranes": 2,
     "numberOfStaff": 1
    },
    {
     "id": "6e7b16de-2266-49bf-83f8-ab8d5c6a6839",
     "vesselVisitId": "f578c1ed-3e0b-40c4-9113-fda0ac143dd4",
     "vesselIMO": "8666692",
     "serviceStartTime": "2026-09-25T12:00:00.000Z",
     "serviceEndTime": "2026-09-25T14:30:00.000Z",
     "unloadingStartTime": "2026-09-25T12:00:00.000Z",
     "unloadingEndTime": "2026-09-25T13:04:17.142Z",
     "loadingStartTime": "2026-09-25T13:04:17.142Z",
     "loadingEndTime": "2026-09-25T14:29:59.999Z",
     "numberOfCranes": 1,
     "numberOfStaff": 1
    },
    {
     "id": "cc6382eb-a4cd-4b55-b278-058cd42ff769",
     "vesselVisitId": "fa3b6b9d-72f6-414a-9e7f-de6dc187aa04",
     "vesselIMO": "0260090",
     "serviceStartTime": "2026-09-25T15:00:00.000Z",
     "serviceEndTime": "2026-09-25T17:30:00.000Z",
     "unloadingStartTime": "2026-09-25T15:00:00.000Z",
     "unloadingEndTime": "2026-09-25T16:04:17.142Z",
     "loadingStartTime": "2026-09-25T16:04:17.142Z",
     "loadingEndTime": "2026-09-25T17:29:59.999Z",
     "numberOfCranes": 2,
     "numberOfStaff": 1
    }
   ]
  }
 ],
 "privacyLatest": {
  "_id": "6ab68d9480725ae143a75548",
  "content": "Sines Port Management System - Privacy Policy\n\nThis is a demonstration. Personal data shown in the demo (names, e-mails, phone numbers) is fictitious.\n\nIn production, personal data of port staff and shipping representatives is processed only for port operations, kept for the minimum period required by law and can be exported or deleted on request (GDPR).",
  "version": "1.0",
  "isActive": true,
  "adminId": "Demo Admin",
  "publishedAt": "2026-09-25T15:04:52.441Z",
  "__v": 0
 },
 "privacyHistory": [
  {
   "_id": "6ab68d9480725ae143a75548",
   "content": "Sines Port Management System - Privacy Policy\n\nThis is a demonstration. Personal data shown in the demo (names, e-mails, phone numbers) is fictitious.\n\nIn production, personal data of port staff and shipping representatives is processed only for port operations, kept for the minimum period required by law and can be exported or deleted on request (GDPR).",
   "version": "1.0",
   "isActive": true,
   "adminId": "Demo Admin",
   "publishedAt": "2026-09-25T15:04:52.441Z",
   "__v": 0
  }
 ],
 "adminUsers": [
  {
   "id": "u-1",
   "displayName": "Demo User",
   "email": "demo@sinesport.pt",
   "roles": [
    "Admin"
   ],
   "enabled": true
  },
  {
   "id": "u-2",
   "displayName": "Alice Ferreira",
   "email": "alice@port.pt",
   "roles": [
    "Operator"
   ],
   "enabled": true
  },
  {
   "id": "u-3",
   "displayName": "Bruno Costa",
   "email": "bruno@port.pt",
   "roles": [
    "Officer"
   ],
   "enabled": true
  },
  {
   "id": "u-4",
   "displayName": "Ana Martins",
   "email": "ana.martins@atlantic.com",
   "roles": [
    "Representative"
   ],
   "enabled": true
  },
  {
   "id": "u-5",
   "displayName": "Carla Sousa",
   "email": "carla@port.pt",
   "roles": [
    "Officer"
   ],
   "enabled": false
  }
 ]
};

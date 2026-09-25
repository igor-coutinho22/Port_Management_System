require('isomorphic-fetch'); // Required for Graph Client
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');

// Credentials are created on first use so the service can start without Azure configuration
let credential = null;
const getCredential = () => {
    if (!credential) {
        credential = new ClientSecretCredential(
            process.env.AZURE_TENANT_ID,
            process.env.AZURE_CLIENT_ID,
            process.env.AZURE_CLIENT_SECRET
        );
    }
    return credential;
};

// Create the Client instance
const graphClient = Client.initWithMiddleware({
    authProvider: {
        getAccessToken: async () => {
            const token = await getCredential().getToken('https://graph.microsoft.com/.default');
            return token.token;
        }
    }
});

module.exports = graphClient;
require('isomorphic-fetch'); // Required for Graph Client
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');

// Initialize Credentials
const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
);

// Create the Client instance
const graphClient = Client.initWithMiddleware({
    authProvider: {
        getAccessToken: async () => {
            const token = await credential.getToken('https://graph.microsoft.com/.default');
            return token.token;
        }
    }
});

module.exports = graphClient;
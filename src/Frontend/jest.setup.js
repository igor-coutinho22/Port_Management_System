// Shim for React Global (since we use CDN in production but Modules in test)
global.React = require('react');
global.ReactDOM = require('react-dom');

// Mock MSAL Config if needed
global.msalConfig = {
    auth: {
        clientId: 'mock-client-id',
    },
};

global.loginRequest = {
    scopes: ['User.Read'],
};

// Mock window.app
global.window.app = {
    navigate: jest.fn(),
};

// Mock AuthGate global
global.AuthGate = ({ children }) => <div>{children}</div>;

module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/jest.setup.js'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.dom.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
    testMatch: ['**/tests/**/*.test.[jt]s?(x)'],
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
};

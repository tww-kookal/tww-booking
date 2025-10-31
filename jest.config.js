export const moduleNameMapper = {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1"};
export const setupFilesAfterEnv = ['<rootDir>/jest.setup.js'];
export const testEnvironment = 'jsdom';
export const transform = {
    '^.+\\.jsx?$': 'babel-jest'
};
export const transformIgnorePatterns = ['/node_modules/(?!(@react-oauth/google|react-toastify))'];
export const moduleFileExtensions = ['js', 'jsx', 'json', 'node'];
export const collectCoverageFrom = [
    "src/**/*.{js,jsx}",
    "!src/index.js",
    "!src/reportWebVitals.js"
]


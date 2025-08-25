export const moduleNameMapper = {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
};
export const setupFilesAfterEnv = ['<rootDir>/jest.setup.js'];
export const testEnvironment = 'jsdom';
export const transform = {
    '^.+\\.jsx?$': 'babel-jest'
};
export const transformIgnorePatterns = ['/node_modules/(?!(@react-oauth/google|react-toastify))'];
export const moduleFileExtensions = ['js', 'jsx', 'json', 'node'];
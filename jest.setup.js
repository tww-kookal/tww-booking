// jest.setup.js

// Extend Jest with additional matchers from React Testing Library
import '@testing-library/jest-dom/extend-expect';

// Polyfill fetch if your code uses it
import 'whatwg-fetch';

// Mocks for browser APIs like localStorage, matchMedia, etc.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),    // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ✅ Mock Google OAuth 2 Token Client
global.google = {
  accounts: {
    oauth2: {
      initTokenClient: jest.fn(() => ({
        requestAccessToken: jest.fn(() => {
          console.log("✅ Mock token requested");
        }),
      })),
    },
    id: {
      initialize: jest.fn(),
      prompt: jest.fn(),
      renderButton: jest.fn(),
    },
  },
};

// ✅ Mock gapi (Google API client)
global.gapi = {
  load: jest.fn((apiName, callback) => {
    console.log(`✅ Mock gapi.load called for: ${apiName}`);
    callback(); // simulate load success
  }),
  client: {
    init: jest.fn().mockResolvedValue(),
    request: jest.fn().mockResolvedValue({ result: {} }),
  },
};

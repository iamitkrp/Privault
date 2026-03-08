import '@testing-library/jest-dom';

// Mock window.crypto for Node.js environment
if (typeof window !== 'undefined' && !window.crypto?.subtle) {
    const { webcrypto } = require('crypto');
    Object.defineProperty(window, 'crypto', {
        value: webcrypto,
    });
}

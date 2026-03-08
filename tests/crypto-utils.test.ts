/**
 * Unit tests for crypto utility functions.
 * Tests pure functions that can run in jsdom/node.
 */

// We need to polyfill TextEncoder/TextDecoder for jsdom
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { base64ToBuffer, textToBuffer, bufferToText } from '@/lib/crypto/engine';
import { bufferToBase64 } from '@/lib/crypto/core';

describe('Crypto Engine - Utility Functions', () => {
    describe('textToBuffer / bufferToText', () => {
        it('should roundtrip text to buffer and back', () => {
            const original = 'Hello, Privault!';
            const buffer = textToBuffer(original);
            const result = bufferToText(buffer);
            expect(result).toBe(original);
        });

        it('should handle empty strings', () => {
            const buffer = textToBuffer('');
            expect(buffer.length).toBe(0);
            expect(bufferToText(buffer)).toBe('');
        });

        it('should handle special characters', () => {
            const special = '{"key": "value", "special": "<>&\\""}';
            const buffer = textToBuffer(special);
            const result = bufferToText(buffer);
            expect(result).toBe(special);
        });
    });

    describe('base64ToBuffer / bufferToBase64', () => {
        it('should roundtrip base64 encoding/decoding', () => {
            const original = new Uint8Array([72, 101, 108, 108, 111]);
            const base64 = bufferToBase64(original);
            const result = base64ToBuffer(base64);
            expect(Array.from(result)).toEqual(Array.from(original));
        });

        it('should produce valid base64 strings', () => {
            const buffer = new Uint8Array([0, 128, 255, 1, 50]);
            const base64 = bufferToBase64(buffer);
            // Base64 should only contain alphanumeric, +, /, =
            expect(base64).toMatch(/^[A-Za-z0-9+/=]+$/);
        });
    });
});

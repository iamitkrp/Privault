import { CRYPTO_CONFIG } from "@/constants";
import {
    deriveKeyFromPassword,
    encryptData,
    decryptData,
    hashPasswordForStorage
} from "@/lib/crypto/engine";
import { generateSalt } from "@/lib/crypto/core";

// Simple helper to run tests in node or browser console easily
export async function runCryptoTests() {
    console.log("Starting Crypto Engine Tests...");
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, msg: string) => {
        if (condition) {
            console.log(`✅ ${msg}`);
            passed++;
        } else {
            console.error(`❌ FAILED: ${msg}`);
            failed++;
        }
    };

    try {
        const password = "my-super-secret-master-password";
        const salt = generateSalt();

        // 1. PBKDF2 Key Derivation
        console.log(`Deriving key with ${CRYPTO_CONFIG.iterations} iterations...`);
        const key = await deriveKeyFromPassword(password, salt);
        assert(key.algorithm.name === CRYPTO_CONFIG.algorithm, "Key derivation algorithm matches config");

        // 2. AES-GCM Encrypt/Decrypt Identity
        const secretMessage = '{"username":"admin","password":"password123"}';
        const encryptedResult = await encryptData(secretMessage, key);

        assert(!!encryptedResult.encryptedData, "Encrypt yields cipher data");
        assert(!!encryptedResult.iv, "Encrypt yields IV");
        assert(encryptedResult.iv.length > 0, "IV is properly sized base64");

        const decrypted = await decryptData(
            encryptedResult.encryptedData,
            encryptedResult.iv,
            key
        );

        assert(decrypted === secretMessage, "Decrypted text exactly matches plaintext");

        // 3. Decrypt Failure on Bad Data
        try {
            // Modify a character in the ciphertext
            const badCipher = encryptedResult.encryptedData.substring(0, 10) + "A" + encryptedResult.encryptedData.substring(11);
            await decryptData(badCipher, encryptedResult.iv, key);
            assert(false, "Decryption should have failed on tampered data");
        } catch (err) {
            assert(true, "Decryption safely rejected tampered ciphertext (GCM Tag check)");
        }

        // 4. Password Hashing match
        const hash1 = await hashPasswordForStorage(password);
        const hash2 = await hashPasswordForStorage(password);
        assert(hash1 === hash2, "Password hashing is deterministic");

        console.log(`\nTests Complete! Passed: ${passed} | Failed: ${failed}`);
    } catch (err) {
        console.error("Test suite crashed!", err);
    }
}

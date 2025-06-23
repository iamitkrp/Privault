import { 
  generateSalt, 
  deriveKey, 
  encrypt, 
  decrypt, 
  createPassphraseVerification,
  verifyPassphrase,
  generateSecurePassword,
  hashData
} from '@/lib/crypto/crypto-utils';
import { cryptoService } from '@/services/crypto.service';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';

/**
 * Test Crypto Functions
 * Run these in browser console to verify cryptographic functionality
 */

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testCrypto = {
    // Basic crypto utils
    generateSalt,
    deriveKey,
    encrypt,
    decrypt,
    createPassphraseVerification,
    verifyPassphrase,
    generateSecurePassword,
    hashData,
    
    // High-level services
    cryptoService,
    passphraseManager,
    
    // Test functions
    async runBasicCryptoTest() {
      console.log('🧪 Starting Basic Crypto Tests...\n');
      
      try {
        // Test 1: Salt generation
        console.log('1️⃣ Testing salt generation...');
        const salt = generateSalt();
        console.log('✅ Salt generated:', salt.substring(0, 20) + '...');
        
        // Test 2: Key derivation
        console.log('\n2️⃣ Testing key derivation...');
        const testPassphrase = 'TestPassword123!';
        const key = await deriveKey(testPassphrase, salt);
        console.log('✅ Key derived successfully');
        
        // Test 3: Encryption/Decryption
        console.log('\n3️⃣ Testing encryption/decryption...');
        const testData = 'Hello, this is secret data!';
        const { encryptedData, iv } = await encrypt(testData, key);
        console.log('✅ Data encrypted');
        
        const decryptedData = await decrypt(encryptedData, iv, key);
        console.log('✅ Data decrypted:', decryptedData);
        console.log('✅ Encryption/decryption match:', testData === decryptedData);
        
        // Test 4: Passphrase verification
        console.log('\n4️⃣ Testing passphrase verification...');
        const { testEncryptedData, testIv } = await createPassphraseVerification(testPassphrase, salt);
        const isValidPassphrase = await verifyPassphrase(
          testPassphrase, 
          salt, 
          testEncryptedData, 
          testIv, 
          'privault-test-string'
        );
        console.log('✅ Passphrase verification:', isValidPassphrase);
        
        // Test 5: Password generation
        console.log('\n5️⃣ Testing password generation...');
        const generatedPassword = generateSecurePassword(16, true);
        console.log('✅ Generated password:', generatedPassword);
        
        // Test 6: Data hashing
        console.log('\n6️⃣ Testing data hashing...');
        const hash = await hashData('test data');
        console.log('✅ Hash generated:', hash.substring(0, 20) + '...');
        
        console.log('\n🎉 All basic crypto tests passed!');
        return true;
        
      } catch (error) {
        console.error('❌ Crypto test failed:', error);
        return false;
      }
    },
    
    async runCryptoServiceTest() {
      console.log('🧪 Starting Crypto Service Tests...\n');
      
      try {
        // Test 1: Initialize user crypto
        console.log('1️⃣ Testing user crypto initialization...');
        const masterPassphrase = 'MySecretPassphrase123!';
        const initResult = await cryptoService.initializeUserCrypto(masterPassphrase);
        
        if (!initResult.success) {
          throw new Error('Failed to initialize user crypto');
        }
        
        console.log('✅ User crypto initialized');
        console.log('Salt:', initResult.salt?.substring(0, 20) + '...');
        
        // Test 2: Unlock vault
        console.log('\n2️⃣ Testing vault unlock...');
        const unlockResult = await cryptoService.unlockVault(
          masterPassphrase,
          initResult.salt!,
          initResult.testEncryptedData!,
          initResult.testIv!
        );
        
        if (!unlockResult.success) {
          throw new Error('Failed to unlock vault');
        }
        
        console.log('✅ Vault unlocked successfully');
        console.log('Vault status:', cryptoService.isVaultUnlocked());
        
        // Test 3: Encrypt/decrypt vault items
        console.log('\n3️⃣ Testing vault item encryption...');
        const testVaultItem = {
          type: 'login' as const,
          name: 'Test Website',
          username: 'testuser@example.com',
          password: 'TestPassword123!',
          url: 'https://example.com',
          notes: 'Test notes for this credential',
          tags: ['test', 'example'],
          customFields: {},
          favorite: false
        };
        
        const encryptResult = await cryptoService.encryptVaultItem(testVaultItem);
        if (!encryptResult.success) {
          throw new Error('Failed to encrypt vault item');
        }
        
        console.log('✅ Vault item encrypted');
        
        const decryptResult = await cryptoService.decryptVaultItem(
          encryptResult.encryptedData!,
          encryptResult.iv!
        );
        
        if (!decryptResult.success) {
          throw new Error('Failed to decrypt vault item');
        }
        
        console.log('✅ Vault item decrypted');
        console.log('Original vs Decrypted:', 
          JSON.stringify(testVaultItem) === JSON.stringify(decryptResult.item)
        );
        
        // Test 4: Session management
        console.log('\n4️⃣ Testing session management...');
        const sessionInfo = cryptoService.getSessionInfo();
        console.log('✅ Session info:', {
          isActive: sessionInfo.isActive,
          timeRemaining: Math.round(sessionInfo.timeRemaining! / 1000) + 's'
        });
        
        console.log('\n🎉 All crypto service tests passed!');
        return true;
        
      } catch (error) {
        console.error('❌ Crypto service test failed:', error);
        return false;
      }
    },
    
    async runAllTests() {
      console.log('🚀 Running All Crypto Tests...\n');
      
      const basicTests = await this.runBasicCryptoTest();
      console.log('\n' + '='.repeat(50) + '\n');
      const serviceTests = await this.runCryptoServiceTest();
      
      console.log('\n' + '='.repeat(50));
      console.log('📊 Test Results:');
      console.log('Basic Crypto Tests:', basicTests ? '✅ PASSED' : '❌ FAILED');
      console.log('Crypto Service Tests:', serviceTests ? '✅ PASSED' : '❌ FAILED');
      console.log('Overall Status:', (basicTests && serviceTests) ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED');
      
      return basicTests && serviceTests;
    }
  };
  
  console.log('🧪 Crypto testing utilities loaded! Available commands:');
  console.log('- testCrypto.runBasicCryptoTest()');
  console.log('- testCrypto.runCryptoServiceTest()');
  console.log('- testCrypto.runAllTests()');
} 
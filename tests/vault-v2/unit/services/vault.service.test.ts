/**
 * Vault Service - Unit Tests
 * 
 * Comprehensive test suite for VaultService.
 */

import { VaultService } from '@/lib/vault-v2/services/vault.service';
import { CredentialCategory, ChangeReason, ExpirationStatus } from '@/lib/vault-v2/core/types';

// Mock implementations would be imported from mocks directory
const createMockRepository = () => ({
  findById: jest.fn(),
  findByUser: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  incrementAccessCount: jest.fn(),
});

const createMockEncryption = () => ({
  encrypt: jest.fn().mockResolvedValue({ encrypted: 'encrypted-data', iv: 'mock-iv' }),
  decrypt: jest.fn().mockResolvedValue(JSON.stringify({
    site: 'example.com',
    username: 'user@example.com',
    password: 'TestPass123!',
  })),
});

const createMockHistory = () => ({
  addToHistory: jest.fn(),
  checkPasswordReuse: jest.fn().mockResolvedValue(false),
});

const createMockExpiration = () => ({
  calculateExpirationDate: jest.fn().mockReturnValue(null),
  calculateExpirationStatus: jest.fn().mockReturnValue(ExpirationStatus.ACTIVE),
});

const createMockPasswordStrength = () => ({
  analyze: jest.fn().mockReturnValue({ 
    score: 3, 
    feedback: { warning: '', suggestions: [] } 
  }),
});

const mockMasterKey = {} as CryptoKey;

describe('VaultService', () => {
  let service: VaultService;
  let mockRepo: ReturnType<typeof createMockRepository>;
  let mockEncryption: ReturnType<typeof createMockEncryption>;
  let mockHistory: ReturnType<typeof createMockHistory>;
  let mockExpiration: ReturnType<typeof createMockExpiration>;
  let mockPasswordStrength: ReturnType<typeof createMockPasswordStrength>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    mockEncryption = createMockEncryption();
    mockHistory = createMockHistory();
    mockExpiration = createMockExpiration();
    mockPasswordStrength = createMockPasswordStrength();

    service = new VaultService(
      mockRepo,
      mockEncryption,
      mockHistory,
      mockExpiration,
      mockPasswordStrength,
      'test-user-id',
      mockMasterKey
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCredential', () => {
    const validInput = {
      site: 'example.com',
      username: 'user@example.com',
      password: 'SecurePass123!',
      category: CredentialCategory.WORK,
    };

    it('should create and encrypt credential successfully', async () => {
      const mockCreated = {
        id: 'test-id',
        user_id: 'test-user-id',
        credential_id: 'test-credential-id',
        encrypted_data: 'encrypted-data',
        iv: 'mock-iv',
        category: CredentialCategory.WORK,
        tags: [],
        is_favorite: false,
        expires_at: null,
        expiration_status: ExpirationStatus.ACTIVE,
        last_password_change: new Date(),
        access_count: 0,
        last_accessed: null,
        version: 1,
        is_deleted: false,
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepo.create.mockResolvedValue(mockCreated);

      const result = await service.createCredential(validInput);

      expect(result.success).toBe(true);
      expect(mockEncryption.encrypt).toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('should return error for invalid input', async () => {
      const invalidInput = {
        site: '',
        username: '',
        password: '',
        category: CredentialCategory.WORK,
      };

      const result = await service.createCredential(invalidInput);

      expect(result.success).toBe(false);
    });

    it('should set expiration when config provided', async () => {
      const inputWithExpiration = {
        ...validInput,
        expiration_config: {
          enabled: true,
          days: 90,
          notify_days_before: [7, 3, 1],
        },
      };

      const expirationDate = new Date();
      mockExpiration.calculateExpirationDate.mockReturnValue(expirationDate);
      mockRepo.create.mockResolvedValue({} as any);

      await service.createCredential(inputWithExpiration);

      expect(mockExpiration.calculateExpirationDate).toHaveBeenCalledWith(90);
    });
  });

  describe('getCredential', () => {
    it('should retrieve and decrypt credential', async () => {
      const mockCredential = {
        id: 'test-id',
        credential_id: 'test-credential-id',
        encrypted_data: 'encrypted',
        iv: 'iv',
        // ... other fields
      };

      mockRepo.findById.mockResolvedValue(mockCredential as any);

      const result = await service.getCredential('test-credential-id');

      expect(result.success).toBe(true);
      expect(mockEncryption.decrypt).toHaveBeenCalled();
      expect(mockPasswordStrength.analyze).toHaveBeenCalled();
    });

    it('should return error when credential not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const result = await service.getCredential('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('CREDENTIAL_NOT_FOUND');
    });
  });

  describe('updateCredential', () => {
    it('should update credential with version check', async () => {
      const currentCredential = {
        id: 'test-id',
        credential_id: 'test-credential-id',
        version: 1,
        encrypted_data: 'old-data',
        iv: 'old-iv',
      };

      mockRepo.findById.mockResolvedValue(currentCredential as any);
      mockRepo.update.mockResolvedValue({ ...currentCredential, version: 2 } as any);

      const updateData = {
        site: 'updated.com',
        version: 1,
      };

      const result = await service.updateCredential('test-credential-id', updateData);

      expect(result.success).toBe(true);
      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('should add to history when password changes', async () => {
      const currentCredential = {
        credential_id: 'test-id',
        version: 1,
        encrypted_data: 'data',
        iv: 'iv',
      };

      mockRepo.findById.mockResolvedValue(currentCredential as any);
      mockRepo.update.mockResolvedValue({} as any);

      const updateData = {
        password: 'NewPassword123!',
        version: 1,
      };

      await service.updateCredential('test-id', updateData);

      expect(mockHistory.addToHistory).toHaveBeenCalled();
    });

    it('should return error on version mismatch', async () => {
      const currentCredential = {
        version: 2,
        encrypted_data: 'data',
        iv: 'iv',
      };

      mockRepo.findById.mockResolvedValue(currentCredential as any);

      const updateData = {
        site: 'updated.com',
        version: 1, // Mismatched version
      };

      const result = await service.updateCredential('test-id', updateData);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('OPTIMISTIC_LOCK_FAILED');
    });
  });

  describe('deleteCredential', () => {
    it('should soft delete credential by default', async () => {
      mockRepo.findById.mockResolvedValue({} as any);
      mockRepo.delete.mockResolvedValue();

      const result = await service.deleteCredential('test-id');

      expect(result.success).toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith('test-user-id', 'test-id', false);
    });

    it('should hard delete when specified', async () => {
      mockRepo.findById.mockResolvedValue({} as any);
      mockRepo.delete.mockResolvedValue();

      const result = await service.deleteCredential('test-id', true);

      expect(result.success).toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith('test-user-id', 'test-id', true);
    });
  });

  describe('getVaultStats', () => {
    it('should calculate vault statistics', async () => {
      const mockCredentials = [
        {
          id: '1',
          category: CredentialCategory.WORK,
          expiration_status: ExpirationStatus.ACTIVE,
          is_favorite: true,
          access_count: 10,
          encrypted_data: 'data1',
          iv: 'iv1',
        },
        {
          id: '2',
          category: CredentialCategory.PERSONAL,
          expiration_status: ExpirationStatus.EXPIRED,
          is_favorite: false,
          access_count: 5,
          encrypted_data: 'data2',
          iv: 'iv2',
        },
      ];

      mockRepo.findByUser.mockResolvedValue(mockCredentials as any);

      const result = await service.getVaultStats();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total_credentials).toBe(2);
        expect(result.data.favorites).toBe(1);
        expect(result.data.expired).toBe(1);
      }
    });
  });
});


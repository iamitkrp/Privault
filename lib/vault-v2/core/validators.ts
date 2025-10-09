/**
 * Privault Vault V2 - Validators
 * 
 * Validation utilities for vault data.
 */

import { 
  CreateCredentialDTO, 
  UpdateCredentialDTO, 
  CredentialCategory,
  ExpirationConfig 
} from './types';
import { ValidationError } from './errors';
import { VALIDATION } from './constants';

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Validates a URL string
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates an email string
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a tag name
 */
export function isValidTag(tag: string): boolean {
  return tag.length > 0 && tag.length <= VALIDATION.TAG_MAX_LENGTH;
}

/**
 * Validates category
 */
export function isValidCategory(category: string): category is CredentialCategory {
  return Object.values(CredentialCategory).includes(category as CredentialCategory);
}

// ==========================================
// CREDENTIAL VALIDATORS
// ==========================================

/**
 * Validates CreateCredentialDTO
 */
export function validateCreateCredential(data: CreateCredentialDTO): void {
  const errors: string[] = [];

  // Required fields
  if (!data.site || data.site.trim().length === 0) {
    errors.push('Site name is required');
  } else if (data.site.length > VALIDATION.SITE_MAX_LENGTH) {
    errors.push(`Site name must be less than ${VALIDATION.SITE_MAX_LENGTH} characters`);
  }

  if (!data.username || data.username.trim().length === 0) {
    errors.push('Username is required');
  } else if (data.username.length > VALIDATION.USERNAME_MAX_LENGTH) {
    errors.push(`Username must be less than ${VALIDATION.USERNAME_MAX_LENGTH} characters`);
  }

  if (!data.password || data.password.length === 0) {
    errors.push('Password is required');
  }

  // Category validation
  if (!isValidCategory(data.category)) {
    errors.push('Invalid category');
  }

  // Optional fields validation
  if (data.url && !isValidUrl(data.url)) {
    errors.push('Invalid URL format');
  }

  if (data.url && data.url.length > VALIDATION.URL_MAX_LENGTH) {
    errors.push(`URL must be less than ${VALIDATION.URL_MAX_LENGTH} characters`);
  }

  if (data.notes && data.notes.length > VALIDATION.NOTES_MAX_LENGTH) {
    errors.push(`Notes must be less than ${VALIDATION.NOTES_MAX_LENGTH} characters`);
  }

  // Tags validation
  if (data.tags) {
    if (data.tags.length > VALIDATION.TAG_MAX_COUNT) {
      errors.push(`Maximum ${VALIDATION.TAG_MAX_COUNT} tags allowed`);
    }

    for (const tag of data.tags) {
      if (!isValidTag(tag)) {
        errors.push(`Tag "${tag}" is invalid (max ${VALIDATION.TAG_MAX_LENGTH} characters)`);
      }
    }
  }

  // Custom fields validation
  if (data.custom_fields) {
    const fieldCount = Object.keys(data.custom_fields).length;
    if (fieldCount > VALIDATION.CUSTOM_FIELD_MAX_COUNT) {
      errors.push(`Maximum ${VALIDATION.CUSTOM_FIELD_MAX_COUNT} custom fields allowed`);
    }

    for (const [key, value] of Object.entries(data.custom_fields)) {
      if (key.length > VALIDATION.CUSTOM_FIELD_KEY_MAX_LENGTH) {
        errors.push(`Custom field key "${key}" is too long`);
      }
      if (value.length > VALIDATION.CUSTOM_FIELD_VALUE_MAX_LENGTH) {
        errors.push(`Custom field value for "${key}" is too long`);
      }
    }
  }

  // Expiration config validation
  if (data.expiration_config) {
    validateExpirationConfig(data.expiration_config, errors);
  }

  if (errors.length > 0) {
    throw new ValidationError('Credential validation failed', undefined, errors);
  }
}

/**
 * Validates UpdateCredentialDTO
 */
export function validateUpdateCredential(data: UpdateCredentialDTO): void {
  const errors: string[] = [];

  // Version is required for optimistic locking
  if (typeof data.version !== 'number' || data.version < 1) {
    errors.push('Valid version number is required');
  }

  // Validate provided fields (all optional in update)
  if (data.site !== undefined) {
    if (data.site.trim().length === 0) {
      errors.push('Site name cannot be empty');
    } else if (data.site.length > VALIDATION.SITE_MAX_LENGTH) {
      errors.push(`Site name must be less than ${VALIDATION.SITE_MAX_LENGTH} characters`);
    }
  }

  if (data.username !== undefined) {
    if (data.username.trim().length === 0) {
      errors.push('Username cannot be empty');
    } else if (data.username.length > VALIDATION.USERNAME_MAX_LENGTH) {
      errors.push(`Username must be less than ${VALIDATION.USERNAME_MAX_LENGTH} characters`);
    }
  }

  if (data.password !== undefined && data.password.length === 0) {
    errors.push('Password cannot be empty');
  }

  if (data.category !== undefined && !isValidCategory(data.category)) {
    errors.push('Invalid category');
  }

  if (data.url !== undefined && data.url.length > 0 && !isValidUrl(data.url)) {
    errors.push('Invalid URL format');
  }

  if (data.url !== undefined && data.url.length > VALIDATION.URL_MAX_LENGTH) {
    errors.push(`URL must be less than ${VALIDATION.URL_MAX_LENGTH} characters`);
  }

  if (data.notes !== undefined && data.notes.length > VALIDATION.NOTES_MAX_LENGTH) {
    errors.push(`Notes must be less than ${VALIDATION.NOTES_MAX_LENGTH} characters`);
  }

  if (data.tags !== undefined) {
    if (data.tags.length > VALIDATION.TAG_MAX_COUNT) {
      errors.push(`Maximum ${VALIDATION.TAG_MAX_COUNT} tags allowed`);
    }

    for (const tag of data.tags) {
      if (!isValidTag(tag)) {
        errors.push(`Tag "${tag}" is invalid (max ${VALIDATION.TAG_MAX_LENGTH} characters)`);
      }
    }
  }

  if (data.custom_fields !== undefined) {
    const fieldCount = Object.keys(data.custom_fields).length;
    if (fieldCount > VALIDATION.CUSTOM_FIELD_MAX_COUNT) {
      errors.push(`Maximum ${VALIDATION.CUSTOM_FIELD_MAX_COUNT} custom fields allowed`);
    }

    for (const [key, value] of Object.entries(data.custom_fields)) {
      if (key.length > VALIDATION.CUSTOM_FIELD_KEY_MAX_LENGTH) {
        errors.push(`Custom field key "${key}" is too long`);
      }
      if (value.length > VALIDATION.CUSTOM_FIELD_VALUE_MAX_LENGTH) {
        errors.push(`Custom field value for "${key}" is too long`);
      }
    }
  }

  if (data.expiration_config !== undefined) {
    validateExpirationConfig(data.expiration_config, errors);
  }

  if (errors.length > 0) {
    throw new ValidationError('Credential update validation failed', undefined, errors);
  }
}

/**
 * Validates expiration configuration
 */
function validateExpirationConfig(config: ExpirationConfig, errors: string[]): void {
  if (config.enabled && config.days !== null) {
    if (config.days < 1) {
      errors.push('Expiration days must be at least 1');
    }
    if (config.days > 3650) { // ~10 years
      errors.push('Expiration days must be less than 3650');
    }
  }

  if (config.notify_days_before && config.notify_days_before.length > 0) {
    for (const days of config.notify_days_before) {
      if (days < 1) {
        errors.push('Notification days must be at least 1');
      }
    }
  }
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Validates and sanitizes credential data
 */
export function sanitizeCredentialData(data: CreateCredentialDTO | UpdateCredentialDTO): typeof data {
  const sanitized = { ...data };

  if ('site' in sanitized && sanitized.site) {
    sanitized.site = sanitizeInput(sanitized.site);
  }

  if ('username' in sanitized && sanitized.username) {
    sanitized.username = sanitizeInput(sanitized.username);
  }

  if ('notes' in sanitized && sanitized.notes) {
    sanitized.notes = sanitizeInput(sanitized.notes);
  }

  if ('tags' in sanitized && sanitized.tags) {
    sanitized.tags = sanitized.tags.map(tag => sanitizeInput(tag));
  }

  return sanitized;
}


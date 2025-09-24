class InputValidator {
  constructor() {
    // XSS patterns to detect and remove
    this.xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
      /<meta\b[^<]*>/gi,
      /<link\b[^<]*>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onclick\s*=/gi,
      /onerror\s*=/gi,
      /onmouseover\s*=/gi,
      /onfocus\s*=/gi,
      /onblur\s*=/gi,
      /onchange\s*=/gi,
      /onsubmit\s*=/gi
    ];

    // SQL injection patterns
    this.sqlPatterns = [
      /('|(\\\')|(\-\-)|(\;)|(\|)|(\*)|(\%)|(\+)|(\\)|(\\\\)|(\n)|(\r)|(\t)|(\0)|(\x00)|(\x1a))/gi,
      /(union\s+select)/gi,
      /(select\s+.*\s+from)/gi,
      /(insert\s+into)/gi,
      /(delete\s+from)/gi,
      /(update\s+.*\s+set)/gi,
      /(drop\s+table)/gi,
      /(create\s+table)/gi,
      /(alter\s+table)/gi,
      /(exec\s*\()/gi,
      /(execute\s*\()/gi,
      /(\bor\b\s*1\s*=\s*1)/gi,
      /(\band\b\s*1\s*=\s*1)/gi
    ];
  }

  /**
   * Validate text input (only letters, spaces, basic punctuation)
   * @param {string} input - The input string to validate
   * @param {object} options - Validation options
   * @returns {object} - Validation result
   */
  validateTextInput(input, options = {}) {
    const {
      minLength = 1,
      maxLength = 100,
      allowNumbers = false,
      allowSpaces = true,
      allowBasicPunctuation = true
    } = options;

    const result = {
      isValid: false,
      sanitized: '',
      errors: []
    };

    // Check if input exists
    if (!input || typeof input !== 'string') {
      result.errors.push('Input is required and must be a string');
      return result;
    }

    // Sanitize input
    let sanitized = this.sanitizeInput(input);

    // Check length
    if (sanitized.length < minLength) {
      result.errors.push(`Input must be at least ${minLength} characters long`);
    }
    if (sanitized.length > maxLength) {
      result.errors.push(`Input must not exceed ${maxLength} characters`);
      sanitized = sanitized.substring(0, maxLength);
    }

    // Create regex pattern based on options
    let pattern = 'a-zA-Z';
    if (allowNumbers) pattern += '0-9';
    if (allowSpaces) pattern += '\\s';
    if (allowBasicPunctuation) pattern += '.,-/()[]{}:;!@#$%^&*\\+\'';

    const regex = new RegExp(`^[${pattern}]+$`);

    // Validate characters
    if (!regex.test(sanitized)) {
      result.errors.push('Input contains invalid characters');
    }

    // Check for XSS and SQL injection
    if (this.containsXSS(sanitized)) {
      result.errors.push('Input contains potentially malicious content');
    }

    if (this.containsSQLInjection(sanitized)) {
      result.errors.push('Input contains potentially malicious SQL content');
    }

    result.sanitized = sanitized;
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Validate textarea input (allows more characters but still sanitized)
   * @param {string} input - The input string to validate
   * @param {object} options - Validation options
   * @returns {object} - Validation result
   */
  validateTextareaInput(input, options = {}) {
    const {
      minLength = 1,
      maxLength = 5000,
      allowHTML = false,
      allowNewlines = true
    } = options;

    const result = {
      isValid: false,
      sanitized: '',
      errors: []
    };

    // Check if input exists
    if (!input || typeof input !== 'string') {
      result.errors.push('Input is required and must be a string');
      return result;
    }

    // Sanitize input
    let sanitized = allowHTML ? this.sanitizeHTML(input) : this.sanitizeInput(input);

    // Handle newlines
    if (!allowNewlines) {
      sanitized = sanitized.replace(/\n|\r\n|\r/g, ' ');
    }

    // Check length
    if (sanitized.length < minLength) {
      result.errors.push(`Input must be at least ${minLength} characters long`);
    }
    if (sanitized.length > maxLength) {
      result.errors.push(`Input must not exceed ${maxLength} characters`);
      sanitized = sanitized.substring(0, maxLength);
    }

    // Check for XSS and SQL injection
    if (this.containsXSS(sanitized)) {
      result.errors.push('Input contains potentially malicious content');
    }

    if (this.containsSQLInjection(sanitized)) {
      result.errors.push('Input contains potentially malicious SQL content');
    }

    result.sanitized = sanitized;
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Basic input sanitization
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';

    return input
      .trim()
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove control characters except newline and tab
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Escape HTML entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * HTML sanitization (more permissive but still safe)
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeHTML(input) {
    if (!input || typeof input !== 'string') return '';

    let sanitized = input.trim();

    // Remove dangerous tags and attributes
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Allow basic formatting tags but sanitize their content
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p'];
    const tagPattern = /<(\/?)([\w]+)([^>]*)>/gi;

    sanitized = sanitized.replace(tagPattern, (match, slash, tag, attrs) => {
      if (allowedTags.includes(tag.toLowerCase())) {
        // Remove all attributes from allowed tags for safety
        return `<${slash}${tag.toLowerCase()}>`;
      }
      return ''; // Remove disallowed tags
    });

    return sanitized;
  }

  /**
   * Check for XSS patterns
   * @param {string} input - Input to check
   * @returns {boolean} - True if XSS detected
   */
  containsXSS(input) {
    if (!input || typeof input !== 'string') return false;

    return this.xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check for SQL injection patterns
   * @param {string} input - Input to check
   * @returns {boolean} - True if SQL injection detected
   */
  containsSQLInjection(input) {
    if (!input || typeof input !== 'string') return false;

    return this.sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {object} - Validation result
   */
  validateEmail(email) {
    const result = {
      isValid: false,
      sanitized: '',
      errors: []
    };

    if (!email || typeof email !== 'string') {
      result.errors.push('Email is required');
      return result;
    }

    const sanitized = this.sanitizeInput(email.toLowerCase());
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(sanitized)) {
      result.errors.push('Invalid email format');
    }

    if (sanitized.length > 254) {
      result.errors.push('Email too long');
    }

    result.sanitized = sanitized;
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Batch validate multiple inputs
   * @param {object} inputs - Object with input values
   * @param {object} rules - Validation rules for each input
   * @returns {object} - Batch validation result
   */
  validateBatch(inputs, rules) {
    const results = {};
    let isAllValid = true;

    Object.keys(rules).forEach(key => {
      const input = inputs[key];
      const rule = rules[key];

      let result;
      switch (rule.type) {
        case 'text':
          result = this.validateTextInput(input, rule.options);
          break;
        case 'textarea':
          result = this.validateTextareaInput(input, rule.options);
          break;
        case 'email':
          result = this.validateEmail(input);
          break;
        default:
          result = { isValid: false, sanitized: '', errors: ['Unknown validation type'] };
      }

      results[key] = result;
      if (!result.isValid) {
        isAllValid = false;
      }
    });

    return {
      isValid: isAllValid,
      results
    };
  }
}

// Usage Examples
const validator = new InputValidator();

// Example 1: Text input validation
console.log('=== Text Input Validation ===');
const textResult = validator.validateTextInput('JohnDoe', {
  minLength: 2,
  maxLength: 50,
  allowSpaces: true
});
console.log('Text validation:', textResult);

// Example 2: Textarea validation
console.log('\n=== Textarea Validation ===');
const textareaResult = validator.validateTextareaInput(`This is a long text.
With multiple lines and various characters!`, {
  minLength: 10,
  maxLength: 1000,
  allowNewlines: true
});
console.log('Textarea validation:', textareaResult);

// Example 3: XSS attempt
console.log('\n=== XSS Attack Prevention ===');
const xssResult = validator.validateTextInput('<script>alert("xss")</script>Hello');
console.log('XSS validation:', xssResult);

// Example 4: SQL injection attempt
console.log('\n=== SQL Injection Prevention ===');
const sqlResult = validator.validateTextInput("'; DROP TABLE users; --");
console.log('SQL injection validation:', sqlResult);

// Example 5: Email validation
console.log('\n=== Email Validation ===');
const emailResult = validator.validateEmail('user@example.com');
console.log('Email validation:', emailResult);

// Example 6: Batch validation
console.log('\n=== Batch Validation ===');
const batchResult = validator.validateBatch(
  {
    name: 'John Doe',
    email: 'john@example.com',
    description: 'This is a description with\nmultiple lines.'
  },
  {
    name: { type: 'text', options: { maxLength: 100, allowSpaces: true } },
    email: { type: 'email' },
    description: { type: 'textarea', options: { maxLength: 500, allowNewlines: true } }
  }
);
console.log('Batch validation:', batchResult);

// Export for use in other modules
export default InputValidator;
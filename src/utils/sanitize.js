/**
 * Sanitizes a string by removing HTML tags and limiting length
 * @param {string} str - The string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (str, maxLength = 1000) => {
  if (typeof str !== 'string') {
    return '';
  }

  // Remove HTML tags
  const withoutHtml = str.replace(/<[^>]*>/g, '');

  // Remove potential script-like content
  const withoutScript = withoutHtml.replace(/javascript:/gi, '');

  // Trim and limit length
  const trimmed = withoutScript.trim();

  return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
};

/**
 * Validates and sanitizes a number
 * @param {any} value - The value to validate as a number
 * @returns {number|null} - Valid number or null
 */
export const sanitizeNumber = (value) => {
  const num = Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  return num;
};

/**
 * Validates and sanitizes the conversion rate API response
 * @param {any} data - The API response data
 * @returns {object|null} - Validated data or null if invalid
 */
export const validateConversionRateResponse = (data) => {
  if (!data || typeof data !== 'object') {
    console.error('Invalid response: data is not an object');
    return null;
  }

  // Validate required fields exist
  if (!('message' in data) || !('conversions' in data) || !('visitors' in data)) {
    console.error('Invalid response: missing required fields');
    return null;
  }

  // Sanitize and validate each field
  const sanitizedMessage = sanitizeString(data.message, 500);
  const sanitizedConversions = sanitizeNumber(data.conversions);
  const sanitizedVisitors = sanitizeNumber(data.visitors);

  // Ensure conversions and visitors are valid numbers
  if (sanitizedConversions === null || sanitizedVisitors === null) {
    console.error('Invalid response: conversions or visitors are not valid numbers');
    return null;
  }

  // Additional business logic validation
  if (sanitizedConversions < 0 || sanitizedVisitors < 0) {
    console.error('Invalid response: negative values not allowed');
    return null;
  }

  if (sanitizedConversions > sanitizedVisitors) {
    console.warn('Warning: conversions exceed visitors');
  }

  return {
    message: sanitizedMessage,
    conversions: sanitizedConversions,
    visitors: sanitizedVisitors,
  };
};

/**
 * Validates and sanitizes error messages
 * @param {any} error - The error object or message
 * @returns {string} - Sanitized error message
 */
export const sanitizeErrorMessage = (error) => {
  if (typeof error === 'string') {
    return sanitizeString(error, 200);
  }

  if (error && typeof error === 'object' && error.message) {
    return sanitizeString(error.message, 200);
  }

  return 'An unexpected error occurred';
};

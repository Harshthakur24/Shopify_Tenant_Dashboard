/**
 * Utility functions for Shopify domain handling
 */

/**
 * Cleans and normalizes a Shopify domain by removing protocol and trailing slashes
 * @param domain - The raw domain input (e.g., "https://xeno-harsh.myshopify.com" or "xeno-harsh.myshopify.com")
 * @returns Clean domain (e.g., "xeno-harsh.myshopify.com")
 */
export function cleanShopDomain(domain: string): string {
  if (!domain) return '';
  
  // Remove protocol (http:// or https://)
  let cleanDomain = domain.replace(/^https?:\/\//, '');
  
  // Remove trailing slash
  cleanDomain = cleanDomain.replace(/\/$/, '');
  
  // Convert to lowercase
  cleanDomain = cleanDomain.toLowerCase();
  
  // Validate it looks like a Shopify domain
  if (!cleanDomain.includes('.myshopify.com') && !cleanDomain.includes('.myshopify.io')) {
    throw new Error('Invalid Shopify domain format. Must end with .myshopify.com or .myshopify.io');
  }
  
  return cleanDomain;
}

/**
 * Validates if a domain is a valid Shopify domain format
 * @param domain - The domain to validate
 * @returns true if valid Shopify domain format
 */
export function isValidShopifyDomain(domain: string): boolean {
  if (!domain) return false;
  
  const cleanDomain = domain.toLowerCase();
  return cleanDomain.endsWith('.myshopify.com') || cleanDomain.endsWith('.myshopify.io');
}

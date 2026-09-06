/**
 * Extracts product ID, variant ID, and slug metadata from any valid GeM URL
 * @param {string} url
 * @returns {object|null}
 */
const parseGemUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('gem.gov.in') && !parsed.hostname.includes('localhost')) {
      return null;
    }

    let productId = null;
    let variantId = null;
    let categorySlug = null;
    let modelSlug = null;

    // Pattern 1: mkp.gem.gov.in/category/model/p-5116877-47986329150-cat.html#variant_id=...
    const pMatch = parsed.pathname.match(/\/p-([0-9]+-[0-9]+)/);
    if (pMatch && pMatch[1]) {
      productId = pMatch[1];
    }

    // Hash or query variant_id
    if (parsed.hash && parsed.hash.includes('variant_id=')) {
      variantId = parsed.hash.split('variant_id=')[1]?.split('&')[0];
    }
    if (parsed.searchParams.get('variant_id')) {
      variantId = parsed.searchParams.get('variant_id');
    }

    // Path segments: /high-end-laptop-notebook/travellite-tl14-42m/p-...
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      categorySlug = parts[0];
      modelSlug = parts[1];
    }

    // Pattern 2: ?product_id=XXXX
    if (!productId && parsed.searchParams.get('product_id')) {
      productId = parsed.searchParams.get('product_id');
    }

    // Pattern 3: /item/XXXX
    const itemMatch = parsed.pathname.match(/\/item\/([a-zA-Z0-9_-]+)/);
    if (!productId && itemMatch && itemMatch[1]) {
      productId = itemMatch[1];
    }

    return {
      isValid: true,
      productId: productId || variantId || 'GEM-' + Date.now(),
      variantId: variantId || productId,
      categorySlug,
      modelSlug,
    };
  } catch (e) {
    return null;
  }
};

/**
 * Validates if URL is a valid GeM URL
 * @param {string} url
 * @returns {boolean}
 */
const isValidGemUrl = (url) => {
  if (!url) return false;
  return url.includes('gem.gov.in') || url.includes('localhost') || process.env.NODE_ENV === 'development';
};

module.exports = {
  parseGemUrl,
  isValidGemUrl,
};

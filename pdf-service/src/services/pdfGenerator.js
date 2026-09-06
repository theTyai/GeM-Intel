const crypto = require('crypto');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const GENERATED_DIR = path.join(process.cwd(), 'generated');

// Ensure generated directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

/**
 * Compute SHA-256 hash of certificate content (deterministic serialization)
 */
function computeContentHash(content) {
  const canonical = JSON.stringify(content, Object.keys(content).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Simulate a ledger entry (hash-chain anchor).
 * In production this would write to a permissioned blockchain or hash-chained log.
 */
function anchorToLedger(contentHash) {
  const ledgerEntry = {
    hash: contentHash,
    timestamp: new Date().toISOString(),
    prev: null, // In production: last ledger entry hash
  };
  const ledgerHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(ledgerEntry))
    .digest('hex');
  return `LEDGER-${ledgerHash.substring(0, 16).toUpperCase()}`;
}

/**
 * Load and compile the Handlebars HTML template
 */
function loadTemplate() {
  const templatePath = path.join(__dirname, '..', 'templates', 'certificate.html');
  const source = fs.readFileSync(templatePath, 'utf8');
  return Handlebars.compile(source);
}

/**
 * Generate an audit certificate PDF.
 * @param {Object} data - Comparison data from the backend
 * @returns {{ pdfUrl, contentHash, ledgerTxId, pdfPath }}
 */
async function generateCertificate(data) {
  const {
    comparisonId,
    gemProduct,
    matches,
    fairMarketValue,
    variancePercent,
    status,
    pinCode,
    officerName,
    officerDepartment,
    verifyUrl,
  } = data;

  // 1. Compute content hash (before PDF is rendered)
  const contentForHash = {
    comparisonId,
    gemProductTitle: gemProduct.title,
    gemProductPrice: gemProduct.price,
    fairMarketValue,
    variancePercent,
    status,
    issuedAt: new Date().toISOString(),
    officerName,
    officerDepartment,
  };
  const contentHash = computeContentHash(contentForHash);
  const ledgerTxId = anchorToLedger(contentHash);

  // 2. Determine status label & color
  const statusConfig = {
    compliant: { label: 'COMPLIANT', color: '#16a34a', bgColor: '#dcfce7' },
    review_required: { label: 'REVIEW REQUIRED', color: '#d97706', bgColor: '#fef3c7' },
    non_compliant: { label: 'NON-COMPLIANT', color: '#dc2626', bgColor: '#fee2e2' },
  };
  const statusInfo = statusConfig[status] || statusConfig['review_required'];

  // 3. Prepare template data
  const issuedAt = new Date();
  const templateData = {
    certificateId: comparisonId,
    issuedAt: issuedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    issuedAtISO: issuedAt.toISOString(),
    officerName: officerName || 'Government Officer',
    officerDepartment: officerDepartment || 'Government of India',
    gemProductTitle: gemProduct.title,
    gemProductBrand: gemProduct.brand || 'N/A',
    gemProductCategory: gemProduct.category || 'N/A',
    gemProductPrice: gemProduct.price?.toLocaleString('en-IN') || 'N/A',
    gemLandedCost: gemProduct.landedCost?.toLocaleString('en-IN') || gemProduct.price?.toLocaleString('en-IN'),
    gemUrl: gemProduct.gemUrl || 'N/A',
    pinCode,
    fairMarketValue: fairMarketValue?.toLocaleString('en-IN') || 'N/A',
    variancePercent: variancePercent?.toFixed(2) || '0.00',
    statusLabel: statusInfo.label,
    statusColor: statusInfo.color,
    statusBgColor: statusInfo.bgColor,
    contentHash,
    ledgerTxId,
    verifyUrl: verifyUrl || `http://localhost:5000/api/v1/certificates/${comparisonId}/verify`,
    matches: (matches || []).map((m) => ({
      platform: m.platform?.toUpperCase(),
      title: m.matchedTitle || m.title,
      url: m.matchedListingUrl || m.url,
      similarityScore: ((m.similarityScore || 0) * 100).toFixed(1),
      basePrice: m.basePrice?.toLocaleString('en-IN') || 'N/A',
      gst: m.gst?.toLocaleString('en-IN') || '0',
      freight: m.freight?.toLocaleString('en-IN') || '0',
      amc: m.amc?.toLocaleString('en-IN') || '0',
      landedCost: m.landedCost?.toLocaleString('en-IN') || 'N/A',
    })),
  };

  // 4. Render HTML
  const template = loadTemplate();
  const html = template(templateData);

  // 5. Generate PDF with Puppeteer
  const pdfFilename = `certificate_${comparisonId}_${Date.now()}.pdf`;
  const pdfPath = path.join(GENERATED_DIR, pdfFilename);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });
  } finally {
    if (browser) await browser.close();
  }

  const pdfUrl = `/pdfs/${pdfFilename}`;

  return { pdfUrl, pdfPath, contentHash, ledgerTxId };
}

module.exports = { generateCertificate, computeContentHash };

// GeM-Intel Chrome Extension — Content Script
// Runs on mkp.gem.gov.in product pages
// Scrapes product data from the DOM and sends to backend for comparison

(function () {
  'use strict';

  const API_BASE = 'https://gem-intel.onrender.com/api/v1';
  // const API_BASE = 'http://localhost:5000/api/v1'; // uncomment for local dev

  // ─── Helpers ───────────────────────────────────────────────
  function isProductPage() {
    const url = window.location.href;
    return url.includes('/p-') && url.includes('-cat.html');
  }

  // ─── DOM Scraper ───────────────────────────────────────────
  function scrapeProductFromDOM() {
    const product = {
      title: '',
      brand: 'Unbranded',
      model: '',
      category: 'general',
      price: 0,
      specifications: {},
      gemUrl: window.location.href,
      seller: 'GeM Marketplace',
    };

    // Title: h1 or og:title
    const h1 = document.querySelector('h1');
    if (h1) {
      product.title = h1.textContent.replace(/\s+/g, ' ').trim();
    }
    if (!product.title) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) product.title = ogTitle.content.trim();
    }
    if (!product.title) {
      const titleTag = document.querySelector('title');
      if (titleTag) product.title = titleTag.textContent.split('|')[0].trim();
    }

    // Price: look for ₹ patterns in common price containers
    const priceSelectors = [
      '[class*="offer" i][class*="price" i]',
      '[class*="pdp" i][class*="price" i]',
      '[class*="final" i][class*="price" i]',
      '[class*="price" i]',
    ];
    for (const sel of priceSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const m = el.textContent.match(/₹?\s*([\d,]+(?:\.\d{1,2})?)/);
        if (m) {
          const val = parseFloat(m[1].replace(/,/g, ''));
          if (val > 10) { product.price = val; break; }
        }
      }
    }
    // Fallback: search page for ₹ pattern
    if (product.price === 0) {
      const bodyText = document.body.innerText;
      const allPrices = [...bodyText.matchAll(/₹\s*([\d,]+(?:\.\d{1,2})?)/g)]
        .map(m => parseFloat(m[1].replace(/,/g, '')))
        .filter(v => v > 10);
      if (allPrices.length) product.price = Math.min(...allPrices);
    }

    // Specifications: extract from tables
    document.querySelectorAll('table').forEach(table => {
      table.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
          const key = cells[0].textContent.trim().replace(/:$/, '');
          const val = cells[1].textContent.trim();
          if (key && val && key.length < 80 && val.length < 200) {
            const clean = key.replace(/\s+/g, ' ').trim();
            if (clean && !['specification', 'details'].includes(clean.toLowerCase())) {
              product.specifications[clean] = val;
            }
          }
        }
      });
    });

    // Also look for dl/dt/dd pairs
    document.querySelectorAll('dl').forEach(dl => {
      const dts = dl.querySelectorAll('dt');
      const dds = dl.querySelectorAll('dd');
      dts.forEach((dt, i) => {
        if (dds[i]) {
          const key = dt.textContent.trim().replace(/:$/, '');
          const val = dds[i].textContent.trim();
          if (key && val) product.specifications[key] = val;
        }
      });
    });

    // Brand: from specs or title
    const brandKeys = ['brand', 'manufacturer', 'make', 'brand name'];
    for (const [k, v] of Object.entries(product.specifications)) {
      if (brandKeys.includes(k.toLowerCase())) {
        product.brand = v;
        break;
      }
    }

    // Category: from breadcrumbs or URL slug
    const breadcrumb = document.querySelector('[class*="breadcrumb" i]');
    if (breadcrumb) {
      const crumbs = breadcrumb.textContent.split(/[>›»]/);
      if (crumbs.length > 1) product.category = crumbs[crumbs.length - 1].trim();
    }
    if (product.category === 'general') {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) product.category = pathParts[0].replace(/-/g, ' ');
    }

    // Model: from title parentheses
    const modelMatch = product.title.match(/\(([^)]+)\)/);
    if (modelMatch) product.model = modelMatch[1].trim();

    // Product ID from URL
    const pMatch = window.location.pathname.match(/\/p-([0-9]+-[0-9]+)/);
    if (pMatch) product.id = pMatch[1];

    // Variant ID from hash
    if (window.location.hash.includes('variant_id=')) {
      product.variantId = window.location.hash.split('variant_id=')[1].split('&')[0];
    }

    return product;
  }

  // ─── API Calls ─────────────────────────────────────────────
  async function runComparison(product, pinCode) {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gemProduct: product, pinCode }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${res.status}`);
    }
    return res.json();
  }

  // ─── Sidebar UI ────────────────────────────────────────────
  function createSidebar() {
    if (document.getElementById('gem-intel-sidebar')) return;

    const sidebar = document.createElement('div');
    sidebar.id = 'gem-intel-sidebar';
    sidebar.innerHTML = `
      <div class="gi-sidebar-header">
        <div class="gi-logo">🏛️ GeM-Intel</div>
        <div class="gi-badge">GFR 149</div>
        <button class="gi-close-btn" id="gi-close-btn" title="Close">✕</button>
      </div>

      <div class="gi-sidebar-body" id="gi-sidebar-body">
        <div class="gi-section gi-product-info" id="gi-product-info">
          <div class="gi-section-title">📦 Detected Product</div>
          <div class="gi-product-title" id="gi-product-title">Scanning page...</div>
          <div class="gi-product-price" id="gi-product-price"></div>
          <div class="gi-product-specs" id="gi-product-specs"></div>
        </div>

        <div class="gi-section gi-pin-section">
          <label class="gi-label">📍 Delivery PIN Code</label>
          <div class="gi-pin-row">
            <input type="text" id="gi-pin-input" class="gi-input" value="110001" maxlength="6" />
            <button class="gi-audit-btn" id="gi-audit-btn">⚡ Audit Price</button>
          </div>
        </div>

        <div class="gi-section gi-loading" id="gi-loading" style="display:none;">
          <div class="gi-spinner"></div>
          <div class="gi-loading-text">Scanning Amazon, Flipkart & IndiaMART...</div>
        </div>

        <div class="gi-section gi-results" id="gi-results" style="display:none;">
          <div class="gi-status-badge" id="gi-status-badge">—</div>

          <div class="gi-metrics">
            <div class="gi-metric">
              <span class="gi-metric-label">GeM Landed Cost</span>
              <span class="gi-metric-value" id="gi-gem-price">—</span>
            </div>
            <div class="gi-metric">
              <span class="gi-metric-label">Benchmark Market Value</span>
              <span class="gi-metric-value" id="gi-bmv">—</span>
            </div>
            <div class="gi-metric">
              <span class="gi-metric-label">Variance</span>
              <span class="gi-metric-value" id="gi-variance">—</span>
            </div>
          </div>

          <div class="gi-matches-header">🔎 Market Evidence</div>
          <div class="gi-matches-list" id="gi-matches-list"></div>

          <div class="gi-risk-section" id="gi-risk-section" style="display:none;">
            <div class="gi-risk-header">⚠️ Risk Assessment</div>
            <div class="gi-risk-body" id="gi-risk-body"></div>
          </div>

          <button class="gi-report-btn" id="gi-report-btn">📋 Saved to Dashboard</button>
        </div>

        <div class="gi-section gi-error" id="gi-error" style="display:none;">
          <div class="gi-error-text" id="gi-error-text"></div>
          <button class="gi-retry-btn" id="gi-retry-btn">🔄 Retry</button>
        </div>
      </div>
    `;

    document.body.appendChild(sidebar);
    return sidebar;
  }

  function createFloatingButton() {
    if (document.getElementById('gem-intel-fab')) return;

    const fab = document.createElement('div');
    fab.id = 'gem-intel-fab';
    fab.innerHTML = `
      <div class="gi-fab-btn" title="GeM-Intel Price Audit">
        <span class="gi-fab-icon">🏛️</span>
        <span class="gi-fab-text">Audit Price</span>
      </div>
    `;
    document.body.appendChild(fab);

    fab.addEventListener('click', () => {
      const sidebar = document.getElementById('gem-intel-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('gi-sidebar-open');
      } else {
        const s = createSidebar();
        requestAnimationFrame(() => s.classList.add('gi-sidebar-open'));
        initSidebar();
      }
      fab.style.display = 'none';
    });
  }

  // ─── Sidebar Logic ─────────────────────────────────────────
  function initSidebar() {
    const product = scrapeProductFromDOM();

    // Display scraped product info
    const titleEl = document.getElementById('gi-product-title');
    const priceEl = document.getElementById('gi-product-price');
    const specsEl = document.getElementById('gi-product-specs');

    titleEl.textContent = product.title || 'Could not detect product title';
    if (product.price > 0) {
      priceEl.textContent = `₹${product.price.toLocaleString('en-IN')}`;
    } else {
      priceEl.textContent = 'Price not detected on page';
      priceEl.classList.add('gi-muted');
    }

    const specCount = Object.keys(product.specifications).length;
    specsEl.textContent = specCount > 0
      ? `${specCount} specifications detected • ${product.brand} • ${product.category}`
      : `${product.brand} • ${product.category}`;

    // Close button
    document.getElementById('gi-close-btn').addEventListener('click', () => {
      document.getElementById('gem-intel-sidebar').classList.remove('gi-sidebar-open');
      const fab = document.getElementById('gem-intel-fab');
      if (fab) fab.style.display = '';
    });

    // Audit button
    const auditBtn = document.getElementById('gi-audit-btn');
    auditBtn.addEventListener('click', () => handleAudit(product));

    // Retry button
    document.getElementById('gi-retry-btn')?.addEventListener('click', () => handleAudit(product));
  }

  async function handleAudit(product) {
    const pinCode = document.getElementById('gi-pin-input').value.trim() || '110001';
    const loading = document.getElementById('gi-loading');
    const results = document.getElementById('gi-results');
    const errorEl = document.getElementById('gi-error');
    const auditBtn = document.getElementById('gi-audit-btn');

    loading.style.display = '';
    results.style.display = 'none';
    errorEl.style.display = 'none';
    auditBtn.disabled = true;
    auditBtn.textContent = '⏳ Analyzing...';

    try {
      const data = await runComparison(product, pinCode);
      displayResults(data, product);
    } catch (err) {
      errorEl.style.display = '';
      document.getElementById('gi-error-text').textContent = err.message || 'Failed to analyze.';
    } finally {
      loading.style.display = 'none';
      auditBtn.disabled = false;
      auditBtn.textContent = '⚡ Audit Price';
    }
  }

  function displayResults(data, product) {
    const results = document.getElementById('gi-results');
    results.style.display = '';

    // Status badge
    const badge = document.getElementById('gi-status-badge');
    const status = data.status;
    if (status === 'benchmark_aligned' || status === 'compliant') {
      badge.className = 'gi-status-badge gi-status-compliant';
      badge.textContent = '✅ BENCHMARK ALIGNED';
    } else if (status === 'review_recommended' || status === 'review_required') {
      badge.className = 'gi-status-badge gi-status-review';
      badge.textContent = '⚠️ REVIEW RECOMMENDED';
    } else {
      badge.className = 'gi-status-badge gi-status-risk';
      badge.textContent = '🚨 HIGH-RISK VARIANCE';
    }

    // Metrics
    const gemPrice = product.price || data.benchmarkMarketValue * (1 + (data.variancePercent || 0) / 100);
    document.getElementById('gi-gem-price').textContent = `₹${Math.round(gemPrice).toLocaleString('en-IN')}`;
    document.getElementById('gi-bmv').textContent = `₹${Math.round(data.benchmarkMarketValue || data.fairMarketValue || 0).toLocaleString('en-IN')}`;

    const variance = data.variancePercent || 0;
    const varianceEl = document.getElementById('gi-variance');
    varianceEl.textContent = `${variance >= 0 ? '+' : ''}${variance.toFixed(1)}%`;
    varianceEl.className = `gi-metric-value ${variance > 20 ? 'gi-text-red' : variance > 5 ? 'gi-text-yellow' : 'gi-text-green'}`;

    // Matches
    const matchesList = document.getElementById('gi-matches-list');
    matchesList.innerHTML = '';
    if (data.matches && data.matches.length > 0) {
      data.matches.forEach(m => {
        const card = document.createElement('div');
        card.className = 'gi-match-card';
        const platformIcon = { amazon: '🛒', flipkart: '🛍️', indiamart: '🏭' }[m.platform] || '🏪';
        card.innerHTML = `
          <div class="gi-match-header">
            <span class="gi-match-platform">${platformIcon} ${m.platform}</span>
            <span class="gi-match-price">₹${Math.round(m.landedCost || m.basePrice).toLocaleString('en-IN')}</span>
          </div>
          <div class="gi-match-title">${m.matchedTitle}</div>
          <div class="gi-match-meta">
            <span>Confidence: ${m.explainability?.overallConfidence || '—'}%</span>
            <span>Seller: ${m.provenance?.seller || '—'}</span>
          </div>
        `;
        matchesList.appendChild(card);
      });
    } else {
      matchesList.innerHTML = '<div class="gi-no-matches">No marketplace matches found</div>';
    }

    // Risk Assessment
    if (data.riskAssessment) {
      const riskSection = document.getElementById('gi-risk-section');
      riskSection.style.display = '';
      const riskBody = document.getElementById('gi-risk-body');
      riskBody.innerHTML = `
        <div class="gi-risk-item"><strong>Classification:</strong> ${data.riskAssessment.classification}</div>
        <div class="gi-risk-item"><strong>Evidence Confidence:</strong> ${data.riskAssessment.evidenceConfidence}</div>
        <div class="gi-risk-item"><strong>Independent Sources:</strong> ${data.riskAssessment.independentSourcesCount}</div>
        ${(data.anomalyFlags || []).map(f => `<div class="gi-risk-flag">🚩 ${f}</div>`).join('')}
      `;
    }

    // Report button
    const reportBtn = document.getElementById('gi-report-btn');
    if (data._id) {
      reportBtn.textContent = '📋 Saved to Dashboard';
      reportBtn.onclick = () => {
        window.open(`${API_BASE.replace('/api/v1', '')}`, '_blank');
      };
    }
  }

  // ─── Init ──────────────────────────────────────────────────
  function init() {
    if (!isProductPage()) {
      console.log('[GeM-Intel] Not a product page, skipping.');
      return;
    }
    console.log('[GeM-Intel] Product page detected, injecting floating button.');
    createFloatingButton();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

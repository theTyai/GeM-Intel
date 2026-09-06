// Popup logic for GeM-Intel Extension

document.addEventListener('DOMContentLoaded', async () => {
  const gemUrlInput = document.getElementById('gemUrlInput');
  const pinInput = document.getElementById('pinInput');
  const auditBtn = document.getElementById('auditBtn');
  const dashBtn = document.getElementById('dashBtn');
  const spinner = document.getElementById('loadingSpinner');
  const resultBox = document.getElementById('resultBox');
  const statusBadge = document.getElementById('statusBadge');
  const gemPriceText = document.getElementById('gemPriceText');
  const fmvText = document.getElementById('fmvText');
  const varText = document.getElementById('varText');

  // Auto-detect current active tab URL
  if (chrome.tabs) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      gemUrlInput.value = tab.url;
    }
  } else {
    gemUrlInput.value = 'https://gem.gov.in/product/view?product_id=GEM-101';
  }

  dashBtn.addEventListener('click', () => {
    const currentUrl = encodeURIComponent(gemUrlInput.value || '');
    const pin = encodeURIComponent(pinInput.value || '110001');
    chrome.tabs.create({ url: `http://localhost:5173/?url=${currentUrl}&pin=${pin}` });
  });

  auditBtn.addEventListener('click', async () => {
    const gemUrl = gemUrlInput.value.trim();
    const pinCode = pinInput.value.trim() || '110001';

    if (!gemUrl) {
      alert('Please provide a GeM Product URL');
      return;
    }

    spinner.style.display = 'block';
    resultBox.style.display = 'none';

    try {
      // First get a token with default officer demo credentials
      const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'officer@gem.gov.in', password: 'password123' })
      });
      const loginData = await loginRes.json();
      const token = loginData.token;

      // Run comparison
      const compRes = await fetch('http://localhost:5000/api/v1/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gemUrl, pinCode })
      });
      const compData = await compRes.json();

      spinner.style.display = 'none';
      resultBox.style.display = 'block';

      // Update UI
      const gemPrice = compData.gemProductId?.priceHistory?.[0]?.price || compData.fairMarketValue * (1 + compData.variancePercent/100);
      gemPriceText.textContent = `₹${Math.round(gemPrice).toLocaleString('en-IN')}`;
      fmvText.textContent = `₹${Math.round(compData.fairMarketValue).toLocaleString('en-IN')}`;
      varText.textContent = `${compData.variancePercent >= 0 ? '+' : ''}${compData.variancePercent.toFixed(1)}%`;

      if (compData.status === 'compliant') {
        statusBadge.className = 'status-tag tag-compliant';
        statusBadge.textContent = 'COMPLIANT (≤5%)';
      } else if (compData.status === 'review_required') {
        statusBadge.className = 'status-tag tag-review';
        statusBadge.textContent = 'REVIEW REQUIRED (5-20%)';
      } else {
        statusBadge.className = 'status-tag tag-non-compliant';
        statusBadge.textContent = 'NON-COMPLIANT (>20%)';
      }
    } catch (err) {
      spinner.style.display = 'none';
      alert('Failed to connect to GeM-Intel Backend at http://localhost:5000');
    }
  });
});

// GeM-Intel Chrome Extension — Content Script for gem.gov.in

(function () {
  console.log('[GeM-Intel] Content script loaded on:', window.location.href);

  // Check if we are on a product page
  function isProductPage() {
    const url = window.location.href;
    return url.includes('/product/') || url.includes('/show/') || url.includes('gem.gov.in') || url.includes('localhost');
  }

  function injectCompareButton() {
    if (document.getElementById('gem-intel-quick-btn')) return;

    const floatingContainer = document.createElement('div');
    floatingContainer.id = 'gem-intel-quick-btn';
    floatingContainer.innerHTML = `
      <div class="gem-intel-badge-wrapper">
        <div class="gem-intel-float-btn" title="Run AI Price Audit & GFR 149 Compliance">
          <span class="gem-intel-logo">🏛️ GeM-Intel</span>
          <span class="gem-intel-action-text">Audit Market Price</span>
        </div>
      </div>
    `;

    document.body.appendChild(floatingContainer);

    floatingContainer.addEventListener('click', () => {
      const currentUrl = encodeURIComponent(window.location.href);
      const dashboardUrl = `http://localhost:5173/?url=${currentUrl}&pin=110001`;
      window.open(dashboardUrl, '_blank');
    });
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCompareButton);
  } else {
    injectCompareButton();
  }
})();

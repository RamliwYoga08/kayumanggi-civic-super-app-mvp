(() => {
  if (!('serviceWorker' in navigator)) return;
  const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!secure) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Kayumanggi service worker registration failed:', error);
    });
  });
})();

(function () {
  // Endpoints of the backend services used by the SPA.
  // Defaults match a local run (WebApp on https://localhost:5001, OEM on http://localhost:6001);
  // change them here when deploying the services to other hosts or ports.
  const host = window.location.hostname;

  window.APP_CONFIG = Object.assign({
    webAppApiUrl: `https://${host}:5001/api`,
    oemApiUrl: `http://${host}:6001/api`
  }, window.APP_CONFIG || {});
})();

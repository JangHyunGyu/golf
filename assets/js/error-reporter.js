(function () {
  if (window.__golfErrorReporterInstalled) return;
  window.__golfErrorReporterInstalled = true;

  var ERROR_ENDPOINT = "https://chatbot-api.yama5993.workers.dev/error-logs";
  var lang = (document.documentElement.lang || "ko").substring(0, 2);
  var APP_ID = lang === "ko" ? "golf" : "golf-" + lang;
  var lastError = "";
  var errorCount = 0;

  function isIgnoredResourceError(source) {
    var src = String(source || "");
    return /googletagmanager\.com|google-analytics\.com|gtag\/js|wcs\.pstatic\.net\/wcslog\.js/i.test(src);
  }

  function shouldProbeLocalResource(source) {
    try {
      if (!source) return false;
      var url = new URL(source, location.href);
      if (url.origin !== location.origin) return false;
      return /\.(?:css|js|mjs|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf)(?:$|\?)/i.test(url.pathname + url.search);
    } catch (_) {
      return false;
    }
  }

  function send(message, stack, source, type) {
    if (!message) return;
    var key = message + "|" + (source || "");
    if (key === lastError) {
      errorCount++;
      if (errorCount > 3) return;
    } else {
      lastError = key;
      errorCount = 1;
    }

    var body = JSON.stringify({
      appId: APP_ID,
      userId: "",
      message: String(message || "").slice(0, 500),
      stack: String(stack || "").slice(0, 3000),
      url: String(location.href || "").slice(0, 500),
      source: String(source || "").slice(0, 500),
      errorType: type || "error",
      context: {
        path: location.pathname,
        online: navigator.onLine,
        viewport: { width: innerWidth, height: innerHeight },
      },
    });

    try {
      if (navigator.sendBeacon && navigator.sendBeacon(ERROR_ENDPOINT, body)) return;
      fetch(ERROR_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (_) {}
  }

  window.addEventListener("error", function (event) {
    var target = event && event.target;
    if (target && target !== window && target !== document) {
      var resourceSource = target.currentSrc || target.src || target.href || "";
      if (isIgnoredResourceError(resourceSource)) return;
      var message = "Resource load failed: " + (target.tagName || target.nodeName || "unknown");
      if (shouldProbeLocalResource(resourceSource) && typeof fetch === "function") {
        fetch(resourceSource, { method: "HEAD", cache: "no-store" })
          .then(function (response) {
            if (response && response.ok) return;
            send(message, "", resourceSource, "resource_error");
          })
          .catch(function () {
            send(message, "", resourceSource, "resource_error");
          });
        return;
      }
      send(message, "", resourceSource, "resource_error");
      return;
    }
    send(event.message, event.error && event.error.stack, (event.filename || "") + ":" + (event.lineno || 0) + ":" + (event.colno || 0), "error");
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    send(reason && reason.message ? reason.message : String(reason || "Unhandled rejection"), reason && reason.stack, location.href, "unhandledrejection");
  }, true);
})();

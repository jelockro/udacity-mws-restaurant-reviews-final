if ("serviceWorker" in naviator) {
  navigator.serviceWorker.register("/sw.js")
  .then(reg => {
    console.log("Service Worker Registration Successful: " + reg.scope);
  })
  .catch(e => {
    console.log("Registration Failed: " + e);
  });
}

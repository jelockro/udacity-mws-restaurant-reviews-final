if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
  .then(reg => {
    console.log("Service Worker Registration Successful! Scope is: " + reg.scope);
  })
  .catch(e => {
    console.log("Registration Failed: " + e);
  });
}

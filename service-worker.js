self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Secret place!", {
      body: data.body || "You have entered a secret area!",
      icon: "/icon.png",
    })
  );
});

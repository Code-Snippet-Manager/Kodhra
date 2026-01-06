self.addEventListener("push", (e) => {
  const data = e.data.json();
  const options = {
    body: data.body,
    icon: "https://kodhra.codewithajoydas.live/icons/icon-192-maskable.png",
    badge: "https://kodhra.codewithajoydas.live/icons/icon-192-maskable.png",
    data: data.data
  };
  self.registration.showNotification(data.title, options);
  
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link = event.notification.data?.link || "/";

  event.waitUntil(clients.openWindow(link));
});

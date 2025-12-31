let socket = io();
socket.emit("register", window.USER_ID);
socket.on("notification", (data) => {
  createNotification([data]);
  updateUnreadCount(data.unreadCount);
});

async function getNotifications() {
  const res = await fetch("/notifications");
  const data = await res.json();
  createNotification(data);
}
getNotifications();

async function getUnreadCount() {
  const res = await fetch("/notifications/unread-count");
  const data = await res.json();
  updateUnreadCount(data.count);
}
getUnreadCount();

function updateUnreadCount(count) {
  const numberEl = document.querySelector(".number");
  numberEl.textContent = count > 0 ? count : "";
  numberEl.style.display = count > 0 ? "flex" : "none";
}

function createNotification(data) {
  const notificationDiv = document.querySelector(".notification-lists");
  data.forEach((e) => {
    const li = document.createElement("li");
    li.className = "notification-list";
    li.innerHTML = `
      <div class="n-title">
       <span> ${e.title}</span>
        <span style="font-size: 10px">${new Date(
          e.createdAt
        ).toLocaleString()}</span>
      </div>
      <p class="n-description">${e.message}</p>
      <a href="${
        e.link || "#"
      }" class="action-button">Take action <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="   -chevron-right-icon  -chevron-right"><path d="m9 18 6-6-6-6"/></svg></a>
    `;
    notificationDiv.prepend(li);
  });
}

let notification = document.querySelector(".notification");
notification.addEventListener("click", async () => {
  let res = await fetch("/notifications/mark-read", {
    method: "POST",
  });
  let data = await res.json();
  updateUnreadCount(0);
});


let notificationBar = document.querySelector(".notification-bar");
notificationBar.addEventListener("click", (e) => {
  e.stopPropagation();
});
let notificationlist = document.querySelectorAll(".notification-list");
let n_openerBtn = document.querySelector(".notification");
n_openerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  notificationBar.classList.toggle("active");
  document.querySelector("body").classList.toggle("active");
  notificationlist.forEach((e) => {
    e.classList.toggle("active");
  });
  // readmsg();
});
document.addEventListener("click", () => {
  notificationBar.classList.remove("active");
  document.querySelector("body").classList.remove("active");

  notificationlist.forEach((e) => {
    e.classList.remove("active");
  });
});

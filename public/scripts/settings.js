const displayName = document.getElementById("displayName");
const userName = document.getElementById("username");
const bio = document.getElementById("bio");
const profileVisibility = document.getElementById("profileVisibility");

let debounceTimer;

[displayName, userName, bio, profileVisibility].forEach((input) => {
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch("/profile/update", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            goodName: displayName.value.trim(),
            userName: userName.value.trim(),
            bio: bio.value.trim(),
            isPrivate: profileVisibility.value,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          new Toastmaster({
            title: "Error",
            message: data.message,
            type: "error",
            delay: 5000,
          }).showNotification();
        } else {
          new Toastmaster({
            title: "Success",
            message: data.message,
            type: "success",
            delay: 3000,
          }).showNotification();
        }
      } catch (err) {
        new Toastmaster({
          title: "Error",
          message: "Network error",
          type: "error",
          delay: 5000,
        }).showNotification();
      }
    }, 800);
  });
});

const uiMode = document.getElementById("uiMode");
const defaultLanguage = document.getElementById("defaultLanguage");
const showSidebar = document.getElementById("showSidebar");
const autoSaveInterval = document.getElementById("autoSaveInterval");
const themev2 = document.getElementById("themev2");
const accentColorv2 = document.getElementById("accentColorv2");
const fontSize = document.getElementById("fontSize");
const uiDensity = document.getElementById("uiDensity");
const sidebarLayout = document.getElementById("sidebarLayout");
const tabSize = document.getElementById("tabSize");
const wordWrap = document.getElementById("wordWrap");
const lineNumbers = document.getElementById("lineNumbers");
const syntaxStyle = document.getElementById("syntaxStyle");
const cloudSync = document.getElementById("cloudSync");
const syncFrequency = document.getElementById("syncFrequency");
const dataEncryption = document.getElementById("dataEncryption");
const desktopNotifications = document.getElementById("desktopNotifications");
const snippetAlerts = document.getElementById("snippetAlerts");
const appLockPin = document.getElementById("appLockPin");
const sessionTimeout = document.getElementById("sessionTimeout");
const exportFormat = document.getElementById("exportFormat");
const autoExportSchedule = document.getElementById("autoExportSchedule");

let settings = {};
async function getsettings() {
  const res = await fetch("/settings/list", {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  for (const key in data) {
    if (document.getElementById(key)) {
      document.getElementById(key).value = data[key];
    } else {
      console.log("no such key", key);
    }
  }
}
getsettings();

uiMode.addEventListener("change", () => {
  settings.uiMode = uiMode.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

defaultLanguage.addEventListener("change", () => {
  settings.defaultLanguage = defaultLanguage.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

showSidebar.addEventListener("change", () => {
  settings.showSidebar = showSidebar.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

autoSaveInterval.addEventListener("change", () => {
  settings.autoSaveInterval = autoSaveInterval.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

themev2.addEventListener("change", () => {
  settings.themev2 = themev2.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

accentColorv2.addEventListener("change", () => {
  settings.accentColorv2 = accentColorv2.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

fontSize.addEventListener("change", () => {
  settings.fontSize = fontSize.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

// uiDensity.addEventListener("change", () => {
//   settings.uiDensity = uiDensity.value;
//   localStorage.setItem("settings", JSON.stringify(settings));
// });

// sidebarLayout.addEventListener("change", () => {
//   settings.sidebarLayout = sidebarLayout.value;
//   localStorage.setItem("settings", JSON.stringify(settings));
// });

tabSize.addEventListener("change", () => {
  settings.tabSize = tabSize.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

wordWrap.addEventListener("change", () => {
  settings.wordWrap = wordWrap.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

lineNumbers.addEventListener("change", () => {
  settings.lineNumbers = lineNumbers.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

syntaxStyle.addEventListener("change", () => {
  settings.syntaxStyle = syntaxStyle.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

cloudSync.addEventListener("change", () => {
  settings.cloudSync = cloudSync.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

syncFrequency.addEventListener("change", () => {
  settings.syncFrequency = syncFrequency.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

dataEncryption.addEventListener("change", () => {
  settings.dataEncryption = dataEncryption.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

desktopNotifications.addEventListener("change", () => {
  settings.desktopNotifications = desktopNotifications.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

snippetAlerts.addEventListener("change", () => {
  settings.snippetAlerts = snippetAlerts.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

appLockPin.addEventListener("change", () => {
  settings.appLockPin = appLockPin.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

sessionTimeout.addEventListener("change", () => {
  settings.sessionTimeout = sessionTimeout.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

exportFormat.addEventListener("change", () => {
  settings.exportFormat = exportFormat.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

autoExportSchedule.addEventListener("change", () => {
  settings.autoExportSchedule = autoExportSchedule.value;
  localStorage.setItem("settings", JSON.stringify(settings));
});

[
  uiMode,
  defaultLanguage,
  showSidebar,
  autoSaveInterval,
  themev2,
  accentColorv2,
  fontSize,
  tabSize,
  wordWrap,
  lineNumbers,
  syntaxStyle,
  cloudSync,
  syncFrequency,
  dataEncryption,
  desktopNotifications,
  snippetAlerts,
  appLockPin,
  sessionTimeout,
  exportFormat,
  autoExportSchedule,
].map((element) => {
  element.addEventListener("change", async () => {
    settings[element.id] = element.value;
    localStorage.setItem("settings", JSON.stringify(settings));
    // For sidebar
    if (element.id == "showSidebar") {
      if (element.value == "yes") {
        document.querySelector("aside").classList.remove("active");
      } else {
        document.querySelector("aside").classList.add("active");
      }
    }
    // For accent color
    if (element.id == "accentColorv2") {
      document.body.style.setProperty("--accent2", element.value);
    }
    // THEME HANDLER
    if (element.id === "themev2") {
      if (element.value === "dark") {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else if (element.value === "light") {
        document.body.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      } else {
        document.body.setAttribute("data-theme", "auto");
        localStorage.setItem("theme", "auto");
      }
    }

    if (element.id === "fontSize") {
      if (element.value > 30) {
        new Toastmaster({
          title: "Warning",
          message: "We don't support font sizes above 30px",
          type: "warning",
          delay: 5000,
        }).showNotification();
        return;
      }
      if (element.value < 10) {
        new Toastmaster({
          title: "Warning",
          message: "We don't support font sizes below 10px",
          type: "warning",
          delay: 5000,
        }).showNotification();
        return;
      }
      document.body.style.fontSize = element.value + "px";
    }

    const res = await fetch("/settings/list", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      new Toastmaster({
        title: "Saved",
        message: "Settings saved successfully",
        type: "success",
        delay: 5000,
      }).showNotification();
    } else {
      new Toastmaster({
        title: "Error",
        message: "Failed to save settings",
        type: "error",
        delay: 5000,
      }).showNotification();
    }
  });
});

document.querySelector(".reset").addEventListener("click", () => {
  accentColorv2.value = "#242424";
  accentColorv2.dispatchEvent(new Event("change"));
});
document.querySelector(".fontreset").addEventListener("click", () => {
  fontSize.value = 16;
  fontSize.dispatchEvent(new Event("change"));
});

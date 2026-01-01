const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    uiMode: { type: String, default: "Normal Mode" },
    defaultLanguage: { type: String, default: "JavaScript" },
    showSidebar: { type: String, default: "Yes" },
    autoSaveInterval: { type: String, default: "Off" },
    themev2: { type: String, default: "Dark" },
    accentColorv2: { type: String, default: "#000000" },
    fontSize: { type: Number, default: 14 },
    uiDensity: { type: String, default: "Comfortable" },
    sidebarLayout: { type: String, default: "Default" },
    tabSize: { type: Number, default: 2 },
    wordWrap: { type: String, default: "On" },
    lineNumbers: { type: String, default: "On" },
    syntaxStyle: { type: String, default: "Default" },
    autoFormat: { type: String, default: "No" },
    cloudSync: { type: String, default: "Off" },
    syncFrequency: { type: String, default: "Manual" },
    dataEncryption: { type: String, default: "Disabled" },
    desktopNotifications: { type: String, default: "Off" },
    snippetAlerts: { type: String, default: "Off" },
    appLockPin: { type: String, default: "" },
    sessionTimeout: { type: String, default: "Never" },
    exportFormat: { type: String, default: "JSON" },
    autoExportSchedule: { type: String, default: "Disabled" },
    appVersion: { type: String, default: "1.0.0" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);

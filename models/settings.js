const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    uiMode: { type: String, default: "Normal Mode" },
    defaultLanguage: { type: String, default: "JavaScript" },
    showSidebar: { type: String, default: "yes" },
    autoSaveInterval: { type: String, default: "off" },
    themev2: { type: String, default: "dark" },
    accentColorv2: { type: String, default: "blue" },
    fontSize: { type: Number, default: 16 },
    uiDensity: { type: String, default: "comfortable" },
    sidebarLayout: { type: String, default: "default" },
    tabSize: { type: Number, default: 2 },
    wordWrap: { type: String, default: "on" },
    lineNumbers: { type: String, default: "on" },
    syntaxStyle: { type: String, default: "dracula" },
    autoFormat: { type: String, default: "no" },
    cloudSync: { type: String, default: "off" },
    syncFrequency: { type: String, default: "manual" },
    dataEncryption: { type: String, default: "disabled" },
    desktopNotifications: { type: String, default: "off" },
    snippetAlerts: { type: String, default: "off" },
    appLockPin: { type: String, default: "" },
    sessionTimeout: { type: String, default: "never" },
    exportFormat: { type: String, default: "JSON" },
    autoExportSchedule: { type: String, default: "disabled" },
    appVersion: { type: String, default: "1.0.0" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);

"use client";
import {
  Bell,
  Braces,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  Database,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Keyboard,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Moon,
  Palette,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FaChrome, FaGithub } from "react-icons/fa";
type Section =
  | "account"
  | "security"
  | "appearance"
  | "monaco"
  | "tiptap"
  | "snippets"
  | "notifications"
  | "privacy"
  | "shortcuts";
const navigation = [
  {
    title: "Account",
    items: [
      { id: "account", label: "Profile", icon: User },
      { id: "security", label: "Security", icon: ShieldCheck },
    ],
  },
  {
    title: "Preferences",
    items: [
      { id: "appearance", label: "Appearance", icon: Palette },
      { id: "monaco", label: "Code editor", icon: Code2 },
      { id: "tiptap", label: "Rich text editor", icon: FileText },
      { id: "snippets", label: "Snippets", icon: Braces },
    ],
  },
  {
    title: "Application",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "privacy", label: "Privacy & data", icon: Database },
      { id: "shortcuts", label: "Keyboard shortcuts", icon: Keyboard },
    ],
  },
] as const;
const sectionTitles: Record<Section, string> = {
  account: "Profile settings",
  security: "Security",
  appearance: "Appearance",
  monaco: "Code editor",
  tiptap: "Rich text editor",
  snippets: "Snippet preferences",
  notifications: "Notifications",
  privacy: "Privacy & data",
  shortcuts: "Keyboard shortcuts",
};
function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Label className="text-sm font-medium">{title}</Label>
        {description && (
          <p className="max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="sm:min-w-47.5 sm:max-w-60">{children}</div>
    </div>
  );
}
function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="divide-y">{children}</CardContent>
    </Card>
  );
}
export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>("account");
  const [profile, setProfile] = useState({
    name: "Ajoy Das",
    username: "ajoydas",
    email: "ajoy@example.com",
    bio: "Developer and creator.",
  });
  const [settings, setSettings] = useState({
    editorTheme: "vs-dark",
    fontSize: "14",
    fontFamily: "JetBrains Mono",
    tabSize: "2",
    wordWrap: true,
    minimap: false,
    lineNumbers: true,
    bracketPairColorization: true,
    autoClosingBrackets: true,
    autoClosingQuotes: true,
    formatOnPaste: true,
    formatOnSave: true,
    autoIndent: true,
    stickyScroll: true,
    smoothScrolling: true,
    codeLens: false,
    spellCheck: true,
    richTextToolbar: true,
    focusMode: false,
    showWordCount: true,
    defaultFontSize: "16",
    editorLineHeight: "1.8",
    defaultLanguage: "javascript",
    defaultVisibility: "private",
    autoSave: true,
    confirmDelete: true,
    showLineNumbers: true,
    copyNotification: true,
    defaultSort: "updatedAt",
    defaultCodeTheme: "vs-dark",
    emailNotifications: false,
    productUpdates: true,
    securityAlerts: true,
    snippetReminders: false,
    profilePublic: false,
    showActivity: false,
    analytics: true,
  });
  const updateSetting = (
    key: keyof typeof settings,
    value: string | boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleSave = () => {
    console.log("Profile:", profile);
    console.log("Settings:", settings);
  };
  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-6">
            <SectionCard
              title="Personal information"
              description="Manage your personal information and public identity."
            >
              <div className="flex items-center gap-4 py-5">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                  AD
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Profile picture
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Change photo
                    </Button>
                    <Button size="sm" variant="ghost">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 py-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => updateProfile("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={profile.username}
                    onChange={(e) => updateProfile("username", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Email address</Label>
                  <div className="flex gap-2">
                    <Input value={profile.email} disabled className="flex-1" />
                    <Badge variant="outline" className="h-9">
                      <Check className="mr-1 size-3" />
                      Verified
                    </Badge>
                  </div>
                  <Button variant="link" className="h-auto p-0">
                    Change email address
                  </Button>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => updateProfile("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={250}
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {profile.bio.length}/250
                  </p>
                </div>
              </div>
            </SectionCard>
            <SectionCard
              title="Connected accounts"
              description="Manage the authentication providers connected to your account."
            >
              <SettingRow
                title="GitHub"
                description="Connect your GitHub account."
              >
                <Button variant="outline" size="sm">
                  <FaGithub className="mr-2 size-4" />
                  Connect GitHub
                </Button>
              </SettingRow>
              <SettingRow
                title="Google"
                description="Connect your Google account."
              >
                <Button variant="outline" size="sm">
                  <FaChrome className="mr-2 size-4" />
                  Connect Google
                </Button>
              </SettingRow>
            </SectionCard>
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="mr-2 size-4" />
                Save changes
              </Button>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="space-y-6">
            <SectionCard
              title="Authentication"
              description="Manage your account authentication and login methods."
            >
              <SettingRow
                title="Password"
                description="Change your account password."
              >
                <Button variant="outline" size="sm">
                  <Lock className="mr-2 size-4" />
                  Change password
                </Button>
              </SettingRow>
              <SettingRow
                title="Two-factor authentication"
                description="Add another layer of security to your account."
              >
                <Button variant="outline" size="sm">
                  <ShieldCheck className="mr-2 size-4" />
                  Enable 2FA
                </Button>
              </SettingRow>
              <SettingRow
                title="Passkeys"
                description="Use your device's biometrics or security key to sign in."
              >
                <Button variant="outline" size="sm">
                  <KeyRound className="mr-2 size-4" />
                  Manage passkeys
                </Button>
              </SettingRow>
            </SectionCard>
            <SectionCard
              title="Active sessions"
              description="Devices currently signed in to your account."
            >
              <div className="flex items-center gap-3 py-4">
                <div className="rounded-lg border p-3">
                  <Laptop className="size-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Windows · Chrome</p>
                  <p className="text-xs text-muted-foreground">
                    Current session · India
                  </p>
                </div>
                <Badge variant="secondary">Current</Badge>
              </div>
              <Separator />
              <SettingRow
                title="Other sessions"
                description="Sign out from other devices."
              >
                <Button variant="outline" size="sm">
                  <LogOut className="mr-2 size-4" />
                  Revoke sessions
                </Button>
              </SettingRow>
            </SectionCard>
            <SectionCard title="Security activity">
              <SettingRow
                title="Login notifications"
                description="Get notified about new login activity."
              >
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow
                title="Recent login history"
                description="Review your recent authentication activity."
              >
                <Button variant="outline" size="sm">
                  View activity
                  <ChevronRight className="ml-2 size-4" />
                </Button>
              </SettingRow>
            </SectionCard>
          </div>
        );
      case "appearance":
        return (
          <div className="space-y-6">
            <SectionCard
              title="Theme"
              description="Choose how Kodhra looks on your device."
            >
              <div className="grid grid-cols-3 gap-3 py-4">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Laptop },
                ].map((item) => (
                  <button key={item.id}>
                    <item.icon className="size-6" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <Check className="size-4 text-primary" />
                  </button>
                ))}
              </div>
            </SectionCard>
            <SectionCard
              title="Interface"
              description="Customize the application interface."
            >
              <SettingRow
                title="Compact sidebar"
                description="Use a smaller sidebar layout."
              >
                <Switch />
              </SettingRow>
              <SettingRow
                title="Reduce animations"
                description="Minimize interface transitions."
              >
                <Switch />
              </SettingRow>
              <SettingRow
                title="Show breadcrumbs"
                description="Display navigation breadcrumbs."
              >
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow
                title="Default dashboard"
                description="Choose your landing page."
              >
                <Select defaultValue="snippets">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="snippets">Snippets</SelectItem>
                    <SelectItem value="notebooks">Notebooks</SelectItem>
                    <SelectItem value="folders">Folders</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </SectionCard>
          </div>
        );
      case "monaco":
        return (
          <div className="space-y-6">
            <SectionCard
              title="Editor appearance"
              description="Customize your Monaco code editor."
            >
              <SettingRow
                title="Editor theme"
                description="Select your preferred code editor theme."
              >
                <Select
                  value={settings.editorTheme}
                  onValueChange={(v) =>
                    updateSetting("editorTheme", v as string)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vs-dark">VS Dark</SelectItem>
                    <SelectItem value="vs">VS Light</SelectItem>
                    <SelectItem value="hc-black">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                title="Font family"
                description="Choose your coding font."
              >
                <Select
                  value={settings.fontFamily}
                  onValueChange={(v) =>
                    updateSetting("fontFamily", v as string)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JetBrains Mono">
                      JetBrains Mono
                    </SelectItem>
                    <SelectItem value="Fira Code">Fira Code</SelectItem>
                    <SelectItem value="Consolas">Consolas</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                title="Font size"
                description="Adjust code editor font size."
              >
                <Select
                  value={settings.fontSize}
                  onValueChange={(v) => updateSetting("fontSize", v as string)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["12", "13", "14", "15", "16", "18", "20", "22"].map(
                      (v) => (
                        <SelectItem key={v} value={v}>
                          {v}px
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                title="Tab size"
                description="Number of spaces inserted when pressing Tab."
              >
                <Select
                  value={settings.tabSize}
                  onValueChange={(v) => updateSetting("tabSize", v as string)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="8">8 spaces</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </SectionCard>
            <SectionCard
              title="Editor behavior"
              description="Control how your editor behaves while coding."
            >
              {(
                [
                  ["wordWrap", "Word wrap", "Wrap long lines."],
                  ["minimap", "Minimap", "Show the code overview."],
                  ["lineNumbers", "Line numbers", "Show line numbers."],
                  [
                    "bracketPairColorization",
                    "Bracket colorization",
                    "Color matching brackets.",
                  ],
                  [
                    "autoClosingBrackets",
                    "Auto-closing brackets",
                    "Automatically close brackets.",
                  ],
                  [
                    "autoClosingQuotes",
                    "Auto-closing quotes",
                    "Automatically close quotes.",
                  ],
                  ["formatOnPaste", "Format on paste", "Format pasted code."],
                  [
                    "formatOnSave",
                    "Format on save",
                    "Format code when saving.",
                  ],
                  [
                    "autoIndent",
                    "Auto indentation",
                    "Automatically maintain indentation.",
                  ],
                  [
                    "stickyScroll",
                    "Sticky scroll",
                    "Keep the current code scope visible.",
                  ],
                  [
                    "smoothScrolling",
                    "Smooth scrolling",
                    "Enable smooth editor scrolling.",
                  ],
                  ["codeLens", "Code Lens", "Show inline code information."],
                ] as const
              ).map(([key, title, description]) => (
                <SettingRow key={key} title={title} description={description}>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(v) => updateSetting(key, v)}
                  />
                </SettingRow>
              ))}
            </SectionCard>
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Code2 className="size-4" />
                <p className="text-sm font-medium">Monaco configuration</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                These preferences must be passed to your Monaco Editor component
                through its options prop.
              </p>
            </div>
          </div>
        );
      case "tiptap":
        return (
          <div className="space-y-6">
            <SectionCard
              title="Writing preferences"
              description="Customize your Tiptap rich text editor."
            >
              <SettingRow
                title="Default font size"
                description="Default text size for new notebooks."
              >
                <Select
                  value={settings.defaultFontSize}
                  onValueChange={(v) =>
                    updateSetting("defaultFontSize", v as string)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="15">15px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                title="Line height"
                description="Adjust the spacing between lines."
              >
                <Select
                  value={settings.editorLineHeight}
                  onValueChange={(v) =>
                    updateSetting("editorLineHeight", v as string)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.4">Compact</SelectItem>
                    <SelectItem value="1.6">Normal</SelectItem>
                    <SelectItem value="1.8">Relaxed</SelectItem>
                    <SelectItem value="2">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              {(
                [
                  [
                    "spellCheck",
                    "Spell check",
                    "Check spelling while writing.",
                  ],
                  [
                    "richTextToolbar",
                    "Formatting toolbar",
                    "Show the rich text formatting toolbar.",
                  ],
                  [
                    "focusMode",
                    "Focus mode",
                    "Reduce distractions while writing.",
                  ],
                  [
                    "showWordCount",
                    "Word count",
                    "Show word and character counts.",
                  ],
                ] as const
              ).map(([key, title, description]) => (
                <SettingRow key={key} title={title} description={description}>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(v) => updateSetting(key, v)}
                  />
                </SettingRow>
              ))}
            </SectionCard>
            <SectionCard
              title="Content defaults"
              description="Choose how new notebooks should be structured."
            >
              <SettingRow
                title="Default heading"
                description="Starting heading level for new documents."
              >
                <Select defaultValue="h1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h1">Heading 1</SelectItem>
                    <SelectItem value="h2">Heading 2</SelectItem>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                title="Default text alignment"
                description="Alignment for new content."
              >
                <Select defaultValue="left">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="justify">Justify</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </SectionCard>
          </div>
        );
      case "snippets":
        return (
          <div className="space-y-6">
            <SectionCard
              title="Default snippet settings"
              description="Set defaults when creating new snippets."
            >
              <SettingRow
                title="Default language"
                description="Programming language for new snippets."
              >
                <Select
                  value={settings.defaultLanguage}
                  onValueChange={(v) =>
                    updateSetting("defaultLanguage", v as string)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "javascript",
                      "typescript",
                      "html",
                      "css",
                      "python",
                      "java",
                      "cpp",
                      "json",
                      "sql",
                      "bash",
                    ].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                title="Default visibility"
                description="Visibility for newly created snippets."
              >
                <Select
                  value={settings.defaultVisibility}
                  onValueChange={(v) =>
                    updateSetting("defaultVisibility", v as string)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                title="Default sorting"
                description="How snippets are sorted by default."
              >
                <Select
                  value={settings.defaultSort}
                  onValueChange={(v) =>
                    updateSetting("defaultSort", v as string)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt">Recently updated</SelectItem>
                    <SelectItem value="createdAt">Recently created</SelectItem>
                    <SelectItem value="title">Name</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </SectionCard>
            <SectionCard
              title="Snippet behavior"
              description="Configure how your snippets are saved and displayed."
            >
              {(
                [
                  [
                    "autoSave",
                    "Autosave",
                    "Automatically save your snippet changes.",
                  ],
                  [
                    "confirmDelete",
                    "Confirm before deleting",
                    "Ask for confirmation before deleting content.",
                  ],
                  [
                    "showLineNumbers",
                    "Show line numbers",
                    "Display line numbers in snippet previews.",
                  ],
                  [
                    "copyNotification",
                    "Copy notifications",
                    "Show confirmation when code is copied.",
                  ],
                ] as const
              ).map(([key, title, description]) => (
                <SettingRow key={key} title={title} description={description}>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(v) => updateSetting(key, v)}
                  />
                </SettingRow>
              ))}
            </SectionCard>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <SectionCard
              title="Email notifications"
              description="Choose which emails you would like to receive."
            >
              {(
                [
                  [
                    "emailNotifications",
                    "Email notifications",
                    "Receive application notifications through email.",
                  ],
                  [
                    "securityAlerts",
                    "Security alerts",
                    "Get notified about important security events.",
                  ],
                  [
                    "productUpdates",
                    "Product updates",
                    "Receive new feature and release announcements.",
                  ],
                  [
                    "snippetReminders",
                    "Snippet reminders",
                    "Receive occasional reminders about your saved snippets.",
                  ],
                ] as const
              ).map(([key, title, description]) => (
                <SettingRow key={key} title={title} description={description}>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(v) => updateSetting(key, v)}
                  />
                </SettingRow>
              ))}
            </SectionCard>
          </div>
        );
      case "privacy":
        return (
          <div className="space-y-6">
            <SectionCard
              title="Privacy"
              description="Control your public presence and data preferences."
            >
              {(
                [
                  [
                    "profilePublic",
                    "Public profile",
                    "Allow others to view your public profile.",
                  ],
                  [
                    "showActivity",
                    "Show activity",
                    "Display your public contribution activity.",
                  ],
                  [
                    "analytics",
                    "Usage analytics",
                    "Allow anonymous usage analytics to improve Kodhra.",
                  ],
                ] as const
              ).map(([key, title, description]) => (
                <SettingRow key={key} title={title} description={description}>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(v) => updateSetting(key, v)}
                  />
                </SettingRow>
              ))}
            </SectionCard>
            <SectionCard
              title="Your data"
              description="Manage your Kodhra data."
            >
              <SettingRow
                title="Export data"
                description="Download your snippets, notebooks, and folders."
              >
                <Button variant="outline" size="sm">
                  <Download className="mr-2 size-4" />
                  Export data
                </Button>
              </SettingRow>
              <SettingRow
                title="Storage usage"
                description="View how much storage your content uses."
              >
                <Button variant="outline" size="sm">
                  <HardDrive className="mr-2 size-4" />
                  View storage
                </Button>
              </SettingRow>
            </SectionCard>
            <Card className="rounded-xl border-destructive/40 shadow-none">
              <CardHeader>
                <div className="flex items-center gap-2 text-destructive">
                  <Trash2 className="size-5" />
                  <CardTitle className="text-base">Danger zone</CardTitle>
                </div>
                <CardDescription>
                  Permanently delete your account and associated data. This
                  action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" size="sm">
                  Delete account
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case "shortcuts":
        const shortcuts = [
          ["Save snippet", "Ctrl + S"],
          ["Copy code", "Ctrl + Shift + C"],
          ["Search", "Ctrl + K"],
          ["New snippet", "Ctrl + Shift + N"],
          ["New notebook", "Ctrl + Shift + B"],
          ["Toggle sidebar", "Ctrl + \\"],
          ["Format code", "Shift + Alt + F"],
          ["Find in editor", "Ctrl + F"],
          ["Replace in editor", "Ctrl + H"],
          ["Command palette", "Ctrl + Shift + P"],
        ];
        return (
          <SectionCard
            title="Keyboard shortcuts"
            description="Quick actions to help you work faster in Kodhra."
          >
            {shortcuts.map(([label, shortcut]) => (
              <div
                key={label}
                className="flex items-center justify-between py-4"
              >
                <span className="text-sm">{label}</span>
                <kbd className="rounded-md border bg-muted px-2.5 py-1.5 text-xs font-mono">
                  {shortcut}
                </kbd>
              </div>
            ))}
          </SectionCard>
        );
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-350 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Page heading */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="size-4" />
            <span>Workspace</span>
            <ChevronRight className="size-3" />
            <span>Settings</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account, editor preferences, and application settings.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-6">
            {navigation.map((group) => (
              <div key={group.title} className="space-y-2">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as Section)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        {item.label}
                        {active && <ChevronRight className="ml-auto size-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <Separator />
            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <CircleHelp className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Need help?</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Find answers and learn more about Kodhra.
              </p>
              <Button variant="link" className="mt-2 h-auto p-0 text-xs">
                Documentation
                <ExternalLink className="ml-1 size-3" />
              </Button>
            </div>
          </aside>
          {/* Main content */}
          <main className="min-w-0 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  {sectionTitles[activeSection]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Configure your {sectionTitles[activeSection].toLowerCase()}{" "}
                  preferences.
                </p>
              </div>
              {activeSection !== "security" &&
                activeSection !== "privacy" &&
                activeSection !== "shortcuts" && (
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 size-4" />
                    Save changes
                  </Button>
                )}
            </div>
            {renderContent()}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
              <p className="text-xs text-muted-foreground">Kodhra · Settings</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="mr-2 size-3.5" />
                Reset view
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

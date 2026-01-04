# Kodhra – Missing Features TODO List

## PHASE 1 — **Must-Have (Before Public Launch)**

These protect user trust and prevent data loss.

### 1. Snippet Lifecycle & Safety

* [x] Add snippet status (`draft / published / private / archived`)
* [ ] Separate visibility from draft logic
* [ ] Add “last edited at / by” metadata

---

### 2. Snippet Versioning (Minimal but Solid)

* [x] Store version history on each save
* [x] Allow rollback to previous version


---

### 3. Search Must Actually Search Code

* [x] Enable full-text search inside code content
* [x] Index title + description + code body
* [ ] Highlight matched code lines in results

---

### 4. Data Safety

* [ ] Full account export (snippets + folders + notebooks)
* [ ] Folder-wise export
* [ ] Backup snapshot generation
* [ ] Restore from snapshot

---

### 5. Permission Basics

* [ ] Private but shareable snippets (link-based)
* [ ] Read-only shared access
* [ ] Token expiration / revoke access

---

## PHASE 2 — **Power-User Features (V1.1 / V2)**

These turn Kodhra into a daily-use tool.

### 6. Advanced Search & Filters

* [ ] Search operators (`language:`, `tag:`, `author:`)
* [ ] Date filters (`created:`, `updated:`)
* [ ] Save search filters (Smart Views)
* [ ] Result ranking (recency + favorites + usage)

---

### 7. Organization Improvements

* [ ] Nested folders
* [ ] Folder breadcrumbs
* [ ] Move snippet between folders via shortcut
* [ ] Detect unorganized snippets (no folder / no tags)

---

### 8. Editor Experience Enhancements

* [ ] Autosave status indicator
* [ ] Conflict detection (multiple tabs)
* [ ] Snippet templates per language
* [ ] Code formatting toggle
* [ ] Indentation normalization

---

### 9. Usage Analytics (Private)

* [ ] Most opened snippets
* [ ] Least used snippets
* [ ] Never-opened snippets
* [ ] Weekly / monthly activity stats

---

## PHASE 3 — **Social & Collaboration Layer**

Only after core stability.

### 10. Social Interactions

* [ ] Comment system on snippets
* [ ] Fork snippet with attribution
* [ ] Fork history tracking
* [ ] Favorite / fork counts

---

### 11. Activity & Notifications

* [ ] Activity feed (publish, fork, favorite)
* [ ] Notification system
* [ ] Notification preferences

---

## PHASE 4 — **Performance & Scale**

Invisible but critical.

### 12. Performance Architecture

* [ ] Explicit cache invalidation rules
* [ ] Search index optimization
* [ ] Tag / language indexing
* [ ] Paginated infinite scroll fallback

---

### 13. Offline & Sync (Advanced)

* [ ] Offline read mode
* [ ] Offline write queue
* [ ] Sync conflict resolution
* [ ] Manual sync control

---

## PHASE 5 — **Developer Ergonomics (Optional but Loved)**

### 14. Keyboard-First UX

* [ ] Global shortcut map
* [ ] Vim-like navigation mode
* [ ] Custom shortcut editor

---

## FINAL PRIORITY SNAPSHOT

### Absolute Minimum (Non-Negotiable)

* Versioning
* Code search
* Permissions
* Backup & restore

### High ROI (Feels Powerful)

* Search operators
* Templates
* Analytics
* Nested folders

### Nice Later

* Offline
* Social
* Notifications


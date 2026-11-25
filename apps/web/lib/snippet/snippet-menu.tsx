import { ClipboardCopy, Copy, Edit, Flag, Move, Share, StickyNote, Trash, X } from "lucide-react";

 export const snippetMenu = [
    {
      label: "Actions",
      items: [
        { label: "Edit Snippet", value: "edit", icon: Edit },
        { label: "Share", value: "share", icon: Share },
        { label: "Duplicate", value: "duplicate", icon: StickyNote },
        { label: "Copy Link", value: "copy-link", icon: Copy },
        { label: "Move", value: "move", icon: Move },
        {
          label: "Copy Content",
          value: "copy-content",
          icon: ClipboardCopy,
        },
      ],
    },
    {
      label: "Danger Zone",
      items: [
        { label: "Delete", value: "delete", icon: Trash },
        { label: "Report", value: "report", icon: Flag },
        { label: "Cancel", value: "cancel", icon: X },
      ],
    },
  ];
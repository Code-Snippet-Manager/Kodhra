import { snippetMenu } from "@/lib/snippet/snippet-menu";

export type Snippets = {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  folder: string;
  author: {
    name: string;
    image: string;
    _id: string;
    email: string;
  };
  isFavorite: boolean;
  isPinned: boolean;
  isPublic: boolean;
  isDeleted: boolean;
  createdAt: string;
};

export type SnippetMenu = typeof snippetMenu;
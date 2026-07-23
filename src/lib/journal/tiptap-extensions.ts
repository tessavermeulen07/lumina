import { Mark, mergeAttributes, Node } from "@tiptap/core";
import Image from "@tiptap/extension-image";

export const EntryImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-storage-path": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-storage-path"),
        renderHTML: (attributes) => {
          if (!attributes["data-storage-path"]) {
            return {};
          }

          return { "data-storage-path": attributes["data-storage-path"] };
        },
      },
    };
  },
});

export const SmallCaps = Mark.create({
  name: "smallCaps",

  parseHTML() {
    return [{ tag: "span.lumina-small-caps" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { class: "lumina-small-caps" }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleSmallCaps:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    };
  },
});

export const Title = Node.create({
  name: "title",

  content: "inline*",
  group: "block",
  defining: true,

  parseHTML() {
    return [{ tag: "h1.lumina-title" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "h1",
      mergeAttributes(HTMLAttributes, { class: "lumina-title" }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleTitle:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, "paragraph"),
    };
  },
});

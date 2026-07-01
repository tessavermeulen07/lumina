import "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    smallCaps: {
      toggleSmallCaps: () => ReturnType;
    };
    title: {
      toggleTitle: () => ReturnType;
    };
  }
}

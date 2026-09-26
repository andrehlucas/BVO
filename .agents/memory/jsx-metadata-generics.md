---
name: JSX metadata and generic components
description: Preview transform behavior for explicitly typed generic JSX components
---

Avoid explicit JSX type parameters such as `<GenericComponent<ItemType> />` in this workspace's Vite React preview.

**Why:** The preview's JSX metadata injector inserts attributes before the type parameter, leaving Babel with invalid JSX. TypeScript's `tsc --noEmit` can pass while the live preview fails to render.

**How to apply:** Let component props infer the generic type, annotate callback parameters where needed, or create a typed wrapper outside JSX. Check the live module transform or preview after changing generic JSX.
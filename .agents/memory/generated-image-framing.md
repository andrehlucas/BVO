---
name: Generated image framing
description: Aspect-ratio behavior of generated raster imagery used in the web app.
---

The image generator may return square JPEGs even when the prompt explicitly requests a landscape composition. Treat the requested aspect ratio as framing guidance, not a guaranteed output dimension.

**Why:** In September 2026, several 4:3 and 16:10 prompts all returned 1024×1024 files. The website displayed them in wider containers.

**How to apply:** Inspect the actual dimensions and important subject placement before integrating generated images. Use intentional cropping with `object-fit` and `object-position`, or crop exported assets when the original framing does not work.
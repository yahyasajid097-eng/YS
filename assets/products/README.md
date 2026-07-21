# Product Photos

Drop your product photos in this folder, then reference them in
`data/products.json` under each product's `"images"` array.

Recommended: square or 4:5 photos, 1200x1500px, JPG or WEBP, under 300KB each
for fast loading.

Example for one product:

```json
"images": [
  "assets/products/mb-001-1.jpg",
  "assets/products/mb-001-2.jpg",
  "assets/products/mb-001-3.jpg"
]
```

If a photo fails to load (wrong filename, missing file) the site
automatically falls back to the gold line-art placeholder — it never
shows a broken image icon.

Leave "images": [] empty for any product you don't have photos for yet;
the illustrated placeholder will be used automatically.

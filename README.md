# Moon Blossom — Luxury Handbags Website

"Bloom Under the Moon" — a complete, static, multilingual e-commerce website for
a premium women's handbag brand in Morocco. No backend, no build step, no
database. Payment is Cash on Delivery, and every order is sent straight to your
WhatsApp number as a formatted message.

## ✏️ How to edit content (no code required)

All editable content lives in three JSON files inside `/data/`:

- **`data/store.json`** — store name, slogan, WhatsApp number, currency,
  cities, shipping fee/threshold, social links, contact info.
- **`data/products.json`** — every product: name/description/specs in
  English, French and Arabic, price, discount price, colors, category,
  badges (`new`, `sale`, `bestseller`), and whether it's `featured` /
  `newArrival`.
- **`data/translations.json`** — every UI label (buttons, nav, section
  titles) in English (`en`), French (`fr`) and Arabic (`ar`).

To add a product, copy an existing entry inside the `products` array in
`data/products.json`, give it a unique `id` and `slug`, and edit the fields.
No JavaScript or HTML editing is required — the site reads this file on
every page load.

To change the WhatsApp number that receives orders, edit `whatsappNumber` in
`data/store.json` (digits only, country code first, no `+` or spaces —
e.g. `212651958378`).

## 🛍️ How checkout works

1. Customer adds products to their bag (stored in the browser via
   `localStorage`, so it persists across pages and visits).
2. At checkout, they fill in name, phone, city and address.
3. On "Confirm Order via WhatsApp", the site opens WhatsApp (web or app)
   with a pre-filled, formatted message containing all order details, sent
   to the number configured in `data/store.json`.
4. You confirm and fulfil the order manually, cash collected on delivery.

No payment gateway, server, or database is involved.

## 🌍 Languages

English, French and Arabic (full RTL layout) are supported out of the box.
Visitors can switch languages from the navigation bar; their choice is
remembered on their device.

## 📁 Folder structure

```
moon-blossom/
├── index.html          Home
├── shop.html            Shop / listing with filters
├── product.html          Product detail (?slug=... in the URL)
├── categories.html       Category grid
├── about.html            Brand story
├── contact.html          Contact form + info
├── faq.html               FAQ accordion
├── cart.html              Shopping bag
├── checkout.html          Checkout + WhatsApp order
├── privacy.html           Privacy Policy
├── returns.html           Return & Refund Policy
├── shipping.html          Shipping Policy
├── 404.html                Not found page
├── manifest.json          PWA manifest
├── sw.js                    PWA service worker (offline caching)
├── robots.txt / sitemap.xml SEO
├── css/style.css           All styling (design tokens at the top)
├── js/main.js               i18n, header/footer, nav, icons, utilities
├── js/products.js           Catalog rendering (home/shop/product/categories)
├── js/cart.js                Cart, wishlist, checkout, WhatsApp message builder
└── data/*.json                Editable content (see above)
```

## 🚀 Deploy

**GitHub Pages**
1. Push this folder to a GitHub repository.
2. Repo Settings → Pages → Deploy from branch → select `main` and `/root`.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

**Netlify**
1. Drag and drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop), or
2. Connect the GitHub repo — no build command needed, publish directory is `/`.

No environment variables, API keys, or build tools are required — it's
plain HTML/CSS/JS.

## 🎨 Design notes

- Colors: Black `#0D0D0D`, Gold `#D4AF37`, White `#FFFFFF`, on a warm cream
  secondary (`#F7F3EA`).
- Typography: Cormorant Garamond (display) + Jost (body) for Latin;
  Tajawal for Arabic.
- Signature motif: the crescent moon — used in dividers, the hero, the
  favicon, and the loading/empty states — echoing "Bloom Under the Moon."
- Product imagery is illustrated in gold line-art (no stock photography
  license needed). Swap in real product photography by editing
  `bagIllustration()` in `js/main.js`, or replace the generated SVG per
  product with an `<img>` tag pointing to your own photos once available.

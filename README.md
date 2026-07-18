# Rapid Dry Restoration — Website Template

A complete, animated 5-page website template for a water damage restoration / mold
remediation business, built with plain HTML/CSS/JS (no build step, no framework)
so it deploys directly to GitHub Pages.

## What's included

- `index.html` — Home (hero with animated moisture gauge, stats counters, services, process timeline, testimonials)
- `services.html` — Full detail on all 6 services
- `about.html` — Company story, certifications, history timeline, crew
- `quote.html` — 4-step interactive price estimator with a live animated gauge
- `contact.html` — Contact form, direct info, service-area map
- `css/style.css` — All styling, animations, responsive rules
- `js/main.js` — Nav, scroll-reveal, counters, gauge, form handling (shared across pages)
- `js/quote-calculator.js` — The quote calculator's pricing logic and wizard state

Every page is fully static — no server, database, or build tools required.

## Before you publish — replace these placeholders

1. **Phone number & email** — search-and-replace `(800) 555-1234`, `+18005551234`,
   and `help@rapiddryrestoration.example` across all HTML files.
2. **Business name / address / license number** — currently "Rapid Dry Restoration",
   `123 Industrial Pkwy`, and `License #WD-00000` — appears in headers and footers.
3. **Pricing rates** — open `js/quote-calculator.js` and edit the `RATES` object at
   the top to match your actual market rates (per-sq-ft rates by water category /
   mold severity, urgency multipliers, minimum job price).
4. **Photos** — hero and service images are hotlinked from Unsplash (free license,
   no attribution required) as placeholders. Swap in your own project photos before
   going live — replace the `<img src="...">` URLs with paths to files in an
   `images/` folder you add.
5. **Service area / map** — `contact.html` has a placeholder OpenStreetMap embed and
   a list of city badges. Update the `bbox` values in the iframe `src` to your area,
   or swap in a Google Maps embed.
6. **Testimonials / stats** — the numbers and quotes in `index.html` are placeholders
   for the template. Replace with real reviews and figures.

## Making the forms actually send email (required for GitHub Pages)

GitHub Pages only serves static files — it can't process form submissions on its
own. Both the quote form and the contact form are pre-wired for **Formspree**
(free tier, no backend needed):

1. Go to https://formspree.io and create a free account.
2. Create a new form and copy your form ID (looks like `abcdwxyz`).
3. In `quote.html` and `contact.html`, replace every instance of
   `https://formspree.io/f/YOUR_FORM_ID` with your real endpoint.
4. That's it — submissions will arrive in your Formspree inbox / forward to your email.

Until you do this, the forms will show a demo "success" state locally (see the
`data-form` handling in `js/main.js` and `js/quote-calculator.js`) so you can see
the flow without a live endpoint. Netlify Forms or Getform are drop-in alternatives
if you prefer.

## Deploying to GitHub Pages

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then in your repo: **Settings → Pages → Source → Deploy from branch → main → / (root)**.
Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/` within a
couple of minutes.

## Design notes

- **Palette**: deep flood-navy (`#0B1F2E`), safety-orange (`#FF5A1F`), and a
  restored/dry teal (`#17B4C4`) — chosen to echo the industry itself (hazard
  signage, moisture meters, drying equipment) rather than a generic template look.
- **Type**: Oswald (condensed display, headlines) + Inter (body) + IBM Plex Mono
  (data readouts, labels) — loaded from Google Fonts via `@import` in `style.css`.
- **Signature element**: the animated semicircle "moisture gauge" in the hero
  doubles as the live result visual on the quote page, tying the whole site
  together around one motif.
- All animations respect `prefers-reduced-motion`.

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses CSS custom
properties, `IntersectionObserver`, and SVG/CSS transforms — no polyfills included.

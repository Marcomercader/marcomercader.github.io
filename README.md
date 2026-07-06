# marcomercader.github.io

My personal portfolio. A single static page built with plain HTML, CSS, and vanilla JS. No build step, no frameworks.

## Structure

```
index.html    markup and content
style.css     theming (dark default + light) and layout
script.js     theme toggle + interactive terminal
assets/       screenshots, GIFs, and an optional OG image
README.md     this file
```

## Run locally

It is just static files, so open `index.html` directly, or serve it:

```bash
# any one of these
python3 -m http.server 8000
npx serve .
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

This repo is named `marcomercader.github.io`, so GitHub serves it as a user site at `https://marcomercader.github.io` straight from the default branch. No Actions or build required.

1. Create a repo on GitHub named exactly **`marcomercader.github.io`**.
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/Marcomercader/marcomercader.github.io.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment**. Set **Source** to *Deploy from a branch*, branch **main**, folder **/ (root)**. Save.
4. Wait a minute, then open `https://marcomercader.github.io`.

Every push to `main` republishes automatically.

## Things to fill in later

Search the code for `TODO` and the placeholder slots:

- **Project links** in `index.html`: LHF repo, Monk demo + repo, Penn GeoGuessr repo (all currently `href="#"`).
- **Media**: drop screenshots / a gameplay GIF into `assets/` and replace the `.project__media` placeholder divs with `<img>` tags.
- **OG image** (optional): add `assets/og-image.png` (1200x630) and uncomment the `og:image` meta tag in `<head>` for a richer link preview.

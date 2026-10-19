# Marco Opertti

Personal website and design portfolio. Plain HTML, CSS, and JavaScript; no build step.

## Files

- `index.html`: bio, Smooth, experience, education, activities, and hobbies.
- `style.css`: shared white-background typography and layout. Local Roobert headings and Inter body type.
- `script.js`: portrait animation and accessible hobby photo dialogs.
- `design/`: design portfolio, with its original project media.
- `assets/Marco_Resume.pdf`: current resume served by the header link.
- `assets/fonts/`: locally served fonts.

## Preview

Run `python3 -m http.server 8777 --bind 127.0.0.1`, then visit `http://127.0.0.1:8777/` or `/design/`.

## Deployment

GitHub Pages serves the repository's main branch at `https://marcoopertti.com`. Pushing to main publishes changes.

## Design

Keep content visible in one continuous document with small headings. No accordions, terminal, cards, badges, or progress bar. Links are plain and underlined. The portrait asterisk triggers a passing pixelation wave and respects reduced motion. Hobby photos open in a native dialog with Escape dismissal and focus restoration. Portfolio media retains its original colors.

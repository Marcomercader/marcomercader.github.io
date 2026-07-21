# Handoff — Marco Opertti portfolio

Paste this to a fresh Claude Code session (e.g. in VS Code) to pick up where the last one left off.

## What this is

A single-page personal portfolio for **Marco Opertti** (CS @ Penn, class of 2028). Audience is tech recruiters and engineers reviewing internship applications. Deploys to **GitHub Pages** at `https://marcomercader.github.io`.

- **Pure static site**: plain HTML, CSS, vanilla JS. No frameworks, no build step, no npm. Just files.
- Location on disk: **`/Users/marcoopertti/website/`**
- It is its own independent git repo. Do NOT couple it to the `~/monk` project (a previous session had to be told this twice).

## Run / preview it locally

No build. Serve the folder and open it:

```bash
cd /Users/marcoopertti/website
python3 -m http.server 8777 --bind 127.0.0.1
# then open http://127.0.0.1:8777/
```

(If port 8777 is busy: `lsof -ti:8777 | xargs kill -9`.)

## Current git state

- Branch: `main`, remote `origin` = https://github.com/Marcomercader/marcomercader.github.io (GitHub Pages serves it at https://marcomercader.github.io).
- Deploys automatically on push to `main` (Pages, deploy-from-branch, root folder). No Actions needed.
- Raw source material (`design minor/`, `Screenshots-projcovers/`, `hobbies/`) is gitignored; only the processed copies in `assets/` ship.
- NOTE: sections of this handoff below may be stale (the site has since gained coursework, hobbies, a design-minor easter egg, new colors, and Space Grotesk/Space Mono type). Trust the code first.

## File map

```
index.html   markup + content + meta/OG tags
style.css     theming (dark default + light), layout, animations
script.js     theme toggle + terminal + scroll-spy + scroll-reveal
README.md     deploy instructions
HANDOFF.md    this file
.gitignore    ignores .claude/ and .DS_Store
.claude/      local preview config, GIT-IGNORED (not part of the site)
assets/       screenshots / GIFs / OG image go here (currently just .gitkeep)
```

## What's already built

**Sections (single page, smooth-scroll nav):**
1. Hero — name, tagline, GitHub/LinkedIn/Email/Resume buttons, `/` hint.
2. Terminal (the "about" centerpiece) — see below.
3. Projects — LHF, Monk, Penn GeoGuessr (in that order), each with 16:9 placeholder media slot, tags, description, links.
4. Experience — compact vertical timeline, one line each.
5. Footer — name, links, "No frameworks were harmed."

**Interactive terminal (`script.js`):**
- Boots by auto-typing `whoami`, prints a 3-sentence bio + a hint.
- Real typed input via a transparent `<input>` overlaid on a rendered "mirror" (`#term-typed` + `.terminal__cursor` + `#term-ghost`). This is how the blinking block cursor and inline ghost-autocomplete are drawn. If you touch the input, keep the mirror in sync via `syncRender()`.
- Commands: `help`, `whoami`, `projects`, `skills`, `languages`, `contact`, `ls`, `theme`, `despacito`, `soccer`, `snowboard`, `clear`, and the easter egg `sudo hire-me`. Unknown → `command not found: try 'help'`.
- Up/down arrow history; **Tab** accepts the ghost completion.
- Clickable command **chips** below the terminal (`data-cmd` attr) run commands.
- Global **`/`** shortcut scrolls to + focuses the terminal.

**Other behavior:**
- Theme toggle: dark default + light. Persisted in a JS variable only — **no localStorage** (hard requirement).
- Scroll-spy: active nav link gets `.is-active`.
- Scroll-reveal: `.project` and `.timeline__item` fade in via IntersectionObserver; degrades gracefully and respects `prefers-reduced-motion`.

## Design constraints (keep these)

- **Monospace everywhere.** Whole site uses JetBrains Mono (loaded from Google Fonts). No Inter / sans anymore. `--font-mono` in `:root`.
- One accent color, used sparingly: teal `--accent: #2dd4bf`.
- Dark theme by default, light mode via toggle. Terminal stays dark in both.
- Generous whitespace, subtle hover states. Avoid heavy animation, parallax, particles.
- Fully responsive; must look good on mobile.
- **No em dashes anywhere in the copy.** (Use hyphens or rewrite.)
- Accessible: keyboard focus states, aria labels on icon links, terminal input labeled.
- Lighthouse-friendly: no render-blocking junk, system-font fallbacks.

## Content facts (so you don't reinvent them)

- Name: Marco Opertti. From Washington DC and Montevideo, Uruguay. Bilingual (English + Spanish, both native).
- GitHub: https://github.com/Marcomercader · LinkedIn: https://www.linkedin.com/in/marco-opertti · Email: opertti@sas.upenn.edu
- Resume PDF: https://github.com/Marcomercader/resume/raw/main/Marco%20Opertti%20Resume%202026.pdf
- Projects: **LHF** (Swift/SwiftUI assignment tracker, built with a friend, Marco owns UI/design), **Monk** (TS/Next.js/Supabase/Claude API productivity+meditation app), **Penn GeoGuessr** (Java, solo, 50+ campus locations, **written by hand with no AI** — this is a point of pride, keep the badge).
- Experience: LightFeather (Tech Intern, DC, Summer 2026); TakeOff Media (Jr Web Dev, Montevideo, Summer 2025, semantic search w/ Ollama+Qdrant over 1,000+ videos); MIDES Uruguay (Data Analyst Intern, **2024**); North-West Soccer Camp (Founder, DC, 2024).
- Fun facts used in terminal: co-organizes Penn's largest Latino festival (2,000+ attendees, $10,000+ raised); ran a DC youth soccer camp for 50+ kids at 18; snowboards competitively.

## Open TODOs / placeholders

Search the code for `TODO` and "coming soon":
- **Project links are `href="#"`**: LHF repo, Monk demo + repo, Penn GeoGuessr repo. Need real URLs.
- **Media placeholders**: three 16:9 `.project__media` divs + a GeoGuessr gameplay GIF. Replace with `<img>` once Marco provides files (drop in `assets/`).
- **OG image**: `assets/og-image.png` (1200×630) + uncomment the `og:image` meta in `<head>` for rich link previews.

## Suggested next improvements (not yet done)

Roughly in priority order:
1. **Mobile nav gap** — below 560px the nav links are hidden with no replacement. Add a compact menu or anchor row so phone users can still jump between sections.
2. Add the real screenshots/GIF and fill in the real project URLs (biggest content wins).
3. OG image + `JSON-LD Person` schema + canonical URL for sharing/SEO.
4. Self-host the JetBrains Mono subset to drop the Google Fonts render dependency (faster first paint).
5. `404.html` for a branded GitHub Pages not-found page.
6. Deep-link terminal output (clicking a `projects`/`contact` line scrolls to the relevant card); copy-email-to-clipboard with a small toast; a couple more gag commands (`pwd`, `date`).

## Gotchas

- The terminal input is visually transparent by design (the mirror draws the text). If typing ever looks invisible, JS failed to run — check the console; don't "fix" it by making the input opaque.
- Keep everything working as plain files opened over `file://` or a static server. No bundler, no server-side anything.

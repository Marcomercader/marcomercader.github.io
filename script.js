/* ============================================================
   Marco Opertti — portfolio behavior
   Vanilla JS. Two features: theme toggle + interactive terminal.
   No localStorage anywhere; theme lives in a module variable.
   ============================================================ */

(function () {
  "use strict";

  /* ==========================================================
     THEME TOGGLE
     Choice persists only for the session via `currentTheme`.
     ========================================================== */
  var currentTheme = "dark"; // in-memory only, per requirement
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    currentTheme = theme;
    root.setAttribute("data-theme", theme);
    toggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    root.setAttribute(
      "data-theme-color",
      theme === "light" ? "#fbfdfc" : "#0d1117"
    );
  }

  toggle.addEventListener("click", function () {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  /* ==========================================================
     TERMINAL
     ========================================================== */
  var output = document.getElementById("terminal-output");
  var form = document.getElementById("terminal-form");
  var input = document.getElementById("terminal-input");
  var terminal = document.getElementById("terminal");

  // Command history for the up/down arrows.
  var history = [];
  var historyIndex = -1; // -1 means "not currently browsing history"

  /* ---------- small DOM helpers ---------- */

  // Append a plain text line. `variant` maps to a CSS modifier class.
  function printLine(text, variant) {
    var line = document.createElement("div");
    line.className = "terminal__line" + (variant ? " terminal__line--" + variant : "");
    line.textContent = text;
    output.appendChild(line);
    scrollToBottom();
    return line;
  }

  // Append a line that may contain HTML (used only for trusted, hard-coded links).
  function printHTML(html, variant) {
    var line = document.createElement("div");
    line.className = "terminal__line" + (variant ? " terminal__line--" + variant : "");
    line.innerHTML = html;
    output.appendChild(line);
    scrollToBottom();
    return line;
  }

  // Echo a command the way a shell does, with the prompt in front.
  function echoCommand(cmd) {
    var line = document.createElement("div");
    line.className = "terminal__line terminal__line--cmd";
    var prompt = document.createElement("span");
    prompt.className = "term-prompt";
    prompt.textContent = "marco@penn ~ %";
    line.appendChild(prompt);
    line.appendChild(document.createTextNode(cmd));
    output.appendChild(line);
    scrollToBottom();
  }

  function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
  }

  var RESUME_URL =
    "https://github.com/Marcomercader/resume/raw/main/Marco%20Opertti%20Resume%202026.pdf";

  /* ---------- command implementations ---------- */
  // Each command returns an array of {text, variant} or {html, variant} lines.

  var COMMANDS = {
    help: function () {
      return [
        { text: "Available commands:", variant: "accent" },
        { text: "  help        list all commands" },
        { text: "  whoami      who I am" },
        { text: "  projects    what I have built" },
        { text: "  skills      languages and tools" },
        { text: "  languages   spoken languages" },
        { text: "  despacito   a fun one" },
        { text: "  soccer      another fun one" },
        { text: "  clear       clear the screen" },
      ];
    },

    whoami: function () {
      return [
        {
          text:
            "I'm Marco, a CS student at Penn from Washington DC and Montevideo, Uruguay. I grew up bilingual and I build software the same way I think: practical first.",
        },
        {
          text:
            "Right now I'm working on LHF, a native assignment tracker for college students, and spending too much time perfecting its UI.",
        },
        {
          text:
            "Outside of code I run cultural events, play soccer, and snowboard competitively.",
        },
      ];
    },

    projects: function () {
      return [
        { text: "LHF            native assignment tracker for students (Swift, SwiftUI)" },
        { text: "Monk           productivity + meditation app (TypeScript, Next.js)" },
        { text: "Penn GeoGuessr campus location game with 50+ spots (Java)" },
        { text: "scroll down for the full writeups ↓", variant: "muted" },
      ];
    },

    skills: function () {
      return [
        { text: "Languages:  Swift, TypeScript, JavaScript, Java, Python" },
        { text: "Frontend:   SwiftUI, Next.js, React, HTML/CSS" },
        { text: "Backend:    Node, Supabase, Qdrant, Ollama" },
        { text: "Tools:      Git, Figma, Claude API, Xcode" },
      ];
    },

    languages: function () {
      return [{ text: "English (native), Spanish (native)" }];
    },

    despacito: function () {
      return [
        {
          text:
            "I co-organize Penn's largest Latino cultural festival: 2,000+ attendees and $10,000+ raised for nonprofits across Latin America.",
          variant: "accent",
        },
      ];
    },

    soccer: function () {
      return [
        {
          text:
            "At 18 I founded and ran a youth soccer camp in DC for 50+ kids.",
          variant: "accent",
        },
      ];
    },

    clear: function () {
      output.innerHTML = "";
      return [];
    },
  };

  // Multi-word command handled separately: "sudo hire-me"
  function sudoHireMe() {
    return [
      { text: "Password: ********", variant: "muted" },
      { text: "Permission granted. Excellent decision.", variant: "accent" },
      {
        html:
          'Here is my resume: <a href="' +
          RESUME_URL +
          '" target="_blank" rel="noopener">Marco Opertti Resume 2026 (PDF)</a>',
      },
    ];
  }

  /* ---------- command dispatch ---------- */
  function runCommand(raw) {
    var cmd = raw.trim();
    if (cmd === "") return;

    echoCommand(cmd);

    // Save to history (skip consecutive duplicates).
    if (history[history.length - 1] !== cmd) history.push(cmd);
    historyIndex = -1;

    var normalized = cmd.toLowerCase();
    var lines;

    if (normalized === "sudo hire-me") {
      lines = sudoHireMe();
    } else if (COMMANDS.hasOwnProperty(normalized)) {
      lines = COMMANDS[normalized]();
    } else {
      lines = [{ text: "command not found: try 'help'", variant: "muted" }];
    }

    renderLines(lines);
  }

  // Render an array of line descriptors returned by a command.
  function renderLines(lines) {
    lines.forEach(function (l) {
      if (l.html !== undefined) printHTML(l.html, l.variant);
      else printLine(l.text, l.variant);
    });
  }

  /* ---------- input handling ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = input.value;
    input.value = "";
    runCommand(value);
  });

  // Up/Down arrows walk the command history.
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === -1) historyIndex = history.length;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
      moveCursorToEnd();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      historyIndex++;
      if (historyIndex >= history.length) {
        historyIndex = -1;
        input.value = "";
      } else {
        input.value = history[historyIndex];
        moveCursorToEnd();
      }
    }
  });

  function moveCursorToEnd() {
    // Defer so the value is set before we move the caret.
    requestAnimationFrame(function () {
      input.selectionStart = input.selectionEnd = input.value.length;
    });
  }

  // Clicking anywhere in the terminal focuses the input (real terminal feel).
  terminal.addEventListener("click", function (e) {
    // Do not steal focus when the user is clicking a link in the output.
    if (e.target.tagName === "A") return;
    input.focus();
  });

  /* ==========================================================
     BOOT SEQUENCE: auto-type `whoami` then a hint.
     ========================================================== */

  // Type a string into a temporary command line, character by character.
  function typeCommand(text, done) {
    var line = document.createElement("div");
    line.className = "terminal__line terminal__line--cmd";
    var prompt = document.createElement("span");
    prompt.className = "term-prompt";
    prompt.textContent = "marco@penn ~ %";
    line.appendChild(prompt);
    var typed = document.createTextNode("");
    line.appendChild(typed);
    output.appendChild(line);

    var i = 0;
    (function tick() {
      if (i <= text.length) {
        typed.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, 70);
      } else {
        scrollToBottom();
        done();
      }
    })();
  }

  function boot() {
    typeCommand("whoami", function () {
      setTimeout(function () {
        renderLines(COMMANDS.whoami());
        printLine("");
        printHTML(
          "type <span class='terminal__line--accent'>help</span> to learn more",
          "muted"
        );
        // Ready the caret without yanking the page down to the terminal.
        input.focus({ preventScroll: true });
      }, 350);
    });
  }

  // Honor reduced-motion: skip the typing animation, print instantly.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    echoCommand("whoami");
    renderLines(COMMANDS.whoami());
    printLine("");
    printHTML("type <span class='terminal__line--accent'>help</span> to learn more", "muted");
  } else {
    boot();
  }
})();

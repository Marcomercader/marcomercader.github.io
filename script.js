/* ============================================================
   Marco Opertti — portfolio behavior
   Vanilla JS, no dependencies. Features:
     - theme toggle (in-memory, no localStorage)
     - interactive terminal: typed input, history, tab-cycle,
       ghost autocomplete, blinking cursor, clickable chips,
       deep-links, neofetch card, copy-email, matrix, more
     - hero typewriter tagline
     - scroll progress bar + cursor-follow glow
     - copy-to-clipboard with toast
     - mobile nav menu
     - scroll-spy nav + staggered scroll reveal
     - project spotlight that follows the cursor
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var RESUME_URL =
    "https://github.com/Marcomercader/resume/raw/main/Marco%20Opertti%20Resume%202026.pdf";
  var EMAIL = "opertti@sas.upenn.edu";

  /* ==========================================================
     MOBILE NAV MENU
     ========================================================== */
  var nav = document.getElementById("nav");
  var menuBtn = document.getElementById("nav-menu-btn");
  var navLinksEl = document.getElementById("nav-links");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });
  navLinksEl.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setMenu(false);
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !nav.contains(e.target)) setMenu(false);
  });

  /* ==========================================================
     TOAST + CLIPBOARD
     ========================================================== */
  var toast = document.getElementById("toast");
  var toastTimer;

  function showToast(msg) {
    toast.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg><span></span>';
    toast.querySelector("span").textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("email copied: " + text);
    } catch (e) {
      showToast("email: " + text);
    }
  }

  function copyEmail() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(
        function () { showToast("email copied: " + EMAIL); },
        function () { fallbackCopy(EMAIL); }
      );
    } else {
      fallbackCopy(EMAIL);
    }
  }

  var copyBtn = document.getElementById("copy-email-btn");
  if (copyBtn) copyBtn.addEventListener("click", copyEmail);

  /* ==========================================================
     HERO TYPEWRITER TAGLINE
     ========================================================== */
  var taglineEl = document.getElementById("hero-tagline");
  var PHRASES = [
    "CS @ Penn. I like building things people actually use.",
    "From Washington DC and Montevideo, Uruguay.",
    "Currently building LHF, a native assignment tracker.",
  ];

  if (taglineEl) {
    if (reduceMotion) {
      taglineEl.textContent = PHRASES[0];
    } else {
      var typeText = document.createElement("span");
      var typeCursor = document.createElement("span");
      typeCursor.className = "type-cursor";
      taglineEl.appendChild(typeText);
      taglineEl.appendChild(typeCursor);

      var pIndex = 0;
      var cIndex = 0;
      var deleting = false;

      (function typeTick() {
        var phrase = PHRASES[pIndex];
        typeText.textContent = phrase.slice(0, cIndex);
        var delay;
        if (!deleting) {
          if (cIndex < phrase.length) {
            cIndex++;
            delay = 42 + Math.random() * 45;
          } else {
            deleting = true;
            delay = 1900;
          }
        } else {
          if (cIndex > 0) {
            cIndex--;
            delay = 22;
          } else {
            deleting = false;
            pIndex = (pIndex + 1) % PHRASES.length;
            delay = 320;
          }
        }
        setTimeout(typeTick, delay);
      })();
    }
  }

  /* ==========================================================
     TERMINAL
     ========================================================== */
  var output = document.getElementById("terminal-output");
  var form = document.getElementById("terminal-form");
  var input = document.getElementById("terminal-input");
  var terminal = document.getElementById("terminal");
  var field = document.getElementById("terminal-field");
  var typedEl = document.getElementById("term-typed");
  var ghostEl = document.getElementById("term-ghost");

  var history = [];
  var historyIndex = -1; // -1 == not browsing history

  /* ---------- output helpers ---------- */

  function printLine(text, variant) {
    var line = document.createElement("div");
    line.className = "terminal__line" + (variant ? " terminal__line--" + variant : "");
    line.textContent = text;
    output.appendChild(line);
    scrollToBottom();
    return line;
  }

  // Only ever called with trusted, hard-coded markup.
  function printHTML(html, variant) {
    var line = document.createElement("div");
    line.className = "terminal__line" + (variant ? " terminal__line--" + variant : "");
    line.innerHTML = html;
    output.appendChild(line);
    scrollToBottom();
    return line;
  }

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

  function scrollToTarget(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  /* ---------- neofetch card ---------- */
  var NEOFETCH = [
    ["  __  __  ___  ", "marco@penn"],
    [" |  \\/  |/ _ \\ ", "---------------------------------"],
    [" | |\\/| | | | |", "role:   CS @ Penn, class of 2028"],
    [" | |  | | |_| |", "from:   Washington DC / Montevideo, UY"],
    [" |_|  |_|\\___/ ", "langs:  Swift, TypeScript, Java, Python"],
    ["               ", "now:    building LHF, an assignment tracker"],
    ["               ", "off:    club soccer captain, festivals"],
    ["               ", "shell:  practical-first, ships things"],
  ];
  function neofetch() {
    return NEOFETCH.map(function (row) {
      return {
        html:
          '<span class="terminal__line--accent">' + row[0] + "</span>  " + row[1],
      };
    });
  }

  /* ---------- commands ----------
     Each returns an array of { text | html, variant } line descriptors. */

  var COMMANDS = {
    help: function () {
      return [
        { text: "Available commands:", variant: "accent" },
        { text: "  help        list all commands" },
        { text: "  whoami      short bio" },
        { text: "  neofetch    system info card" },
        { text: "  projects    what I have built (clickable)" },
        { text: "  skills      languages and tools" },
        { text: "  languages   spoken languages" },
        { text: "  contact     how to reach me" },
        { text: "  email       copy my email to clipboard" },
        { text: "  open <x>    jump to a project or section" },
        { text: "  ls          browse the site like a directory" },
        { text: "  date        today's date" },
        { text: "  history     commands you have run" },
        { text: "  clear       clear the screen" },
        { text: "" },
        { text: "  hidden gems: despacito, soccer, coffee, matrix, sudo hire-me", variant: "muted" },
        { text: "tip: press Tab to cycle completions, up/down for history.", variant: "muted" },
      ];
    },

    whoami: function () {
      var bullet = '<span class="term-bullet">▸</span>';
      return [
        { html: bullet + "I'm Marco, a CS student at Penn, originally from Montevideo, Uruguay and now based in Washington DC." },
        { html: bullet + "I like taking an idea and building it into something people actually use." },
        { html: bullet + "Right now I'm working on LHF, an assignment tracker that keeps college students from missing deadlines." },
        { html: bullet + "Outside of code I play a lot of sports (club soccer captain, ski team, and currently learning to kitesurf), plus cooking and traveling." },
      ];
    },

    neofetch: neofetch,

    projects: function () {
      return [
        { html: '<span class="term-link" data-target="project-lhf">LHF</span>             native assignment tracker for students (Swift, SwiftUI)' },
        { html: '<span class="term-link" data-target="project-monk">Monk</span>            productivity + meditation app (TypeScript, Next.js)' },
        { html: '<span class="term-link" data-target="project-geoguessr">Penn GeoGuessr</span>  campus location game, 50+ spots, hand-written w/o AI (Java)' },
        { text: "tip: click a name, or run `open <name>` to jump there.", variant: "muted" },
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

    contact: function () {
      return [
        { html: 'email:    <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>  <span class="terminal__line--muted">(run `email` to copy)</span>' },
        { html: 'github:   <a href="https://github.com/Marcomercader" target="_blank" rel="noopener">github.com/Marcomercader</a>' },
        { html: 'linkedin: <a href="https://www.linkedin.com/in/marco-opertti" target="_blank" rel="noopener">in/marco-opertti</a>' },
        { html: 'resume:   <a href="' + RESUME_URL + '" target="_blank" rel="noopener">Marco Opertti Resume 2026 (PDF)</a>' },
      ];
    },

    email: function () {
      copyEmail();
      return [{ text: EMAIL + " copied to clipboard.", variant: "accent" }];
    },

    ls: function () {
      return [
        { html: '<span class="term-link terminal__line--accent" data-target="terminal-section">about/</span>       whoami, bio, background' },
        { html: '<span class="term-link terminal__line--accent" data-target="projects">projects/</span>    LHF, Monk, Penn GeoGuessr' },
        { html: '<span class="term-link terminal__line--accent" data-target="experience">experience/</span>  work history' },
        { html: 'resume.pdf     <a href="' + RESUME_URL + '" target="_blank" rel="noopener">open</a>' },
        { text: "hint: click a folder above, or run `open <name>`.", variant: "muted" },
      ];
    },

    date: function () {
      return [{ text: new Date().toString() }];
    },

    history: function () {
      if (!history.length) return [{ text: "(no history yet)", variant: "muted" }];
      return history.map(function (h, i) {
        return { text: "  " + (i + 1) + "  " + h };
      });
    },

    pwd: function () {
      return [{ text: "/Users/marco/life/portfolio" }];
    },

    github: function () {
      return [
        { html: '<a href="https://github.com/Marcomercader" target="_blank" rel="noopener">github.com/Marcomercader</a>' },
      ];
    },

    coffee: function () {
      return [{ text: "brewing... out of beans. running on caffeine and deadlines anyway.", variant: "accent" }];
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
        { text: "At 18 I founded and ran a youth soccer camp in DC for 50+ kids.", variant: "accent" },
        { text: "These days I captain the Dolphinos, Penn's club soccer team.", variant: "accent" },
      ];
    },

    man: function () {
      return [{ text: "RTFM? nah. just type `help`.", variant: "muted" }];
    },

    clear: function () {
      output.innerHTML = "";
      return [];
    },
  };

  /* ---------- commands with arguments / side effects ---------- */

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

  function sudoOther(args) {
    var joined = args.join(" ");
    if (/rm\s+-rf/.test(joined)) {
      return [{ text: "nice try. this portfolio is load-bearing.", variant: "error" }];
    }
    return [
      { text: "[sudo] password for marco:", variant: "muted" },
      { text: "marco is not in the sudoers file. this incident will be reported.", variant: "error" },
    ];
  }

  function openCmd(args) {
    var t = (args[0] || "").toLowerCase();
    var map = {
      lhf: "project-lhf",
      monk: "project-monk",
      geoguessr: "project-geoguessr",
      "penn-geoguessr": "project-geoguessr",
      projects: "projects",
      about: "terminal-section",
      coursework: "coursework",
      experience: "experience",
      activities: "activities",
      hero: "hero",
    };
    if (t === "resume") {
      window.open(RESUME_URL, "_blank", "noopener");
      return [{ text: "opening resume PDF...", variant: "accent" }];
    }
    if (map[t]) {
      scrollToTarget(map[t]);
      return [{ text: "jumping to " + t + " ...", variant: "accent" }];
    }
    return [
      {
        text: t
          ? "open: unknown target '" + t + "'"
          : "usage: open <lhf|monk|geoguessr|projects|coursework|experience|activities|resume>",
        variant: "error",
      },
    ];
  }

  function runMatrix() {
    if (reduceMotion) {
      renderLines([{ text: "wake up, Marco... (matrix mode needs motion enabled).", variant: "accent" }]);
      return;
    }
    var chars = "01<>{}/#$*+=|アイウエオカキサシ";
    var line = printLine("", "accent");
    var frame = 0;
    var iv = setInterval(function () {
      var s = "";
      for (var i = 0; i < 34; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
      line.textContent = s;
      scrollToBottom();
      frame++;
      if (frame > 20) {
        clearInterval(iv);
        line.textContent = "Knock, knock. There is no spoon.";
      }
    }, 60);
  }

  // Names offered to Tab-completion and the ghost hint.
  var COMMAND_NAMES = Object.keys(COMMANDS)
    .concat(["sudo hire-me", "open", "echo", "matrix"])
    .sort();

  function renderLines(lines) {
    lines.forEach(function (l) {
      if (l.html !== undefined) printHTML(l.html, l.variant);
      else printLine(l.text, l.variant);
    });
  }

  /* ---------- command dispatch ---------- */
  function runCommand(raw) {
    var cmd = raw.trim();
    if (cmd === "") return;

    echoCommand(cmd);

    if (history[history.length - 1] !== cmd) history.push(cmd);
    historyIndex = -1;
    tabIndex = -1;

    var lower = cmd.toLowerCase();
    var parts = cmd.split(/\s+/);
    var name = parts[0].toLowerCase();
    var args = parts.slice(1);

    if (lower === "sudo hire-me") return renderLines(sudoHireMe());
    if (name === "matrix") return runMatrix();
    if (name === "sudo") return renderLines(sudoOther(args));
    if (name === "echo") return renderLines([{ text: args.join(" ") }]);
    if (name === "open") return renderLines(openCmd(args));
    if (COMMANDS.hasOwnProperty(name)) return renderLines(COMMANDS[name]());

    renderLines([{ text: "command not found: " + name + ". try 'help'", variant: "error" }]);
  }

  // Deep-links inside terminal output (projects/, ls folders, project names).
  output.addEventListener("click", function (e) {
    var link = e.target.closest(".term-link");
    if (link && link.getAttribute("data-target")) {
      scrollToTarget(link.getAttribute("data-target"));
    }
  });

  /* ---------- live mirror: typed text, ghost completion, cursor ---------- */

  function ghostFor(value) {
    if (!value) return "";
    var lower = value.toLowerCase();
    for (var i = 0; i < COMMAND_NAMES.length; i++) {
      var name = COMMAND_NAMES[i];
      if (name.length > value.length && name.slice(0, value.length) === lower) {
        return name.slice(value.length);
      }
    }
    return "";
  }

  function syncRender() {
    typedEl.textContent = input.value;
    ghostEl.textContent = ghostFor(input.value);
  }

  input.addEventListener("input", function () {
    tabIndex = -1;
    syncRender();
  });

  /* ---------- keyboard: history, tab-cycle ---------- */
  var tabMatches = [];
  var tabIndex = -1;

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === -1) historyIndex = history.length;
      historyIndex = Math.max(0, historyIndex - 1);
      setInput(history[historyIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      historyIndex++;
      if (historyIndex >= history.length) {
        historyIndex = -1;
        setInput("");
      } else {
        setInput(history[historyIndex]);
      }
    } else if (e.key === "Tab") {
      var val = input.value;
      // Cycle through matches if we're mid-cycle on the same completion.
      if (tabIndex >= 0 && tabMatches.length && val === tabMatches[tabIndex]) {
        e.preventDefault();
        tabIndex = (tabIndex + 1) % tabMatches.length;
        setInput(tabMatches[tabIndex]);
        return;
      }
      if (!val) return;
      var matches = COMMAND_NAMES.filter(function (n) {
        return n.toLowerCase().indexOf(val.toLowerCase()) === 0;
      });
      if (matches.length) {
        e.preventDefault();
        tabMatches = matches;
        tabIndex = 0;
        setInput(matches[0]);
      }
    }
  });

  function setInput(value) {
    input.value = value;
    syncRender();
    requestAnimationFrame(function () {
      input.selectionStart = input.selectionEnd = input.value.length;
    });
  }

  /* ---------- submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = input.value;
    setInput("");
    runCommand(value);
  });

  /* ---------- focus state for the cursor ---------- */
  input.addEventListener("focus", function () { field.classList.add("is-focused"); });
  input.addEventListener("blur", function () { field.classList.remove("is-focused"); });

  terminal.addEventListener("click", function (e) {
    if (e.target.tagName === "A" || e.target.closest(".term-link")) return;
    input.focus();
  });

  /* ---------- clickable command chips ---------- */
  var chips = document.querySelectorAll(".chip");
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener("click", function () {
      var cmd = chip.getAttribute("data-cmd");
      terminal.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      runCommand(cmd);
      input.focus({ preventScroll: true });
    });
  });

  /* ---------- global "/" shortcut: jump into the terminal ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setMenu(false); return; }
    if (e.key !== "/") return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    e.preventDefault();
    document.getElementById("terminal-section").scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    input.focus({ preventScroll: true });
  });

  /* ==========================================================
     BOOT SEQUENCE: auto-type `whoami`, print bio + hint.
     ========================================================== */
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

  function finishBoot() {
    renderLines(COMMANDS.whoami());
    printLine("");
    printHTML(
      "type <span class='terminal__line--accent'>help</span>, try <span class='terminal__line--accent'>neofetch</span>, or tap a chip below",
      "muted"
    );
    input.focus({ preventScroll: true });
  }

  if (reduceMotion) {
    echoCommand("whoami");
    finishBoot();
  } else {
    typeCommand("whoami", function () { setTimeout(finishBoot, 350); });
  }

  /* ==========================================================
     DESIGN MINOR EASTER EGG MODAL
     ========================================================== */
  var designModal = document.getElementById("design-modal");
  var designBtn = document.getElementById("design-minor-btn");

  if (designModal && designBtn) {
    var designVideo = designModal.querySelector("video");
    var designCloseBtn = designModal.querySelector(".modal__close");
    var lastFocused = null;

    var openDesignModal = function () {
      lastFocused = document.activeElement;
      designModal.hidden = false;
      body.classList.add("modal-open");
      designCloseBtn.focus();
      if (designVideo && !reduceMotion) {
        designVideo.play().catch(function () {});
      }
    };

    var closeDesignModal = function () {
      designModal.hidden = true;
      body.classList.remove("modal-open");
      if (designVideo) designVideo.pause();
      if (lastFocused) lastFocused.focus();
    };

    designBtn.addEventListener("click", openDesignModal);
    designModal.addEventListener("click", function (e) {
      if (e.target.closest("[data-close-modal]")) closeDesignModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !designModal.hidden) closeDesignModal();
    });
  }

  /* ==========================================================
     HOBBY LIGHTBOX: shows assets/hobbies/<name>.jpg if present,
     otherwise a "photos coming soon" placeholder.
     ========================================================== */
  var hobbyModal = document.getElementById("hobby-modal");
  if (hobbyModal) {
    var hobbyTitle = document.getElementById("hobby-modal-title");
    var hobbyPhoto = document.getElementById("hobby-photo");
    var hobbyFallback = document.getElementById("hobby-fallback");
    var hobbyCloseBtn = hobbyModal.querySelector(".modal__close");
    var hobbyLastFocus = null;

    var closeHobbyModal = function () {
      hobbyModal.hidden = true;
      body.classList.remove("modal-open");
      if (hobbyLastFocus) hobbyLastFocus.focus();
    };

    hobbyPhoto.addEventListener("load", function () {
      hobbyPhoto.hidden = false;
      hobbyFallback.hidden = true;
    });
    hobbyPhoto.addEventListener("error", function () {
      hobbyPhoto.hidden = true;
      hobbyFallback.hidden = false;
    });

    Array.prototype.forEach.call(document.querySelectorAll(".hobby-card"), function (card) {
      card.addEventListener("click", function () {
        var key = card.getAttribute("data-hobby");
        hobbyLastFocus = card;
        hobbyTitle.textContent = "~/hobbies/" + key;
        hobbyPhoto.hidden = true;
        hobbyFallback.hidden = false;
        hobbyPhoto.alt = card.textContent.trim() + " photo";
        hobbyPhoto.src = "assets/hobbies/" + key + ".jpg";
        hobbyModal.hidden = false;
        body.classList.add("modal-open");
        hobbyCloseBtn.focus();
      });
    });

    hobbyModal.addEventListener("click", function (e) {
      if (e.target.closest("[data-close-modal]")) closeHobbyModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !hobbyModal.hidden) closeHobbyModal();
    });
  }

  /* ==========================================================
     SCROLL PROGRESS BAR + CURSOR GLOW
     ========================================================== */
  var progressBar = document.getElementById("scroll-progress");
  var scrollQueued = false;

  function onScroll() {
    scrollQueued = false;
    var st = window.pageYOffset || root.scrollTop;
    var h = root.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.setProperty("--progress", h > 0 ? st / h : 0);
    if (st > window.innerHeight * 0.5) body.classList.add("is-scrolled");
    else body.classList.remove("is-scrolled");
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var glowQueued = false;
    var lastX = 0, lastY = 0;
    window.addEventListener("mousemove", function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!glowQueued) {
        glowQueued = true;
        requestAnimationFrame(function () {
          glowQueued = false;
          body.style.setProperty("--glow-x", lastX + "px");
          body.style.setProperty("--glow-y", lastY + "px");
        });
      }
    });
  }

  /* ==========================================================
     PROJECT SPOTLIGHT: glow follows the cursor over each card.
     ========================================================== */
  var projectCards = document.querySelectorAll(".project");
  Array.prototype.forEach.call(projectCards, function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* ==========================================================
     SCROLL-SPY: highlight the nav link for the section in view.
     ========================================================== */
  var navLinks = document.querySelectorAll(".nav__links a");
  var linkFor = {};
  Array.prototype.forEach.call(navLinks, function (a) {
    linkFor[a.getAttribute("href").slice(1)] = a;
  });
  var spyTargets = ["terminal-section", "projects", "experience", "coursework", "activities"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Array.prototype.forEach.call(navLinks, function (a) { a.classList.remove("is-active"); });
          var active = linkFor[entry.target.id];
          if (active) active.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ==========================================================
     SCROLL REVEAL: staggered fade for cards + timeline items.
     Progressive enhancement: without JS/IO they stay visible.
     ========================================================== */
  var revealItems = document.querySelectorAll(".project, .timeline__item, .activity");
  if (!reduceMotion && "IntersectionObserver" in window) {
    Array.prototype.forEach.call(revealItems, function (el, i) {
      el.style.setProperty("--reveal-delay", (i % 4) * 70 + "ms");
      el.classList.add("reveal");
    });
    var revealObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    Array.prototype.forEach.call(revealItems, function (el) { revealObs.observe(el); });
  }
})();

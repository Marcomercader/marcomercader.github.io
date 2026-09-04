/* ============================================================
   Marco Opertti portfolio behavior
   Vanilla JS, no dependencies. Features:
     - interactive terminal: typed input, history, tab-cycle,
       ghost autocomplete, clickable chips, and deep-links
   ============================================================ */

(function () {
  "use strict";

  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var RESUME_URL =
    "https://github.com/Marcomercader/resume/raw/main/Marco%20Opertti%20Resume%202026.pdf";
  var EMAIL = "marcoopertti@gmail.com";
  var PHONE = "202-320-3802";

  /* ==========================================================
     SECTION ACCORDION
     ========================================================== */
  var accordionSections = document.querySelectorAll("main > .section");

  function setAccordion(section, open) {
    if (!section || !section.classList.contains("accordion")) return;
    if (open) {
      Array.prototype.forEach.call(accordionSections, function (otherSection) {
        if (otherSection !== section && otherSection.classList.contains("is-open")) {
          setAccordion(otherSection, false);
        }
      });
    }
    var trigger = section.querySelector(".accordion__trigger");
    var content = section.querySelector(".accordion__content");
    if (!trigger || !content) return;
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    content.setAttribute("aria-hidden", open ? "false" : "true");
    content.inert = !open;
    section.classList.toggle("is-open", open);
  }

  Array.prototype.forEach.call(accordionSections, function (section) {
    var title = section.querySelector(":scope > .section__title");
    if (!title) return;

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "accordion__trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", section.id + "-content");
    trigger.innerHTML = '<span class="accordion__title">' + title.textContent + '</span><span class="accordion__mark" aria-hidden="true"></span>';

    var content = document.createElement("div");
    content.className = "accordion__content";
    content.id = section.id + "-content";
    content.setAttribute("aria-hidden", "true");
    content.inert = true;

    var inner = document.createElement("div");
    inner.className = "accordion__inner";

    while (title.nextSibling) inner.appendChild(title.nextSibling);
    content.appendChild(inner);
    title.replaceWith(trigger);
    section.appendChild(content);
    section.classList.add("accordion");

    trigger.addEventListener("click", function () {
      setAccordion(section, trigger.getAttribute("aria-expanded") !== "true");
    });
  });

  if (window.location.hash && window.location.hash !== "#hero") {
    var initialTarget = document.querySelector(window.location.hash);
    var initialSection = initialTarget && (initialTarget.classList.contains("accordion") ? initialTarget : initialTarget.closest(".accordion"));
    if (initialSection) {
      setAccordion(initialSection, true);
      setTimeout(function () {
        initialTarget.scrollIntoView({ behavior: "auto", block: "start" });
      }, 0);
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
    if (!el) return;
    var section = el.classList.contains("accordion") ? el : el.closest(".accordion");
    if (section) setAccordion(section, true);
    setTimeout(function () {
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }, reduceMotion ? 0 : 430);
  }

  /* ---------- neofetch card ---------- */
  var NEOFETCH = [
    ["  __  __  ___  ", "marco@penn"],
    [" |  \\/  |/ _ \\ ", "---------------------------------"],
    [" | |\\/| | | | |", "role:   CS @ Penn, class of 2028"],
    [" | |  | | |_| |", "from:   Washington DC / Montevideo, UY"],
    [" |_|  |_|\\___/ ", "code:   Swift, TypeScript, Java, Python"],
    ["               ", "now:    building LHF, an assignment tracker"],
    ["               ", "off:    football, cooking, travel"],
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
        { text: "  email       show contact details" },
        { text: "  open <x>    jump to a project or section" },
        { text: "  ls          browse the site like a directory" },
        { text: "  date        today's date" },
        { text: "  history     commands you have run" },
        { text: "  clear       clear the screen" },
        { text: "" },
        { text: "tip: press Tab to cycle completions, up/down for history.", variant: "muted" },
      ];
    },

    whoami: function () {
      var bullet = '<span class="term-bullet">▸</span>';
      return [
        { html: bullet + "Computer Science at Penn." },
        { html: bullet + "Building LHF, Monk, and smaller projects." },
        { html: bullet + "Interested in product design and useful software." },
      ];
    },

    neofetch: neofetch,

    projects: function () {
      return [
        { html: '<span class="term-link" data-target="project-lhf">LHF</span>             assignment tracker for students (Swift, SwiftUI)' },
        { html: '<span class="term-link" data-target="project-monk">Monk</span>            focus and meditation app (TypeScript, Next.js)' },
        { html: '<span class="term-link" data-target="project-geoguessr">Penn GeoGuessr</span>  campus location game, built solo (Java)' },
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
        { html: 'email:    <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>' },
        { html: 'phone:    <a href="tel:+12023203802">' + PHONE + '</a>' },
        { html: 'github:   <a href="https://github.com/Marcomercader" target="_blank" rel="noopener">github.com/Marcomercader</a>' },
        { html: 'linkedin: <a href="https://www.linkedin.com/in/marco-opertti" target="_blank" rel="noopener">in/marco-opertti</a>' },
        { html: 'resume:   <a href="' + RESUME_URL + '" target="_blank" rel="noopener">Marco Opertti Resume 2026 (PDF)</a>' },
      ];
    },

    email: function () {
      return [
        { html: '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a>' },
        { html: '<a href="tel:+12023203802">' + PHONE + '</a>' },
      ];
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
    .concat(["open", "echo", "matrix"])
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

  /* ==========================================================
     TERMINAL INTRO
     ========================================================== */
  function finishBoot() {
    renderLines(COMMANDS.whoami());
  }

  finishBoot();

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

})();

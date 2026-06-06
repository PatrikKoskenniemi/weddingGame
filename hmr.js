(() => {
  const FILES = [
    "engine.js",
    "roomRenderer.js",
    "spriteSystem.js",
    "gameLogic.js",
    "soundSystem.js",
    "index.html",
  ];

  const lastModified = {};

  async function check() {
    for (const file of FILES) {
      try {
        const res = await fetch(file + "?_hmr", { method: "HEAD", cache: "no-store" });
        const lm = res.headers.get("Last-Modified");
        if (lastModified[file] !== undefined && lastModified[file] !== lm) {
          console.log("[hmr] changed:", file, "— reloading");
          location.reload();
          return;
        }
        lastModified[file] = lm;
      } catch (_) {}
    }
  }

  check();
  setInterval(check, 800);

  console.log("[hmr] watching", FILES.length, "files");
})();

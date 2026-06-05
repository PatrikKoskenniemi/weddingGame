// ============================================================
// TINY WEDDING GAME – SOUND SYSTEM
// Web Audio API wrapper. Load sounds by key, play them anywhere.
// Handles browser autoplay policy by resuming context on interaction.
// ============================================================

const SoundSystem = (() => {
  let context = null;
  const buffers = {};

  function getContext() {
    if (!context) {
      context = new (window.AudioContext || window.webkitAudioContext)();
    }
    return context;
  }

  // Resume suspended context on any key press (browser autoplay policy)
  window.addEventListener("keydown", () => {
    if (context && context.state === "suspended") context.resume();
  });

  return {
    async load(key, url) {
      const ctx = getContext();
      try {
        const resp = await fetch(url + "?v=" + Date.now());
        if (!resp.ok) { console.warn("Sound not found:", url); return; }
        const arrayBuffer = await resp.arrayBuffer();
        buffers[key] = await ctx.decodeAudioData(arrayBuffer);
      } catch (e) {
        console.warn("Failed to load sound:", url, e);
      }
    },

    preloadAll(sounds) {
      return Promise.allSettled(
        Object.entries(sounds).map(([key, url]) => this.load(key, url))
      );
    },

    resume() {
      return getContext().resume().catch(() => {});
    },

    play(key, { volume = 1, loop = false, offset = 0, stopOffset = null } = {}) {
      const ctx = getContext();
      if (!buffers[key]) return null;
      if (ctx.state === "suspended") ctx.resume();

      const source = ctx.createBufferSource();
      source.buffer = buffers[key];
      source.loop = loop;

      if (volume !== 1) {
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(ctx.destination);
      } else {
        source.connect(ctx.destination);
      }

      if (stopOffset !== null) {
        source.start(0, offset, stopOffset - offset);
      } else {
        source.start(0, offset);
      }
      return source; // caller can call source.stop() to cancel looping sounds
    },
  };
})();

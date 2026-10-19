(() => {
  'use strict';
  const trigger = document.querySelector('.asterisk');
  const portrait = document.querySelector('.portrait img');
  const canvas = document.querySelector('.portrait__wave');
  const context = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  let clickVersion = 0;

  function stopWave() {
    cancelAnimationFrame(frame);
    canvas.hidden = true;
  }
  reduced.addEventListener('change', stopWave);
  trigger.addEventListener('click', async () => {
    const version = ++clickVersion;
    stopWave();
    if (reduced.matches || !context) return;
    try { await portrait.decode(); } catch { return; }
    if (version !== clickVersion || reduced.matches) return;

    const { width, height } = portrait.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    // A fine binary grid preserves the face’s silhouette throughout the diagonal sweep.
    const scale = Math.max(width / portrait.naturalWidth, height / portrait.naturalHeight);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const sourceX = (portrait.naturalWidth - sourceWidth) / 2;
    const sourceY = (portrait.naturalHeight - sourceHeight) / 2;
    const block = 5;
    const columns = Math.ceil(width / block);
    const rows = Math.ceil(height / block);
    const pixels = document.createElement('canvas');
    pixels.width = columns;
    pixels.height = rows;
    const pixelContext = pixels.getContext('2d');
    pixelContext.fillStyle = '#fff';
    pixelContext.fillRect(0, 0, columns, rows);
    pixelContext.drawImage(portrait, sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, width / block, height / block);

    const samples = pixelContext.getImageData(0, 0, columns, rows).data;
    const binary = document.createElement('canvas');
    binary.width = canvas.width;
    binary.height = canvas.height;
    const binaryContext = binary.getContext('2d');
    binaryContext.scale(ratio, ratio);
    binaryContext.fillStyle = '#fff';
    binaryContext.fillRect(0, 0, width, height);
    binaryContext.font = '600 5px monospace';
    binaryContext.textAlign = 'center';
    binaryContext.textBaseline = 'middle';
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const index = (row * columns + column) * 4;
        const shade = Math.round(samples[index] * 0.2126 + samples[index + 1] * 0.7152 + samples[index + 2] * 0.0722);
        binaryContext.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        const digit = ((column * 13 + row * 7 + column * row) % 11) % 2;
        binaryContext.fillText(String(digit), column * block + block / 2, row * block + block / 2);
      }
    }

    const started = performance.now();
    canvas.hidden = false;
    function draw(now) {
      const progress = (now - started) / 1800;
      if (progress >= 1) { stopWave(); return; }
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = false;
      const center = -0.35 + progress * 1.7;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const x = column * block;
          const y = row * block;
          const diagonal = (x + y + block) / (width + height);
          const distance = Math.abs(diagonal - center);
          const fade = Math.max(0, Math.min(1, (0.32 - distance) / 0.14));
          // Fade each binary cell in and out without moving or distorting the face.
          context.globalAlpha = fade * fade * (3 - 2 * fade);
          if (!context.globalAlpha) continue;
          context.drawImage(binary, x * ratio, y * ratio, block * ratio, block * ratio, x, y, block, block);
        }
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
  });
  const dialog = document.getElementById('hobby-modal');
  const photo = document.getElementById('hobby-photo');
  const fallback = document.getElementById('hobby-fallback');
  let lastTrigger;
  photo.addEventListener('load', () => { photo.hidden = false; fallback.hidden = true; });
  photo.addEventListener('error', () => { photo.hidden = true; fallback.hidden = false; });
  document.querySelectorAll('[data-hobby]').forEach(button => {
    button.addEventListener('click', () => {
      lastTrigger = button;
      document.getElementById('hobby-title').textContent = button.textContent;
      photo.hidden = true;
      fallback.hidden = true;
      photo.alt = `${button.textContent} photo`;
      photo.src = `assets/hobbies/${button.dataset.hobby}.jpg`;
      dialog.showModal();
    });
  });
  document.getElementById('close-hobby').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => lastTrigger?.focus());
})();

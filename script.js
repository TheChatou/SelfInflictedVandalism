const MANIFEST_SHEETS = Array.isArray(window.BOOK_SHEETS) ? window.BOOK_SHEETS : [];

const thumbs = document.getElementById('galleryThumbs');
const carouselModal = document.getElementById('carouselModal');
const carouselView = document.getElementById('carouselView');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const closeCarousel = document.getElementById('closeCarousel');
const zoomModal = document.getElementById('zoomModal');
const zoomImg = document.getElementById('zoomImg');
const closeZoom = document.getElementById('closeZoom');

let sheets = MANIFEST_SHEETS;
let current = 0;
let zoomState = { scale: 1, x: 0, y: 0 };
let panning = false;
let startX = 0;
let startY = 0;
let activePointers = new Map();
let pinchState = null;

function setCarouselImage() {
  carouselView.innerHTML = '';
  const img = document.createElement('img');
  const sheet = sheets[current];
  img.src = sheet.full;
  img.alt = sheet.name || `Planche ${current + 1}`;
  img.loading = 'eager';
  img.decoding = 'async';
  img.addEventListener('click', () => openZoom(sheet.full));
  carouselView.appendChild(img);
}

function renderThumbs() {
  thumbs.innerHTML = '';
  sheets.forEach((sheet, i) => {
    const button = document.createElement('button');
    button.className = 'thumb';
    button.style.border = 'none';
    button.style.padding = '0';

    const img = document.createElement('img');
    img.src = sheet.thumb;
    img.alt = sheet.name || `Planche ${i + 1}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('click', () => openCarousel(i));

    button.appendChild(img);
    thumbs.appendChild(button);
  });
}

function openCarousel(index) {
  current = index;
  setCarouselImage();
  carouselModal.classList.remove('hidden');
  carouselModal.setAttribute('aria-hidden', 'false');
}

function closeCarouselFn() {
  carouselModal.classList.add('hidden');
  carouselModal.setAttribute('aria-hidden', 'true');
}

function openZoom(src) {
  closeCarouselFn();
  zoomImg.src = src;
  zoomState = { scale: 1, x: 0, y: 0 };
  activePointers = new Map();
  pinchState = null;
  renderZoomTransform();
  zoomModal.classList.remove('hidden');
}

function closeZoomFn() {
  zoomModal.classList.add('hidden');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function renderZoomTransform() {
  zoomImg.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
}

function loadImagesFallback() {
  sheets = [];
  thumbs.innerHTML = '<p class="empty">Aucune planche trouvée dans <code>images/Siv</code>.</p>';
}

function init() {
  if (!sheets.length) {
    loadImagesFallback();
    return;
  }

  renderThumbs();
  setCarouselImage();
}

prevBtn.addEventListener('click', () => {
  current = (current - 1 + sheets.length) % sheets.length;
  setCarouselImage();
});
nextBtn.addEventListener('click', () => {
  current = (current + 1) % sheets.length;
  setCarouselImage();
});
closeCarousel.addEventListener('click', closeCarouselFn);
closeZoom.addEventListener('click', closeZoomFn);

function updateZoomFromPointers() {
  if (activePointers.size < 2 || !pinchState) return;
  const pts = Array.from(activePointers.values());
  const [a, b] = pts;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;

  zoomState.scale = clamp(pinchState.scale * (dist / pinchState.dist), 1, 6);
  zoomState.x = pinchState.x + (midX - pinchState.midX);
  zoomState.y = pinchState.y + (midY - pinchState.midY);
  renderZoomTransform();
}

zoomImg.addEventListener('pointerdown', (e) => {
  zoomImg.setPointerCapture(e.pointerId);
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (activePointers.size === 1) {
    panning = true;
    startX = e.clientX;
    startY = e.clientY;
    pinchState = null;
  }
  if (activePointers.size === 2) {
    const pts = Array.from(activePointers.values());
    const [a, b] = pts;
    pinchState = {
      dist: Math.hypot(b.x - a.x, b.y - a.y) || 1,
      scale: zoomState.scale,
      x: zoomState.x,
      y: zoomState.y,
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
    };
    panning = false;
  }
});

zoomImg.addEventListener('pointermove', (e) => {
  if (!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (activePointers.size === 2 && pinchState) {
    updateZoomFromPointers();
    return;
  }
  if (!panning || activePointers.size !== 1) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  zoomState.x += dx;
  zoomState.y += dy;
  startX = e.clientX;
  startY = e.clientY;
  renderZoomTransform();
});

zoomImg.addEventListener('pointerup', (e) => {
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) pinchState = null;
  if (activePointers.size === 0) panning = false;
  try {
    zoomImg.releasePointerCapture(e.pointerId);
  } catch (_) {
    // noop
  }
});

zoomImg.addEventListener('pointercancel', (e) => {
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) pinchState = null;
  if (activePointers.size === 0) panning = false;
});

zoomImg.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = -e.deltaY * 0.0012;
  zoomState.scale = clamp(zoomState.scale + delta, 1, 6);
  renderZoomTransform();
}, { passive: false });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!carouselModal.classList.contains('hidden')) closeCarouselFn();
    if (!zoomModal.classList.contains('hidden')) closeZoomFn();
  }
  if (e.key === 'ArrowRight' && !carouselModal.classList.contains('hidden')) nextBtn.click();
  if (e.key === 'ArrowLeft' && !carouselModal.classList.contains('hidden')) prevBtn.click();
});

/* Portrait lock: try Screen Orientation API only (no transform fallback) */
async function enforcePortraitLock() {
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('portrait');
      return;
    }
  } catch (e) {
    // not available / not allowed
  }
}

init();
enforcePortraitLock();

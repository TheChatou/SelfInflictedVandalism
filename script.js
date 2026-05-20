const MANIFEST_IMAGES = Array.isArray(window.BOOK_IMAGES) ? window.BOOK_IMAGES : [];

const thumbs = document.getElementById('galleryThumbs');
const modeThumb = document.getElementById('modeThumb');
const modeFull = document.getElementById('modeFull');
const carouselModal = document.getElementById('carouselModal');
const carouselView = document.getElementById('carouselView');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const closeCarousel = document.getElementById('closeCarousel');
const zoomModal = document.getElementById('zoomModal');
const zoomImg = document.getElementById('zoomImg');
const closeZoom = document.getElementById('closeZoom');
const flipHBtn = document.getElementById('flipH');
const flipVBtn = document.getElementById('flipV');
const app = document.getElementById('app');

let images = MANIFEST_IMAGES;
let current = 0;
let flipH = false;
let flipV = false;
let zoomState = { scale: 1, x: 0, y: 0 };
let panning = false;
let startX = 0;
let startY = 0;

function setCarouselImage() {
  carouselView.innerHTML = '';
  const img = document.createElement('img');
  img.src = images[current];
  img.alt = `Planche ${current + 1}`;
  img.addEventListener('dblclick', () => openZoom(images[current]));
  applyFlipToElement(img);
  carouselView.appendChild(img);
}

function renderThumbs() {
  thumbs.innerHTML = '';
  images.forEach((src, i) => {
    const button = document.createElement('button');
    button.className = 'thumb';
    button.style.border = 'none';
    button.style.padding = '0';

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Planche ${i + 1}`;
    img.loading = 'lazy';
    img.addEventListener('click', () => openCarousel(i));
    img.addEventListener('dblclick', () => openZoom(src));

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
  zoomImg.src = src;
  zoomState = { scale: 1, x: 0, y: 0 };
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
  const sx = flipH ? -1 : 1;
  const sy = flipV ? -1 : 1;
  zoomImg.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${sx * zoomState.scale}, ${sy * zoomState.scale})`;
}

function applyFlipToElement(el) {
  const sx = flipH ? -1 : 1;
  const sy = flipV ? -1 : 1;
  if (el === zoomImg) {
    renderZoomTransform();
    return;
  }
  el.style.transform = `scale(${sx}, ${sy})`;
}

function applyCurrentFlip() {
  const cimg = carouselView.querySelector('img');
  if (cimg) applyFlipToElement(cimg);
  if (!zoomModal.classList.contains('hidden')) renderZoomTransform();
}

function toggleFlipH() {
  flipH = !flipH;
  updateFlipUI();
  applyCurrentFlip();
}

function toggleFlipV() {
  flipV = !flipV;
  updateFlipUI();
  applyCurrentFlip();
}

function updateFlipUI() {
  flipHBtn.dataset.on = flipH ? '1' : '0';
  flipVBtn.dataset.on = flipV ? '1' : '0';
}

function loadImagesFallback() {
  images = [];
  thumbs.innerHTML = '<p class="empty">Aucune planche trouvée dans <code>images/Siv</code>.</p>';
}

function init() {
  if (!images.length) {
    loadImagesFallback();
    return;
  }

  renderThumbs();
  setCarouselImage();
  updateFlipUI();
}

prevBtn.addEventListener('click', () => {
  current = (current - 1 + images.length) % images.length;
  setCarouselImage();
});
nextBtn.addEventListener('click', () => {
  current = (current + 1) % images.length;
  setCarouselImage();
});
closeCarousel.addEventListener('click', closeCarouselFn);
closeZoom.addEventListener('click', closeZoomFn);
flipHBtn.addEventListener('click', toggleFlipH);
flipVBtn.addEventListener('click', toggleFlipV);

zoomImg.addEventListener('pointerdown', (e) => {
  panning = true;
  zoomImg.setPointerCapture(e.pointerId);
  startX = e.clientX;
  startY = e.clientY;
});

zoomImg.addEventListener('pointermove', (e) => {
  if (!panning) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  zoomState.x += dx;
  zoomState.y += dy;
  startX = e.clientX;
  startY = e.clientY;
  renderZoomTransform();
});

zoomImg.addEventListener('pointerup', (e) => {
  panning = false;
  try {
    zoomImg.releasePointerCapture(e.pointerId);
  } catch (_) {
    // noop
  }
});

zoomImg.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = -e.deltaY * 0.0012;
  zoomState.scale = clamp(zoomState.scale + delta, 1, 6);
  renderZoomTransform();
}, { passive: false });

modeThumb.addEventListener('click', () => {
  document.getElementById('galleryThumbs').scrollIntoView({ behavior: 'smooth' });
});
modeFull.addEventListener('click', () => openCarousel(0));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!carouselModal.classList.contains('hidden')) closeCarouselFn();
    if (!zoomModal.classList.contains('hidden')) closeZoomFn();
  }
  if (e.key === 'ArrowRight' && !carouselModal.classList.contains('hidden')) nextBtn.click();
  if (e.key === 'ArrowLeft' && !carouselModal.classList.contains('hidden')) prevBtn.click();
  if (e.key === 'h' || e.key === 'H') toggleFlipH();
  if (e.key === 'v' || e.key === 'V') toggleFlipV();
});

/* Portrait lock: try Screen Orientation API, fallback to visual rotate/scale */
async function enforcePortraitLock() {
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('portrait');
      return;
    }
  } catch (e) {
    // not available / not allowed
  }

  document.documentElement.classList.add('force-portrait');
  applyPortraitTransform();
  window.addEventListener('resize', applyPortraitTransform);
  window.addEventListener('orientationchange', applyPortraitTransform);
}

function applyPortraitTransform() {
  if (!app) return;
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (w > h) {
    const scale = h / w;
    app.style.transform = `translate(-50%, -50%) rotate(90deg) scale(${scale})`;
    app.style.transformOrigin = 'center center';
    app.style.position = 'fixed';
    app.style.left = '50%';
    app.style.top = '50%';
  } else {
    app.style.transform = '';
    app.style.transformOrigin = '';
    app.style.position = '';
    app.style.left = '';
    app.style.top = '';
  }
}

init();
enforcePortraitLock();

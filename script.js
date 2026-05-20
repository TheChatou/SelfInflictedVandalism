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

let images = MANIFEST_IMAGES;
let current = 0;
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
  zoomImg.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
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

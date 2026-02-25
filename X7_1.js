/* ===========================
   PL PAINTER — X7.js
   Desktop + Mobile support
   =========================== */

const canvas        = document.getElementById('canvas');
const ctx           = canvas.getContext('2d');
const toolSelect    = document.getElementById('tool');
const brushSize     = document.getElementById('brushSize');
const clearBtn      = document.getElementById('clearBtn');
const saveBtn       = document.getElementById('saveBtn');
const colorPalette  = document.getElementById('colorPalette');
const colorOptions  = document.querySelectorAll('.color');
const activeSwatch  = document.getElementById('activeColorSwatch');
const activeLabel   = document.getElementById('activeColorLabel');

/* ── State ── */
let drawing      = false;
let currentTool  = 'brush';
let currentColor = 'black';

/* ── Responsive canvas size ── */
function resizeCanvas() {
  // Preserve existing drawing
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const maxW = Math.min(500, window.innerWidth - 80);  // leave room for palette + padding
  const ratio = 400 / 500;
  canvas.width  = maxW;
  canvas.height = Math.round(maxW * ratio);

  ctx.putImageData(imageData, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* ── Helpers ── */
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  // Touch or mouse
  const src = e.touches ? e.touches[0] : e;
  return {
    x: src.clientX - rect.left,
    y: src.clientY - rect.top
  };
}

function drawAt(x, y) {
  const size = parseInt(brushSize.value, 10);
  const half = size / 2;

  if (currentTool === 'brush') {
    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(x, y, half, 0, Math.PI * 2);
    ctx.fill();
  } else if (currentTool === 'eraser') {
    ctx.clearRect(x - half, y - half, size, size);
  }
}

function fillCanvas() {
  ctx.fillStyle = currentColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/* ── Mouse Events ── */
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  if (currentTool === 'fill') {
    fillCanvas();
    drawing = false;
    return;
  }
  const { x, y } = getPos(e);
  drawAt(x, y);
});

canvas.addEventListener('mouseup',  () => { drawing = false; });
canvas.addEventListener('mouseout', () => { drawing = false; });

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const { x, y } = getPos(e);
  drawAt(x, y);
});

/* ── Touch Events (mobile) ── */
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();                  // stop page scroll
  drawing = true;
  if (currentTool === 'fill') {
    fillCanvas();
    drawing = false;
    return;
  }
  const { x, y } = getPos(e);
  drawAt(x, y);
}, { passive: false });

canvas.addEventListener('touchend',  (e) => {
  e.preventDefault();
  drawing = false;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!drawing) return;
  const { x, y } = getPos(e);
  drawAt(x, y);
}, { passive: false });

/* ── Tool selector ── */
toolSelect.addEventListener('change', () => {
  currentTool = toolSelect.value;
  updatePaletteVisibility();
});

/* ── Clear ── */
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

/* ── Save / Download ── */
saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'painting.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

/* ── Color selection ── */
colorOptions.forEach(colorDiv => {
  colorDiv.addEventListener('click', () => {
    currentColor = colorDiv.getAttribute('data-color');

    // Update visual indicator
    activeSwatch.style.backgroundColor = currentColor;
    activeLabel.textContent = currentColor;

    // Highlight selected swatch
    colorOptions.forEach(d => d.classList.remove('selected'));
    colorDiv.classList.add('selected');
  });
});

// Set initial selection state
colorOptions[0].classList.add('selected');

/* ── Palette visibility ── */
function updatePaletteVisibility() {
  if (currentTool === 'brush' || currentTool === 'fill') {
    colorPalette.classList.remove('hidden');
  } else {
    colorPalette.classList.add('hidden');
  }
}

updatePaletteVisibility();

// js/app.js

// === STATE ===
const state = {
  step: 0, // 0=home, 1-6=wizard, 7=cart, 8=congrats
  selections: { ears: null, tail: null, eyes: null, toofs: null, legs: null, coat: null }
};

// === CATEGORY ORDER (matches STEPS array in data.js) ===
const CATEGORY_ORDER = ['ears', 'tail', 'eyes', 'toofs', 'legs', 'coat'];

// === SVG CACHE ===
let dogSVGContent = null;

async function loadDogSVG() {
  if (dogSVGContent) return dogSVGContent;
  const res = await fetch('assets/dog.svg');
  dogSVGContent = await res.text();
  return dogSVGContent;
}

// === NAVIGATION ===
function navigate(step) {
  state.step = step;
  renderView();
}

function navigateBack() {
  if (state.step > 1) navigate(state.step - 1);
  else navigate(0);
}

function navigateNext() {
  if (state.step >= 1 && state.step <= 6) {
    if (state.step === 6) navigate(7); // go to cart after last step
    else navigate(state.step + 1);
  }
}

function resetAndGoHome() {
  state.selections = { ears: null, tail: null, eyes: null, toofs: null, legs: null, coat: null };
  navigate(0);
}

// === VIEW RENDERING ===
function renderView() {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  if (state.step === 0) {
    document.getElementById('view-home').classList.add('active');
  } else if (state.step >= 1 && state.step <= 6) {
    document.getElementById('view-wizard').classList.add('active');
    renderWizardStep(state.step);
  } else if (state.step === 7) {
    document.getElementById('view-cart').classList.add('active');
    renderCart();
  } else if (state.step === 8) {
    document.getElementById('view-congrats').classList.add('active');
    renderCongrats();
  }
}

// === WIZARD STEP RENDERING ===
async function renderWizardStep(stepNum) {
  const stepIndex = stepNum - 1;
  const stepData = STEPS[stepIndex];
  const category = CATEGORY_ORDER[stepIndex];

  // Step title
  document.getElementById('step-title').textContent = stepData.title;
  document.getElementById('step-subtitle').textContent = stepData.subtitle;

  // Back button label
  document.getElementById('btn-back').textContent = stepNum === 1 ? '← Home' : '← Back';

  // Next button label
  document.getElementById('btn-next').textContent = stepNum === 6 ? 'Review Cart →' : 'Next →';

  // Progress bar
  renderProgressBar(stepNum);

  // Product cards
  const products = PRODUCTS.filter(p => p.category === category);
  const grid = document.getElementById('product-grid');
  grid.innerHTML = products.map(p => `
    <div class="product-card ${state.selections[category] === p.id ? 'selected' : ''}"
         onclick="selectProduct('${p.id}')">
      <div class="product-emoji">${p.emoji}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.description}</div>
      <div class="product-price">$${p.price.toFixed(2)}</div>
    </div>
  `).join('');

  // Dog preview
  await renderDogPreview('dog-preview');
}

function renderProgressBar(currentStep) {
  const PAW_STEPS = ['🐾', '🐾', '🐾', '🐾', '🐾', '🐾'];
  const bar = document.getElementById('progress-bar');
  let html = '';
  for (let i = 1; i <= 6; i++) {
    const category = CATEGORY_ORDER[i - 1];
    const isDone = state.selections[category] !== null;
    const isActive = i === currentStep;
    const cls = isActive ? 'active' : isDone ? 'completed' : '';
    html += `<div class="progress-step ${cls}">${PAW_STEPS[i-1]}</div>`;
    if (i < 6) {
      html += `<div class="progress-connector ${isDone && !isActive ? 'filled' : ''}"></div>`;
    }
  }
  bar.innerHTML = html;
}

// === PRODUCT SELECTION ===
function selectProduct(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  state.selections[product.category] = productId;
  renderWizardStep(state.step);
}

// === DOG PREVIEW ===
async function renderDogPreview(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const svgContent = await loadDogSVG();
  container.innerHTML = svgContent;

  updateDogLayers(container);
}

function updateDogLayers(container) {
  if (!container) return;

  // Show/hide SVG layers based on selections
  const layerCategories = ['ears', 'tail', 'eyes', 'toofs', 'legs', 'coat'];
  const optionsByCategory = {
    ears:  ['ears-floppy', 'ears-radar', 'ears-satellite'],
    tail:  ['tail-bushy', 'tail-stub', 'tail-wag'],
    eyes:  ['eyes-puppy', 'eyes-human', 'eyes-anime'],
    toofs: ['toofs-none', 'toofs-buck', 'toofs-vampire'],
    legs:  ['legs-outstretched', 'legs-zoomies', 'legs-derp'],
    coat:  ['coat-golden', 'coat-spotty', 'coat-midnight', 'coat-silver'],
  };

  layerCategories.forEach(cat => {
    const selectedId = state.selections[cat];
    const selectedProduct = selectedId ? PRODUCTS.find(p => p.id === selectedId) : null;

    optionsByCategory[cat].forEach(layerId => {
      const el = container.querySelector(`#${layerId}`);
      if (el) {
        el.classList.remove('visible');
      }
    });

    if (selectedProduct) {
      const el = container.querySelector(`#${selectedProduct.svgLayer}`);
      if (el) el.classList.add('visible');
    }

    // Handle coat color via CSS custom property on the SVG root
    if (cat === 'coat' && selectedProduct && selectedProduct.furColor) {
      const svg = container.querySelector('svg');
      if (svg) svg.style.setProperty('--fur-color', selectedProduct.furColor);
    }
  });
}

// === CART RENDERING ===
function renderCart() {
  const itemsContainer = document.getElementById('cart-items');
  const totalContainer = document.getElementById('cart-total');

  let total = 0;
  let html = '';

  CATEGORY_ORDER.forEach(cat => {
    const selectedId = state.selections[cat];
    const product = selectedId ? PRODUCTS.find(p => p.id === selectedId) : null;
    if (product) {
      total += product.price;
      html += `
        <div class="cart-item">
          <div class="cart-item-emoji">${product.emoji}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-desc">${product.description}</div>
          </div>
          <div class="cart-item-price">$${product.price.toFixed(2)}</div>
        </div>
      `;
    } else {
      const stepName = STEPS[CATEGORY_ORDER.indexOf(cat)].id;
      html += `<div class="cart-empty-slot">No ${stepName} selected — living dangerously.</div>`;
    }
  });

  itemsContainer.innerHTML = html;
  totalContainer.innerHTML = `Total: <span style="color: var(--peach)">$${total.toFixed(2)}</span>`;
}

// === CONGRATS RENDERING ===
async function renderCongrats() {
  await renderDogPreview('congrats-dog');

  // Build personalized message
  const traits = [];
  if (state.selections.ears) {
    const p = PRODUCTS.find(p => p.id === state.selections.ears);
    traits.push(p.name.toLowerCase().replace(/\s+/g, '-'));
  }
  if (state.selections.tail) {
    const p = PRODUCTS.find(p => p.id === state.selections.tail);
    traits.push(p.name.toLowerCase().replace(/\s+/g, '-'));
  }
  if (state.selections.coat) {
    const p = PRODUCTS.find(p => p.id === state.selections.coat);
    traits.push(p.name.toLowerCase());
  }

  const traitStr = traits.length > 0
    ? `a ${traits.join(', ')} `
    : 'a mystery ';

  document.getElementById('congrats-message').innerHTML =
    `You've assembled ${traitStr}<strong>GOOD BOI</strong>! 🐾<br>
     They are already waiting by the door.`;

  // Confetti
  spawnConfetti();
}

function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#FFB347', '#7EC8A4', '#B39DDB', '#FF7F7F', '#FFD700', '#87CEEB'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (8 + Math.random() * 10) + 'px';
    piece.style.height = (10 + Math.random() * 12) + 'px';
    piece.style.animationDuration = (2 + Math.random() * 3) + 's';
    piece.style.animationDelay = (Math.random() * 2) + 's';
    container.appendChild(piece);
  }
}

// === INIT ===
renderView();

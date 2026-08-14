// 1. Native <number-flow> Web Component implementation
class NativeNumberFlow extends HTMLElement {
  constructor() {
    super();
    this._value = 0;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          font-variant-numeric: tabular-nums;
          overflow: hidden;
          height: 1.2em;
          line-height: 1.2em;
          vertical-align: middle;
        }
        .digit-col {
          display: inline-flex;
          flex-direction: column;
          /* Duration increased to 0.8s for a slower, smoother roll */
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          height: 1.2em;
        }
        .digit-item {
          height: 1.2em;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .symbol {
          display: inline-flex;
          align-items: center;
          height: 1.2em;
        }
      </style>
      <div id="container" style="display: inline-flex; align-items: center; height: 1.2em;"></div>
    `;
  }

  set value(val) {
    const numVal = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(numVal)) return;
    this._value = numVal;
    this.render();
  }

  get value() {
    return this._value;
  }

  render() {
    const str = this._value.toFixed(2);
    const container = this.shadowRoot.getElementById('container');
    
    if (container.children.length !== str.length) {
      container.innerHTML = '';
      for (let char of str) {
        if (/\d/.test(char)) {
          const col = document.createElement('div');
          col.className = 'digit-col';
          for (let i = 0; i <= 9; i++) {
            const item = document.createElement('div');
            item.className = 'digit-item';
            item.textContent = i;
            col.appendChild(item);
          }
          container.appendChild(col);
        } else {
          const sym = document.createElement('div');
          sym.className = 'symbol';
          sym.textContent = char;
          container.appendChild(sym);
        }
      }
    }

    const children = container.children;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const child = children[i];
      if (/\d/.test(char)) {
        const digit = parseInt(char, 10);
        child.style.transform = `translateY(-${digit * 1.2}em)`;
      }
    }
  }
}

if (!customElements.get('number-flow')) {
  customElements.define('number-flow', NativeNumberFlow);
}

// 2. Pricing Logic & Smooth Border Fading
const PRICING = {
  starterMonth: 9.99,
  starterAnnual: 7.49,
  proMonth: 19.99,
  proAnnual: 17.49,
};

let activeIndex = 0;
let periodIndex = 0;

const btnMonthly = document.getElementById('btn-monthly');
const btnYearly = document.getElementById('btn-yearly');
const periodIndicator = document.getElementById('period-indicator');
const activeCardOutline = document.getElementById('active-card-outline');
const planCards = document.querySelectorAll('.plan-card');

const starterFlow = document.getElementById('starter-flow');
const proFlow = document.getElementById('pro-flow');

// Initial Setup
starterFlow.value = PRICING.starterMonth;
proFlow.value = PRICING.proMonth;

function setPeriod(index) {
  periodIndex = index;
  periodIndicator.style.transform = `translateX(${periodIndex * 100}%)`;

  const newStarter = periodIndex === 0 ? PRICING.starterMonth : PRICING.starterAnnual;
  const newPro = periodIndex === 0 ? PRICING.proMonth : PRICING.proAnnual;

  starterFlow.value = newStarter;
  proFlow.value = newPro;
}

function setActivePlan(index) {
  activeIndex = index;

  // Move black outline indicator
  activeCardOutline.style.transform = `translateY(${activeIndex * 88 + 12 * activeIndex}px)`;

  // Fade gray border in and out smoothly
  planCards.forEach((card, idx) => {
    const border = card.querySelector('.radio-border');
    const dot = card.querySelector('.radio-dot');

    if (idx === activeIndex) {
      card.style.borderColor = 'transparent';
      border.style.borderColor = '#000';
      dot.style.opacity = '1';
    } else {
      card.style.borderColor = '#9ca3af';
      border.style.borderColor = '#64748b';
      dot.style.opacity = '0';
    }
  });
}

btnMonthly.addEventListener('click', () => setPeriod(0));
btnYearly.addEventListener('click', () => setPeriod(1));

planCards.forEach((card) => {
  card.addEventListener('click', () => {
    const index = parseInt(card.getAttribute('data-index'), 10);
    setActivePlan(index);
  });
});

// 3. Initial Loading Screen, Blur Reveal & Animated Gradient Background
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const gradientContainer = document.getElementById('background-gradient-container');
const gradientElement = document.getElementById('background-gradient');

// Animated Gradient Background Configuration (White base with grey & light-grey edges)
const GRADIENT_CONFIG = {
  startingGap: 125,
  breathing: true,
  gradientColors: [
    "#ffffff", // 35% - Center white
    "#ffffff", // 50% - Inner white
    "#f1f5f9", // 60% - Very soft light slate grey
    "#e2e8f0", // 70% - Light grey
    "#cbd5e1", // 80% - Mid light grey
    "#94a3b8", // 90% - Soft grey edge
    "#64748b"  // 100% - Outer grey perimeter
  ],
  gradientStops: [35, 50, 60, 70, 80, 90, 100],
  animationSpeed: 0.03,
  breathingRange: 6,
  topOffset: 0
};

function startGradientAnimation() {
  if (!gradientElement) return;

  let width = GRADIENT_CONFIG.startingGap;
  let directionWidth = 1;
  let animationFrameId;

  const gradientStopsString = GRADIENT_CONFIG.gradientStops
    .map((stop, index) => `${GRADIENT_CONFIG.gradientColors[index]} ${stop}%`)
    .join(", ");

  const animate = () => {
    if (width >= GRADIENT_CONFIG.startingGap + GRADIENT_CONFIG.breathingRange) {
      directionWidth = -1;
    }
    if (width <= GRADIENT_CONFIG.startingGap - GRADIENT_CONFIG.breathingRange) {
      directionWidth = 1;
    }

    if (!GRADIENT_CONFIG.breathing) {
      directionWidth = 0;
    }

    width += directionWidth * GRADIENT_CONFIG.animationSpeed;

    const radialGradient = `radial-gradient(${width}% ${width + GRADIENT_CONFIG.topOffset}% at 50% 20%, ${gradientStopsString})`;
    gradientElement.style.background = radialGradient;

    animationFrameId = requestAnimationFrame(animate);
  };

  // Set initial gradient style and start loop
  gradientElement.style.background = `radial-gradient(${width}% ${width + GRADIENT_CONFIG.topOffset}% at 50% 20%, ${gradientStopsString})`;
  animationFrameId = requestAnimationFrame(animate);
}

if (loadingScreen && mainContent) {
  const LOADING_DURATION_MS = 3000;

  const startLoaderTimer = () => {
    setTimeout(() => {
      // 1. Initiate smooth fade-out and un-blur
      loadingScreen.classList.add('loader-hidden');
      mainContent.classList.remove('content-blurred');

      // 2. Start Animated Background entrance animation & breathing
      if (gradientContainer) {
        gradientContainer.classList.add('gradient-active');
        startGradientAnimation();
      }

      // 3. Clean up loading screen after CSS transition ends
      const handleTransitionEnd = (e) => {
        if (e.target === loadingScreen && (e.propertyName === 'opacity' || e.propertyName === 'backdrop-filter')) {
          loadingScreen.style.display = 'none';
          loadingScreen.removeEventListener('transitionend', handleTransitionEnd);
        }
      };
      loadingScreen.addEventListener('transitionend', handleTransitionEnd);

      // Safety fallback in case transitionend event is skipped
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 1000);
    }, LOADING_DURATION_MS);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoaderTimer);
  } else {
    startLoaderTimer();
  }
}
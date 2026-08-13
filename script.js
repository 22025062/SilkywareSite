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
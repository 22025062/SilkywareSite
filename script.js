// Pricing Configuration (Matching Demo props)
const PRICING = {
  starterMonth: 9.99,
  starterAnnual: 7.49,
  proMonth: 19.99,
  proAnnual: 17.49,
};

// State Variables
let activeIndex = 0;
let periodIndex = 0; // 0 = Monthly, 1 = Yearly

// Elements
const btnMonthly = document.getElementById('btn-monthly');
const btnYearly = document.getElementById('btn-yearly');
const periodIndicator = document.getElementById('period-indicator');
const activeCardOutline = document.getElementById('active-card-outline');
const planCards = document.querySelectorAll('.plan-card');
const starterPriceEl = document.getElementById('starter-price');
const proPriceEl = document.getElementById('pro-price');

// Helper function to simulate react's NumberFlow smoothly
function animateValue(element, start, end, duration = 300) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = start + (end - start) * progress;
    element.textContent = currentValue.toFixed(2);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Update period state
function setPeriod(index) {
  periodIndex = index;
  
  // Slide period background tab
  periodIndicator.style.transform = `translateX(${periodIndex * 100}%)`;

  // Calculate new prices
  const newStarter = periodIndex === 0 ? PRICING.starterMonth : PRICING.starterAnnual;
  const newPro = periodIndex === 0 ? PRICING.proMonth : PRICING.proAnnual;

  const currentStarter = parseFloat(starterPriceEl.textContent);
  const currentPro = parseFloat(proPriceEl.textContent);

  // Smoothly transition the price numbers
  animateValue(starterPriceEl, currentStarter, newStarter);
  animateValue(proPriceEl, currentPro, newPro);
}

// Update selected plan state
function setActivePlan(index) {
  activeIndex = index;

  // Move outline indicator
  // Card height is 88px, gap is 12px
  activeCardOutline.style.transform = `translateY(${activeIndex * 88 + 12 * activeIndex}px)`;

  // Update selection radio styling
  planCards.forEach((card, idx) => {
    const border = card.querySelector('.radio-border');
    const dot = card.querySelector('.radio-dot');

    if (idx === activeIndex) {
      border.style.borderColor = '#000';
      dot.style.opacity = '1';
    } else {
      border.style.borderColor = '#64748b';
      dot.style.opacity = '0';
    }
  });
}

// Event Listeners
btnMonthly.addEventListener('click', () => setPeriod(0));
btnYearly.addEventListener('click', () => setPeriod(1));

planCards.forEach((card) => {
  card.addEventListener('click', () => {
    const index = parseInt(card.getAttribute('data-index'), 10);
    setActivePlan(index);
  });
});
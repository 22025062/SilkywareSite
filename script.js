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

// Configure formatting options
const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

// Initialize initial JS numeric properties
starterFlow.format = formatOptions;
proFlow.format = formatOptions;

starterFlow.value = PRICING.starterMonth;
proFlow.value = PRICING.proMonth;

function setPeriod(index) {
  periodIndex = index;
  periodIndicator.style.transform = `translateX(${periodIndex * 100}%)`;

  const newStarter = periodIndex === 0 ? PRICING.starterMonth : PRICING.starterAnnual;
  const newPro = periodIndex === 0 ? PRICING.proMonth : PRICING.proAnnual;

  // KEY FIX: Assigning to the numeric .value property (NOT setAttribute)
  // triggers NumberFlow's smooth spring & digit roll animation!
  starterFlow.value = newStarter;
  proFlow.value = newPro;
}

function setActivePlan(index) {
  activeIndex = index;

  activeCardOutline.style.transform = `translateY(${activeIndex * 88 + 12 * activeIndex}px)`;

  planCards.forEach((card, idx) => {
    const border = card.querySelector('.radio-border');
    const dot = card.querySelector('.radio-dot');

    if (idx === activeIndex) {
      card.classList.remove('border-gray-400');
      card.classList.add('border-transparent');
      border.style.borderColor = '#000';
      dot.style.opacity = '1';
    } else {
      card.classList.remove('border-transparent');
      card.classList.add('border-gray-400');
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
const section = document.getElementById('scrollSection');
const title = document.getElementById('scrollTitle');
const card = document.getElementById('cardWrapper');
const hint = document.getElementById('scrollHint');
const isMobile = () => window.innerWidth <= 768;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

function update() {
  const rect = section.getBoundingClientRect();
  const total = section.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;
  const p = clamp(scrolled / total, 0, 1);

  const [scaleStart, scaleEnd] = isMobile() ? [0.7, 0.9] : [1.05, 1];
  const rotate = lerp(20, 0, p);
  const scale = lerp(scaleStart, scaleEnd, p);
  const titleY = lerp(0, -100, p);

  card.style.transform = `rotateX(${rotate}deg) scale(${scale})`;
  title.style.transform = `translateY(${titleY}px)`;
  hint.style.opacity = p < 0.08 ? 1 : 0;
}

window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update, { passive: true });
update();

// Dock smooth magnification
const dockPanel = document.getElementById('dockPanel');
const dockItems = Array.from(dockPanel.querySelectorAll('.dock-item'));
const BASE = 42, PEAK = 68, NEIGHBOR = 54, DISTANCE = 120;

dockPanel.addEventListener('mousemove', (e) => {
  dockItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const itemCx = rect.left + rect.width / 2;
    const dist = Math.abs(e.clientX - itemCx);
    const t = Math.max(0, 1 - dist / DISTANCE);
    const size = BASE + (PEAK - BASE) * t * t;
    item.style.width = size + 'px';
    item.style.height = size + 'px';
  });
});

dockPanel.addEventListener('mouseleave', () => {
  dockItems.forEach((item) => {
    item.style.width = BASE + 'px';
    item.style.height = BASE + 'px';
  });
});

// Intersection Observer for in-view animations
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1 // Triggers when 10% of the element is visible
};

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      
      // Draw map paths when the map wrapper container itself comes into view
      if (entry.target.classList.contains('animate-map-paths')) {
        drawMapPaths();
      }
      
      obs.unobserve(entry.target); // trigger animation only once
    }
  });
}, observerOptions);

function drawMapPaths() {
  const pathsContainer = document.getElementById('worldMapPaths');
  const pointsContainer = document.getElementById('worldMapPoints');
  if (!pathsContainer || !pointsContainer) return;

  const dots = [
    { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: 34.0522, lng: -118.2437 } },
    { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: -15.7975, lng: -47.8919 } },
    { start: { lat: -15.7975, lng: -47.8919 }, end: { lat: 38.7223, lng: -9.1393 } },
    { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.209 } },
    { start: { lat: 28.6139, lng: 77.209 }, end: { lat: 43.1332, lng: 131.9113 } },
    { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -1.2921, lng: 36.8219 } }
  ];

  const projectPoint = (lat, lng) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (start, end) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const lineColor = "#0ea5e9";

  const createMarker = (pt) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const baseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    baseCircle.setAttribute("cx", pt.x);
    baseCircle.setAttribute("cy", pt.y);
    baseCircle.setAttribute("r", "2");
    baseCircle.setAttribute("fill", lineColor);

    const pulseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    pulseCircle.setAttribute("cx", pt.x);
    pulseCircle.setAttribute("cy", pt.y);
    pulseCircle.setAttribute("r", "2");
    pulseCircle.setAttribute("fill", lineColor);
    pulseCircle.setAttribute("opacity", "0.5");

    const rAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    rAnim.setAttribute("attributeName", "r");
    rAnim.setAttribute("from", "2");
    rAnim.setAttribute("to", "8");
    rAnim.setAttribute("dur", "1.5s");
    rAnim.setAttribute("begin", "0s");
    rAnim.setAttribute("repeatCount", "indefinite");
    pulseCircle.appendChild(rAnim);

    const opacityAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    opacityAnim.setAttribute("attributeName", "opacity");
    opacityAnim.setAttribute("from", "0.5");
    opacityAnim.setAttribute("to", "0");
    opacityAnim.setAttribute("dur", "1.5s");
    opacityAnim.setAttribute("begin", "0s");
    opacityAnim.setAttribute("repeatCount", "indefinite");
    pulseCircle.appendChild(opacityAnim);

    g.appendChild(baseCircle);
    g.appendChild(pulseCircle);
    pointsContainer.appendChild(g);
  };

  // Draw all markers immediately
  const seenPoints = new Set();
  dots.forEach(dot => {
    [dot.start, dot.end].forEach(coord => {
      const pt = projectPoint(coord.lat, coord.lng);
      const key = `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;
      if (!seenPoints.has(key)) {
        seenPoints.add(key);
        createMarker(pt);
      }
    });
  });

  // Stagger and draw paths
  dots.forEach((dot, i) => {
    const startPt = projectPoint(dot.start.lat, dot.start.lng);
    const endPt = projectPoint(dot.end.lat, dot.end.lng);

    // Create Path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", createCurvedPath(startPt, endPt));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "url(#path-gradient)");
    path.setAttribute("stroke-width", "1.5");
    path.style.opacity = '0'; // Hide initially to prevent flashing
    
    pathsContainer.appendChild(path);

    const startAnim = (len) => {
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;

      let startTime = null;
      const duration = 1200; // 1.2s duration

      const tick = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress); // ease-out quad
        path.style.strokeDashoffset = len - (len * ease);

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      setTimeout(() => {
        path.style.opacity = '1'; // Show when animation starts
        requestAnimationFrame(tick);
      }, i * 500); // 0.5s delay stagger
    };

    let length = path.getTotalLength();
    if (length === 0) {
      console.warn(`[WorldMap] Path ${i} length is 0 initially. Retrying on next animation frame...`);
      const checkLength = () => {
        const currentLen = path.getTotalLength();
        if (currentLen > 0) {
          console.log(`[WorldMap] Path ${i} length resolved to ${currentLen}. Starting animation.`);
          startAnim(currentLen);
        } else {
          requestAnimationFrame(checkLength);
        }
      };
      requestAnimationFrame(checkLength);
    } else {
      console.log(`[WorldMap] Path ${i} length is ${length}. Starting animation.`);
      startAnim(length);
    }
  });
}

const initAnimations = () => {
  // Stagger Connectivity letters
  const titleEl = document.getElementById('connectivityTitle');
  if (titleEl) {
    const letters = titleEl.textContent.trim().split('');
    titleEl.textContent = '';
    letters.forEach((char, idx) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.setProperty('--delay', `${idx * 0.04}s`);
      titleEl.appendChild(span);
    });
  }

  document.querySelectorAll('.animate-on-view, .animate-map-paths').forEach((el) => {
    observer.observe(el);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}


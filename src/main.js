import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const isMobile = window.innerWidth <= 1024;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==========================================
// 0. ЧАСТИЦЫ (55 штук)
// ==========================================
const canvas = document.getElementById('bg-canvas');
if (canvas && !isMobile && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 130 };

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (mouse.x !== null && mouse.y !== null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          this.x += (dx / distance) * force * 5;
          this.y += (dy / distance) * force * 5;
        }
      }
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201, 255, 0, 0.5)';
      ctx.fill();
    }
  }

  for (let i = 0; i < 55; i++) particles.push(new Particle());

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 120) {
          let opacity = 1 - (distance / 120);
          ctx.strokeStyle = `rgba(201, 255, 0, ${opacity * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ==========================================
// 1. КУРСОР
// ==========================================
const cursor = document.getElementById('cursor');
if (!isMobile && !prefersReducedMotion) {
  const moveCursorX = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
  const moveCursorY = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });
  window.addEventListener('mousemove', (e) => { moveCursorX(e.clientX); moveCursorY(e.clientY); });
  document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicked'));

  const interactiveElements = document.querySelectorAll('a, button, .tech-card, .tournament-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });
}

// ==========================================
// 2. СКРОЛЛ К ЯКОРЯМ
// ==========================================
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerHeight = document.querySelector('.navbar').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});

// ==========================================
// 3. BOOT SCREEN
// ==========================================
const bootScreen = document.getElementById('boot-screen');
const line1 = document.getElementById('line1');
const line2 = document.getElementById('line2');
const line3 = document.getElementById('line3');
const line4 = document.getElementById('line4');

function typeLine(el, text, delay = 0, speed = 25) {
  return new Promise(resolve => {
    if (!el) { resolve(); return; }
    setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) { el.textContent = text.substring(0, i + 1); i++; }
        else { el.textContent = text + ' ✓'; clearInterval(interval); resolve(); }
      }, speed);
    }, delay);
  });
}

async function runBootSequence() {
  await typeLine(line1, "> INITIALIZING CYBER_ARENA.SYS", 200, 25);
  await typeLine(line2, "> LOADING NEURAL INTERFACE...", 200, 25);
  await typeLine(line3, "> BYPASSING SECURITY PROTOCOLS", 200, 20);
  await typeLine(line4, "> SYSTEM READY.", 300, 35);
  await new Promise(r => setTimeout(r, 400));
  gsap.to(bootScreen, {
    opacity: 0, duration: 0.8, ease: "power2.inOut",
    onComplete: () => {
      bootScreen.style.display = 'none';
      startHeroAnimations();
      if (!isMobile && !prefersReducedMotion) gsap.to(cursor, { opacity: 1, duration: 0.5 });
    }
  });
}
runBootSequence();

// ==========================================
// 4. HERO АНИМАЦИИ + SCROLL-АНИМАЦИИ
// ==========================================
function startHeroAnimations() {
  const title = document.querySelector('[data-split]');
  if (title && !title.querySelector('.char')) splitText(title);

  gsap.set('.main-title', { opacity: 1 });
  gsap.fromTo('.main-title .char', 
    { y: '100%', opacity: 0, rotateZ: 10 }, 
    { y: '0%', opacity: 1, rotateZ: 0, stagger: 0.03, duration: 1, ease: 'power4.out' }
  );
  gsap.fromTo('.meta-tag, .hero-desc, .hero-section .btn-primary', 
    { y: 20, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
  );

  const scrollElements = document.querySelectorAll('.section-title, .section-text, .bento-item, .price-card, .tournament-card');
  scrollElements.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
      y: 40, opacity: 0, duration: 0.8, ease: "power3.out"
    });
  });
}

// ==========================================
// 5. SPLIT TEXT
// ==========================================
function splitText(element) {
  const html = element.innerHTML;
  let newHtml = '';
  let isInsideTag = false;
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    if (char === '<') isInsideTag = true;
    if (char === '>') { isInsideTag = false; newHtml += char; continue; }
    if (isInsideTag) { newHtml += char; }
    else if (char.trim() === '') { newHtml += char; }
    else { newHtml += `<span class="char">${char}</span>`; }
  }
  element.innerHTML = newHtml;
}

// ==========================================
// 6. АУДИО С MUTE
// ==========================================
let audioCtx;
let isMuted = false;

function initAudio() {
  if (audioCtx) { if (audioCtx.state === 'suspended') audioCtx.resume(); return; }
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function startAmbient() {
  if (!audioCtx || isMuted) return;
  const humOsc = audioCtx.createOscillator();
  const humGainNode = audioCtx.createGain();
  const humFilter = audioCtx.createBiquadFilter();
  humOsc.type = 'triangle';
  humOsc.frequency.setValueAtTime(35, audioCtx.currentTime);
  humFilter.type = 'lowpass';
  humFilter.frequency.setValueAtTime(150, audioCtx.currentTime);
  humGainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
  humGainNode.gain.setValueAtTime(0.03, audioCtx.currentTime + 4.5);
  humGainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 6);
  humOsc.connect(humFilter); humFilter.connect(humGainNode); humGainNode.connect(audioCtx.destination);
  humOsc.start();
  humOsc.stop(audioCtx.currentTime + 6);
}

function playClick() {
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const tickOsc = audioCtx.createOscillator(); const tickGain = audioCtx.createGain();
  tickOsc.type = 'triangle'; tickOsc.frequency.setValueAtTime(1500, now); tickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
  tickGain.gain.setValueAtTime(0.03, now); tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  tickOsc.connect(tickGain).connect(audioCtx.destination); tickOsc.start(now); tickOsc.stop(now + 0.04);

  const bassOsc = audioCtx.createOscillator(); const bassGain = audioCtx.createGain();
  bassOsc.type = 'sine'; bassOsc.frequency.setValueAtTime(200, now); bassOsc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
  bassGain.gain.setValueAtTime(0.08, now); bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  bassOsc.connect(bassGain).connect(audioCtx.destination); bassOsc.start(now); bassOsc.stop(now + 0.15);
}

function playHover() {
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
  osc.type = 'sine'; osc.frequency.setValueAtTime(900, now); osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05);
  gain.gain.setValueAtTime(0.01, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(gain).connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.05);
}

document.body.addEventListener('click', () => { initAudio(); playClick(); });

// MUTE TOGGLE
const soundToggle = document.getElementById('sound-toggle');
const iconOn = soundToggle ? soundToggle.querySelector('.icon-sound-on') : null;
const iconOff = soundToggle ? soundToggle.querySelector('.icon-sound-off') : null;

if (soundToggle) {
  soundToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    if (isMuted) {
      soundToggle.classList.add('muted');
      if (iconOn) iconOn.style.display = 'none';
      if (iconOff) iconOff.style.display = 'block';
    } else {
      soundToggle.classList.remove('muted');
      if (iconOn) iconOn.style.display = 'block';
      if (iconOff) iconOff.style.display = 'none';
      initAudio();
      startAmbient();
    }
  });
}

// ==========================================
// 7. МАГНИТНЫЕ КНОПКИ
// ==========================================
const magnets = document.querySelectorAll('.btn-primary, .btn-outline, nav a, .tech-card, .tournament-card');
magnets.forEach(btn => {
  if (!isMobile && !prefersReducedMotion && (btn.classList.contains('btn-primary') || btn.classList.contains('btn-outline'))) {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
    });
  }
  btn.addEventListener('mouseenter', () => { if (audioCtx && !isMuted) playHover(); });
});

// ==========================================
// 8. ГЕЙМИФИКАЦИЯ
// ==========================================
const progressEl = document.getElementById('scroll-progress');
const pingEl = document.getElementById('ping-value');
window.addEventListener('scroll', () => {
  const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
  const scrollCurrent = window.scrollY;
  const progress = Math.round((scrollCurrent / scrollTotal) * 100);
  if (progressEl) {
    progressEl.innerText = progress;
    progressEl.style.color = progress >= 100 ? 'var(--accent-primary)' : 'var(--text-main)';
  }
  if (pingEl && progress % 10 === 0) {
    const randomPing = Math.floor(Math.random() * 8) + 8;
    pingEl.innerText = randomPing;
  }
});

// ==========================================
// 9. МЫШКА: ПАРАЛЛАКС + РОЛЬ
// ==========================================
const mouseContainer = document.querySelector('.mouse-container');
const sysMonitor = document.querySelector('.sys-monitor');

if (mouseContainer) {
  mouseContainer.classList.add('glow-primary');
  let floatAnimation = true;

  document.addEventListener('mousemove', (e) => {
    if (isMobile || prefersReducedMotion) return;
    const moveX = (e.clientX / window.innerWidth - 0.5) * 30;
    const moveY = (e.clientY / window.innerHeight - 0.5) * 30;
    if (floatAnimation) { mouseContainer.style.animation = 'none'; floatAnimation = false; }
    gsap.to(mouseContainer, { x: moveX, y: moveY, duration: 1.2, ease: "power2.out", overwrite: "auto" });
  });

  let idleTimer;
  document.addEventListener('mousemove', () => {
    if (isMobile || prefersReducedMotion) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!floatAnimation) {
        gsap.to(mouseContainer, { x: 0, y: 0, duration: 1, ease: "power2.out" });
        mouseContainer.style.animation = 'float 4s ease-in-out infinite';
        floatAnimation = true;
      }
    }, 2000);
  });

  // РОЛЬ 1: Железо (acid lime) - по умолчанию
  ScrollTrigger.create({
    trigger: "#hardware",
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => {
      mouseContainer.classList.remove('glow-secondary', 'pulse');
      mouseContainer.classList.add('glow-primary');
      if (sysMonitor) sysMonitor.classList.remove('monitor-secondary');
    },
    onEnterBack: () => {
      mouseContainer.classList.remove('glow-secondary', 'pulse');
      mouseContainer.classList.add('glow-primary');
      if (sysMonitor) sysMonitor.classList.remove('monitor-secondary');
    }
  });

  // РОЛЬ 2: Тарифы (ember red)
  ScrollTrigger.create({
    trigger: "#pricing",
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => {
      mouseContainer.classList.remove('glow-primary', 'pulse');
      mouseContainer.classList.add('glow-secondary');
      if (sysMonitor) sysMonitor.classList.add('monitor-secondary');
    },
    onEnterBack: () => {
      mouseContainer.classList.remove('glow-primary', 'pulse');
      mouseContainer.classList.add('glow-secondary');
      if (sysMonitor) sysMonitor.classList.add('monitor-secondary');
    }
  });

  // РОЛЬ 3: Турниры (пульсация ember red)
  ScrollTrigger.create({
    trigger: "#tournaments",
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => {
      mouseContainer.classList.remove('glow-primary', 'glow-secondary');
      mouseContainer.classList.add('pulse');
      if (sysMonitor) sysMonitor.classList.add('monitor-secondary');
    },
    onEnterBack: () => {
      mouseContainer.classList.remove('glow-primary', 'glow-secondary');
      mouseContainer.classList.add('pulse');
      if (sysMonitor) sysMonitor.classList.add('monitor-secondary');
    }
  });
}

// ==========================================
// 10. МОДАЛЬНОЕ ОКНО
// ==========================================
const modal = document.getElementById('booking-modal');
const openBtns = document.querySelectorAll('#open-booking, .open-modal-btn');
const closeBtn = document.getElementById('close-modal');
const pcGrid = document.getElementById('pc-grid');
const selectedDisplay = document.getElementById('selected-pc-display');
const confirmBtn = document.getElementById('confirm-booking');

function generatePCGrid() {
  if (!pcGrid) return;
  pcGrid.innerHTML = '';
  for (let i = 1; i <= 15; i++) {
    const spot = document.createElement('div');
    spot.classList.add('pc-spot');
    const isOccupied = Math.random() > 0.7;
    if (isOccupied) {
      spot.classList.add('occupied');
      spot.textContent = 'X';
    } else {
      spot.textContent = `#${i}`;
    }
    spot.dataset.pcId = i;

    if (!isMobile && !prefersReducedMotion) {
      spot.addEventListener('mouseenter', () => {
        cursor.classList.add('hovered');
        if (audioCtx && !isMuted) playHover();
      });
      spot.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovered');
      });
    }

    spot.addEventListener('click', () => {
      if (spot.classList.contains('occupied')) return;
      document.querySelectorAll('.pc-spot.selected').forEach(el => el.classList.remove('selected'));
      spot.classList.add('selected');
      selectedDisplay.textContent = `ПК #${i}`;
      selectedDisplay.style.color = 'var(--accent-primary)';
      confirmBtn.disabled = false;
      if (audioCtx && !isMuted) playHover();
    });

    pcGrid.appendChild(spot);
  }
}

openBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    generatePCGrid();
    modal.classList.add('active');
    selectedDisplay.textContent = 'НЕ ВЫБРАНО';
    selectedDisplay.style.color = 'var(--text-main)';
    confirmBtn.disabled = true;
    if (audioCtx && !isMuted) playHover();
  });
});

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    if (audioCtx && !isMuted) playHover();
  });
}

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

if (confirmBtn) {
  confirmBtn.addEventListener('click', () => {
    const selectedPC = document.querySelector('.pc-spot.selected');
    if (selectedPC) {
      confirmBtn.textContent = 'УСПЕШНО!';
      confirmBtn.style.background = '#fff';
      confirmBtn.style.color = '#000';
      setTimeout(() => {
        modal.classList.remove('active');
        setTimeout(() => {
          confirmBtn.textContent = 'ПОДТВЕРДИТЬ БРОНЬ';
          confirmBtn.style.background = '';
          confirmBtn.style.color = '';
          confirmBtn.disabled = true;
        }, 300);
      }, 1500);
    }
  });
}
/* ================= CONFIGURATION ================= */
const CONFIG = {
  particles: {
    count: 80,
    maxSpeed: 1,
    connectionDistance: 150,
    mouseInfluence: 120
  },
  cursor: {
    glowSize: 500,
    followSpeed: 0.12
  },
  animations: {
    enabled: true,
    duration: 600
  }
};

/* ================= INITIALIZATION ================= */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavbarScroll();
  initCursorGlow();
  initParticles();
  initAOS();
  initCounters();
  initPulseScroll();
  initHeroScrollAnimation();
});

/* ================= MOBILE MENU ================= */
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navbar.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navbar.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
    
    // Close menu on outside click
    document.addEventListener("click", (e) => {
      if (navbar.classList.contains("active") && 
          !e.target.closest(".nav-links") && 
          !e.target.closest(".menu-toggle")) {
        navbar.classList.remove("active");
        navLinks.classList.remove("active");
      }
    });
  }
}

/* ================= NAVBAR SCROLL EFFECT ================= */
function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  let lastScroll = 0;
  
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    
    lastScroll = currentScroll;
  });
}

/* ================= CURSOR GLOW EFFECT ================= */
function initCursorGlow() {
  const cursorGlow = document.getElementById("cursor-glow");
  if (!cursorGlow) return;

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateCursorGlow() {
    glowX += (mouseX - glowX) * CONFIG.cursor.followSpeed;
    glowY += (mouseY - glowY) * CONFIG.cursor.followSpeed;
    
    cursorGlow.style.left = glowX + "px";
    cursorGlow.style.top = glowY + "px";
    
    requestAnimationFrame(updateCursorGlow);
  }

  updateCursorGlow();
}

/* ================= PARTICLE BACKGROUND ================= */
function initParticles() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: null, y: null, radius: CONFIG.particles.mouseInfluence };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Mouse tracking
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * CONFIG.particles.maxSpeed;
      this.vy = (Math.random() - 0.5) * CONFIG.particles.maxSpeed;
      this.radius = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      // Boundary check
      if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
        this.vx = -this.vx;
      }
      if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
        this.vy = -this.vy;
      }

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.vx -= Math.cos(angle) * force * 0.5;
          this.vy -= Math.sin(angle) * force * 0.5;
        }
      }

      // Velocity damping
      this.vx *= 0.99;
      this.vy *= 0.99;

      // Minimum velocity
      if (Math.abs(this.vx) < 0.1) this.vx = (Math.random() - 0.5) * 0.2;
      if (Math.abs(this.vy) < 0.1) this.vy = (Math.random() - 0.5) * 0.2;

      this.x += this.vx;
      this.y += this.vy;
    }

    draw() {
      ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create particles
  for (let i = 0; i < CONFIG.particles.count; i++) {
    particles.push(new Particle());
  }

  // Draw connections
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.particles.connectionDistance) {
          const opacity = (1 - distance / CONFIG.particles.connectionDistance) * 0.2;
          ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    drawConnections();
    requestAnimationFrame(animate);
  }

  animate();
}

/* ================= SIMPLE AOS (ANIMATE ON SCROLL) ================= */
function initAOS() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
  });
}

/* ================= COUNTER ANIMATION ================= */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        animateCounter(entry.target);
        entry.target.classList.add('counted');
      }
    });
  }, observerOptions);

  counters.forEach(counter => {
    observer.observe(counter);
  });
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-count'));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      element.textContent = target + '+';
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

/* ================= PULSE SCROLL ANIMATION ================= */
function initPulseScroll() {
  const pulseContainer = document.getElementById('pulseContainer');
  if (!pulseContainer) return;

  // Clone cards for infinite scroll
  const cards = pulseContainer.innerHTML;
  pulseContainer.innerHTML += cards;

  // Pause animation on hover
  pulseContainer.addEventListener('mouseenter', () => {
    pulseContainer.style.animationPlayState = 'paused';
  });

  pulseContainer.addEventListener('mouseleave', () => {
    pulseContainer.style.animationPlayState = 'running';
  });
}

/* ================= SMOOTH SCROLL ================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/* ================= BUTTON RIPPLE EFFECT ================= */
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    this.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Add ripple CSS dynamically
const style = document.createElement('style');
style.textContent = `
  .btn {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

/* ================= PARALLAX EFFECT ================= */
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.hero-bg-image');
  
  parallaxElements.forEach(el => {
    const speed = 0.5;
    el.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

/* ================= FEATURE CARDS TILT EFFECT ================= */
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ================= LAZY LOAD IMAGES ================= */
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});

/* ================= PERFORMANCE OPTIMIZATION ================= */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      // Scroll-based animations here
      ticking = false;
    });
    ticking = true;
  }
});

/* ================= PRELOADER (Optional) ================= */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

/* ================= HERO SCROLL ANIMATION ================= */
function initHeroScrollAnimation() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  
  const frameCount = 240;
  const currentFrame = index => (
    `assets/frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
  );

  const images = [];
  let framesLoaded = 0;

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
      framesLoaded++;
      if (framesLoaded === 1) {
        resizeCanvas(); 
      }
    };
    images.push(img);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
  }

  window.addEventListener('resize', resizeCanvas);

  function render() {
    if(!images[0] || !images[0].complete) return;
    
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollFraction = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    
    // Smooth frame calculation
    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(scrollFraction * frameCount)
    );

    const img = images[frameIndex];
    if (img && img.complete) {
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.width;
      const ih = img.height;
      
      const hRatio = cw / iw;
      const vRatio = ch / ih;
      const ratio = Math.max(hRatio, vRatio);
      
      const centerShift_x = (cw - iw * ratio) / 2;
      const centerShift_y = (ch - ih * ratio) / 2;
      
      context.clearRect(0, 0, cw, ch);
      context.drawImage(img, 0, 0, iw, ih, centerShift_x, centerShift_y, iw * ratio, ih * ratio);
    }
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(render);
  });
}

/* ================= CONSOLE MESSAGE ================= */
console.log('%cSundarbans House 🌟', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%cWelcome to our community! Built with ❤️', 'color: #764ba2; font-size: 14px;');

const config = {
  qrLinks: { n1: "", n2: "", n3: "", n4: "" },
  socialLinks: { facebook: "", tiktok: "", discord: "", email: "", address: "" }
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let toastTimer;

function qs(selector, root = document) { return root.querySelector(selector); }
function qsa(selector, root = document) { return [...root.querySelectorAll(selector)]; }

function showToast(message) {
  const toast = qs(".toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function initNavbar() {
  const header = qs(".site-header");
  const menuBtn = qs(".menu-toggle");
  const menu = qs(".mobile-menu");
  const closeMenu = () => {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  };
  menuBtn.addEventListener("click", () => {
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  qsa(".mobile-menu a").forEach(link => link.addEventListener("click", closeMenu));
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 20), { passive: true });
}

function initMobileMenu() {}

function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = qs(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  });
}

function initScrollReveal() {
  const items = qsa(".reveal");
  if (reducedMotion) {
    items.forEach(el => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
  items.forEach(el => observer.observe(el));
}

function initFAQ() {
  qsa(".faq-item").forEach(item => {
    const button = qs("button", item);
    const answer = qs(".faq-answer", item);
    button.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      qsa(".faq-item.open").forEach(openItem => {
        openItem.classList.remove("open");
        qs("button", openItem).setAttribute("aria-expanded", "false");
        qs(".faq-answer", openItem).style.height = "0px";
      });
      if (!wasOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        answer.style.height = `${answer.scrollHeight}px`;
      }
    });
  });
}

function initQRButtons() {
  qsa(".qr-card").forEach(card => {
    const key = card.dataset.qr;
    const openBtn = qs(".qr-open", card);
    const copyBtn = qs(".qr-copy", card);
    openBtn.addEventListener("click", () => {
      const link = config.qrLinks[key];
      if (!link) {
        showToast("Liên kết chưa được cập nhật.");
        return;
      }
      window.open(link, "_blank", "noopener,noreferrer");
    });
    copyBtn.addEventListener("click", async () => {
      const link = config.qrLinks[key];
      if (!link) {
        showToast("Liên kết chưa được cập nhật.");
        return;
      }
      try {
        await navigator.clipboard.writeText(link);
        showToast("Đã sao chép liên kết!");
      } catch {
        showToast("Không thể sao chép trên thiết bị này.");
      }
    });
  });
}

function initCopyButtons() {}

function initCardTilt() {
  if (reducedMotion || window.matchMedia("(max-width: 767px)").matches) return;
  qsa(".tilt").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - .5) * 7;
      const rotateX = (.5 - y) * 7;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function initParallax() {
  const glow = qs(".cursor-glow");
  const scene = qs(".scene");
  if (reducedMotion) return;
  let mx = innerWidth / 2, my = innerHeight / 2, raf = 0;
  document.addEventListener("pointermove", event => {
    mx = event.clientX; my = event.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      if (glow) {
        glow.style.left = `${mx}px`;
        glow.style.top = `${my}px`;
      }
      if (scene && innerWidth > 767) {
        const rx = (my / innerHeight - .5) * -4;
        const ry = (mx / innerWidth - .5) * 6;
        scene.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      raf = 0;
    });
  }, { passive: true });
}

function initParticles() {
  const canvas = qs("#particle-canvas");
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let particles = [];
  let width = 0, height = 0;
  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(50, Math.max(20, Math.floor(width / 25)));
    particles = Array.from({length: count}, () => ({
      x: Math.random()*width, y: Math.random()*height,
      r: Math.random()*1.5+.4, vx:(Math.random()-.5)*.12, vy:(Math.random()-.5)*.12,
      a:Math.random()*.5+.15
    }));
  };
  const frame = () => {
    ctx.clearRect(0,0,width,height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > width) p.vx *= -1;
      if(p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(34,211,238,${p.a})`; ctx.fill();
    });
    requestAnimationFrame(frame);
  };
  addEventListener("resize", resize, {passive:true});
  resize(); frame();
}

function initScrollProgress() {
  const bar = qs(".scroll-progress span");
  const timeline = qs(".timeline-line span");
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max ? scrollY / max : 0;
    bar.style.width = `${progress * 100}%`;
    if (timeline) {
      const rect = qs(".timeline").getBoundingClientRect();
      const visible = Math.min(1, Math.max(0, (innerHeight * .7 - rect.top) / Math.max(rect.height * .72, 1)));
      timeline.style.height = `${visible * 100}%`;
    }
  };
  addEventListener("scroll", update, {passive:true}); update();
}

function initBackToTop() {
  const btn = qs(".back-top");
  addEventListener("scroll", () => btn.classList.toggle("visible", scrollY > 600), {passive:true});
  btn.addEventListener("click", () => scrollTo({top:0, behavior: reducedMotion ? "auto" : "smooth"}));
}

function initActiveNavigation() {
  const links = qsa(".nav-links a");
  const sections = links.map(link => qs(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, {rootMargin:"-35% 0px -55% 0px", threshold:0});
  sections.forEach(section => observer.observe(section));
}

function initReducedMotion() {
  document.documentElement.dataset.reducedMotion = reducedMotion ? "true" : "false";
}

function initLoading() {
  window.addEventListener("load", () => {
    setTimeout(() => qs("#preloader")?.classList.add("loaded"), 450);
  });
  setTimeout(() => qs("#preloader")?.classList.add("loaded"), 1800);
}

function initMissingAssets() {
  qsa("img").forEach(img => {
    img.addEventListener("error", () => {
      img.style.visibility = "hidden";
      img.closest(".brand-logo,.footer-logo")?.classList.add("asset-missing");
    });
  });
}

function init() {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initFAQ();
  initQRButtons();
  initCopyButtons();
  initCardTilt();
  initParallax();
  initParticles();
  initScrollProgress();
  initBackToTop();
  initActiveNavigation();
  initReducedMotion();
  initLoading();
  initMissingAssets();
}
document.addEventListener("DOMContentLoaded", init);

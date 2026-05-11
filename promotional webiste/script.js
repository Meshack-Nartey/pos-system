const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('[data-nav]');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const counters = document.querySelectorAll('[data-count]');

const animateCounter = (node) => {
  const target = Number(node.getAttribute('data-count'));
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 24));

  const tick = () => {
    current += step;
    if (current >= target) {
      node.textContent = String(target);
      return;
    }
    node.textContent = String(current);
    requestAnimationFrame(tick);
  };

  tick();
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.4 }
);

counters.forEach((counter) => observer.observe(counter));

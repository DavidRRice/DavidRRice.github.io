/* Navigation and the preserved, precomputed MAGRATHEA demonstration. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (toggle && nav) {
    toggle.hidden = false;
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      toggle.querySelector('span').textContent = '+';
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      toggle.querySelector('span').textContent = open ? '−' : '+';
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu(); toggle.focus();
      }
    });
    window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);
  }
  const mass = document.getElementById('mass');
  const temp = document.getElementById('temp');
  const atm = document.getElementById('atm');
  const diagram = document.getElementById('currentImage');
  if (mass && temp && atm && diagram) {
    const caption = document.getElementById('diagram-caption');
    const download = document.getElementById('diagram-download');
    const updateDiagram = () => {
      const path = `images/ternary/ternary${mass.value}-${temp.value}-${atm.value}.svg`;
      const fraction = { '0': '0', '1': '0.01', '2': '0.1' }[atm.value];
      diagram.src = path;
      diagram.alt = `Planetary radii across core, mantle and water compositions for a ${mass.value} Earth-mass planet at ${temp.value} K, with ${fraction}% atmospheric mass`;
      caption.textContent = `${mass.value} Earth ${mass.value === '1' ? 'mass' : 'masses'} · ${temp.value} K · ${fraction}% atmosphere`;
      download.href = path;
    };
    [mass, temp, atm].forEach(el => el.addEventListener('change', updateDiagram));
  }
})();

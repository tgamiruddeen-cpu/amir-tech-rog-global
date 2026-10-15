(() => {
  const button = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const closeMenu = () => {
    if (!button || !nav) return;
    nav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Buka menu');
    button.firstChild.textContent = '☰ ';
  };
  if (button && nav) {
    button.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      button.firstChild.textContent = open ? '✕ ' : '☰ ';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }
  const form = document.getElementById('quote');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('nama').value.trim();
    const car = document.getElementById('kereta').value.trim();
    const issue = document.getElementById('masalah').value;
    const text = `Assalamualaikum AMIR TECH ROG GLOBAL.\nNama: ${name}\nModel kereta: ${car}\nMasalah: ${issue}\nSaya ingin bertanya harga servis/repair aircond.`;
    window.location.href = `https://wa.me/60133133519?text=${encodeURIComponent(text)}`;
  });
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

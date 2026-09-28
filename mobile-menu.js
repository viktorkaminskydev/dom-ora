(() => {
  const menu = document.getElementById('mmenu');
  const trigger = document.querySelector('.burger');
  if (!menu || !trigger) return;
  const close = menu.querySelector('.close');
  const links = [...menu.querySelectorAll('a')];
  let previousOverflow = '';
  let focusTimer;
  menu.inert = true;
  menu.setAttribute('aria-hidden', 'true');
  trigger.setAttribute('aria-controls', menu.id);
  trigger.setAttribute('aria-expanded', 'false');
  links.forEach((link, i) => link.style.setProperty('--menu-order', i));
  const setOpen = (open, restoreFocus = true) => {
    if (open === menu.classList.contains('open')) return;
    clearTimeout(focusTimer);
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      links.forEach(link => {
        if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
        if (link.getAttribute('href') === (location.hash || '#hero')) link.setAttribute('aria-current', 'location');
      });
    } else {
      document.body.style.overflow = previousOverflow;
      if (restoreFocus) trigger.focus({preventScroll:true});
    }
    menu.inert = !open;
    menu.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    if (open) focusTimer = setTimeout(() => close.focus({preventScroll:true}), 0);
  };
  trigger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  close.addEventListener('click', () => setOpen(false));
  links.forEach(link => link.addEventListener('click', () => setOpen(false, !link.hasAttribute('data-inquiry'))));
  document.addEventListener('keydown', e => {
    if (!menu.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    if (e.key === 'Tab') {
      const first = close, last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  const desktop = matchMedia('(min-width:768px)');
  desktop.addEventListener('change', e => { if (e.matches) setOpen(false); });
})();

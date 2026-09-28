// Start Hero immediately; below-fold decorative media remains lazy.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const backgrounds = document.querySelectorAll('.site-footer, .end-cta-media');
  const reveal = element => {
    element.classList.add('media-ready');
    element.querySelectorAll('video[data-poster]').forEach(video => { video.poster = video.dataset.poster; });
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { reveal(entry.target); observer.unobserve(entry.target); }
    }), { rootMargin: '300px 0px' });
    backgrounds.forEach(element => observer.observe(element));
  } else backgrounds.forEach(reveal);
  const videos = [...document.querySelectorAll('video[data-src]')];
  const visible = new Set();
  const play = video => {
    if (document.hidden || reducedMotion.matches || !visible.has(video) || getComputedStyle(video).display === 'none') return;
    if (navigator.connection?.saveData) return;
    if (!video.getAttribute('src')) {
      video.src = window.matchMedia('(max-width: 768px)').matches && video.dataset.mobileSrc ? video.dataset.mobileSrc : video.dataset.src;
      video.load();
    }
    video.play().catch(() => { if (video.id === 'bg-video') video.controls = true; });
  };
  const hero = document.getElementById('bg-video');
  if (hero) {
    hero.muted = true;
    const manual = reducedMotion.matches || navigator.connection?.saveData;
    hero.autoplay = !manual;
    hero.controls = Boolean(manual);
    hero.preload = manual ? 'metadata' : 'auto';
    hero.src = window.matchMedia('(max-width: 768px)').matches && hero.dataset.mobileSrc ? hero.dataset.mobileSrc : hero.dataset.src;
    visible.add(hero);
    if (!manual) play(hero);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) { visible.add(target); play(target); }
        else { visible.delete(target); target.pause(); }
      });
    });
    videos.forEach(video => observer.observe(video));
  } else {
    videos.forEach(video => { visible.add(video); play(video); });
  }
  document.addEventListener('visibilitychange', () => {
    videos.forEach(video => document.hidden ? video.pause() : play(video));
  });
  reducedMotion.addEventListener('change', () => {
    videos.forEach(video => reducedMotion.matches ? video.pause() : play(video));
    if (hero) hero.controls = reducedMotion.matches || Boolean(navigator.connection?.saveData);
  });
})();

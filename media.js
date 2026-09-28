// Let the hero poster and text paint before downloading decorative videos.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || navigator.connection?.saveData) return;
  const videos = [...document.querySelectorAll('video[data-src]')];
  const visible = new Set();
  let heroReady = false;
  const play = video => {
    if (document.hidden || reducedMotion.matches || !visible.has(video) || getComputedStyle(video).display === 'none') return;
    if (video.id === 'bg-video' && !heroReady) return;
    if (!video.getAttribute('src')) {
      video.src = video.dataset.src;
      video.load();
    }
    video.play().catch(() => {}); // Poster stays visible if autoplay is blocked.
  };
  const hero = document.getElementById('bg-video');
  if (hero) {
    const poster = new Image();
    poster.onload = poster.onerror = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      setTimeout(() => { heroReady = true; play(hero); }, 1000);
    }));
    poster.src = hero.poster;
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
  });
})();

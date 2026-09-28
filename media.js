// Let the hero poster and text paint before downloading decorative videos.
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
  if (reducedMotion.matches || navigator.connection?.saveData) return;
  const videos = [...document.querySelectorAll('video[data-src]')];
  const visible = new Set();
  let heroReady = false;
  const play = video => {
    if (document.hidden || reducedMotion.matches || !visible.has(video) || getComputedStyle(video).display === 'none') return;
    if (video.id === 'bg-video' && !heroReady) return;
    if (!video.getAttribute('src')) {
      video.src = window.matchMedia('(max-width: 768px)').matches && video.dataset.mobileSrc ? video.dataset.mobileSrc : video.dataset.src;
      video.load();
    }
    video.play().catch(() => {}); // Poster stays visible if autoplay is blocked.
  };
  const hero = document.getElementById('bg-video');
  if (hero) {
    const poster = new Image();
    poster.onload = poster.onerror = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      // Give critical fonts time to settle before starting decorative video traffic.
      const fontsReady = document.fonts.ready;
      Promise.race([fontsReady, new Promise(resolve => setTimeout(resolve, 2500))])
        .then(() => setTimeout(() => { heroReady = true; play(hero); }, 1500));
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

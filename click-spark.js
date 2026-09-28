/* ClickSpark adapted to the static site: 8 white rays, 400ms, no dependencies. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const layers = new Map();
  const duration = 400, radius = 15, size = 10, count = 8;
  function layerFor(parent) {
    if (layers.has(parent)) return layers.get(parent);
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100;display:block;user-select:none;';
    parent.append(canvas);
    const ctx = canvas.getContext('2d');
    const layer = {canvas, ctx, sparks:[], frame:0};
    layers.set(parent, layer);
    return layer;
  }
  function reset(layer) {
    cancelAnimationFrame(layer.frame);
    layer.frame = 0;
    layer.sparks = [];
    layer.ctx?.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
  }
  function draw(layer, now) {
    const {canvas, ctx} = layer;
    layer.sparks = layer.sparks.filter(s => now - s.time < duration);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (const spark of layer.sparks) {
      const t = Math.min(1, (now - spark.time) / duration);
      const eased = t * (2 - t);
      const distance = eased * radius;
      const length = size * (1 - eased);
      for (let i = 0; i < count; i++) {
        const angle = 2 * Math.PI * i / count;
        const x = Math.cos(angle), y = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(spark.x + distance*x, spark.y + distance*y);
        ctx.lineTo(spark.x + (distance+length)*x, spark.y + (distance+length)*y);
        ctx.stroke();
      }
    }
    layer.frame = layer.sparks.length ? requestAnimationFrame(time => draw(layer, time)) : 0;
  }
  document.addEventListener('pointerdown', event => {
    if (reduce.matches || event.pointerType !== 'mouse' || event.button !== 0) return;
    const parent = event.target.closest('dialog[open]') || document.body;
    const layer = layerFor(parent);
    if (!layer.ctx) return;
    const rect = layer.canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.round(rect.width*dpr), height = Math.round(rect.height*dpr);
    if (layer.canvas.width !== width || layer.canvas.height !== height) {
      layer.canvas.width = width;
      layer.canvas.height = height;
      layer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layer.sparks = [];
    }
    layer.sparks.push({x:event.clientX-rect.left, y:event.clientY-rect.top, time:performance.now()});
    layer.sparks = layer.sparks.slice(-20);
    if (!layer.frame) layer.frame = requestAnimationFrame(time => draw(layer, time));
  }, {capture:true, passive:true});
  reduce.addEventListener('change', () => { if (reduce.matches) layers.forEach(reset); });
  window.addEventListener('resize', () => layers.forEach(reset), {passive:true});
  window.addEventListener('pagehide', () => layers.forEach(reset));
  document.addEventListener('visibilitychange', () => { if (document.hidden) layers.forEach(reset); });
})();

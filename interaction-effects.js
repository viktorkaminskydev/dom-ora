(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const buttons = [...document.querySelectorAll('.btn, .end-cta-link, .burger, .mobile-menu .close, .mobile-menu a:not(.btn), .inquiry-close, .slide-arrow')];
  const offsets = new Map();
  let moveFrame = 0, pointer;
  const resetButton = el => {
    if (!offsets.has(el)) return;
    el.style.translate = offsets.get(el).original;
    offsets.delete(el);
  };
  const resetAll = () => { cancelAnimationFrame(moveFrame); moveFrame=0; buttons.forEach(resetButton); };
  buttons.forEach(el => el.addEventListener('pointerleave', () => resetButton(el), {passive:true}));
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !mouse.matches || reduce.matches) return;
    pointer = {x:event.clientX, y:event.clientY};
    if (moveFrame) return;
    moveFrame = requestAnimationFrame(() => {
      moveFrame=0;
      for (const el of buttons) {
        if (!el.getClientRects().length || el.closest('[inert]')) { resetButton(el); continue; }
        const old=offsets.get(el), rect=el.getBoundingClientRect();
        const left=rect.left-(old?.x||0), top=rect.top-(old?.y||0);
        const dx=Math.max(left-pointer.x,0,pointer.x-left-rect.width);
        const dy=Math.max(top-pointer.y,0,pointer.y-top-rect.height);
        if (Math.hypot(dx,dy)>=80) { resetButton(el); continue; }
        const x=Math.max(-24,Math.min(24,(pointer.x-left-rect.width/2)*.3));
        const y=Math.max(-24,Math.min(24,(pointer.y-top-rect.height/2)*.3));
        offsets.set(el,{x,y,original:old?.original??el.style.translate});
        el.style.translate=`${x}px ${y}px`;
      }
    });
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',resetAll,{passive:true});
  window.addEventListener('blur',resetAll);
  window.addEventListener('scroll',resetAll,{passive:true});
  mouse.addEventListener('change',resetAll);

  const cards=[...document.querySelectorAll('#process .process-step')].map(el=>{
    const canvas=document.createElement('canvas');
    canvas.className='process-particles';canvas.setAttribute('aria-hidden','true');
    el.prepend(canvas);
    return {el,canvas,ctx:canvas.getContext('2d'),points:[],width:0,height:0,visible:false};
  }).filter(card=>card.ctx);
  const byElement=new Map(cards.map(card=>[card.el,card]));
  let particleFrame=0,last=0;
  const resize=new ResizeObserver(entries=>{
    for (const entry of entries) {
      const c=byElement.get(entry.target);
      const width=entry.contentRect.width+parseFloat(getComputedStyle(c.el).paddingLeft)+parseFloat(getComputedStyle(c.el).paddingRight);
      const height=c.el.clientHeight;
      c.width=width;c.height=height;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      c.canvas.width=Math.round(width*dpr);c.canvas.height=Math.round(height*dpr);
      c.ctx.setTransform(dpr,0,0,dpr,0,0);
      c.points=Array.from({length:80},()=>({x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*18,vy:(Math.random()-.5)*18}));
    }
  });
  const enabled=()=>!reduce.matches&&!document.hidden&&cards.some(c=>c.visible);
  const wake=()=>{if (!particleFrame&&enabled()){last=performance.now();particleFrame=requestAnimationFrame(draw);}};
  function draw(now) {
    particleFrame=0;
    if (!enabled()) return;
    if (now-last<1000/30) {particleFrame=requestAnimationFrame(draw);return;}
    const dt=Math.min((now-last)/1000,.06);last=now;
    for (const c of cards) {
      if (!c.visible) continue;
      const {ctx,points}=c;ctx.clearRect(0,0,c.width,c.height);
      for (const p of points) {
        p.x+=p.vx*dt;p.y+=p.vy*dt;
        if(p.x<0||p.x>c.width){p.vx*=-1;p.x=Math.max(0,Math.min(c.width,p.x));}
        if(p.y<0||p.y>c.height){p.vy*=-1;p.y=Math.max(0,Math.min(c.height,p.y));}
      }
      ctx.lineWidth=.6;
      for(let i=0;i<points.length;i++){
        const p=points[i];
        for(let j=i+1;j<points.length;j++){
          const q=points[j],distance=Math.hypot(p.x-q.x,p.y-q.y);
          if(distance<120){ctx.strokeStyle=`rgba(217,161,91,${(1-distance/120)*.24})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
        }
        ctx.fillStyle='rgba(244,242,234,.85)';ctx.beginPath();ctx.arc(p.x,p.y,1.3,0,Math.PI*2);ctx.fill();
      }
    }
    particleFrame=requestAnimationFrame(draw);
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      byElement.get(entry.target).visible=entry.isIntersecting;
      entry.target.classList.toggle('particles-visible',entry.isIntersecting);
    });
    if(!enabled()){cancelAnimationFrame(particleFrame);particleFrame=0;}else wake();
  });
  cards.forEach(c=>{resize.observe(c.el);observer.observe(c.el);});
  const suspend=()=>{cancelAnimationFrame(particleFrame);particleFrame=0;resetAll();};
  reduce.addEventListener('change',()=>{suspend();wake();});
  document.addEventListener('visibilitychange',()=>{suspend();wake();});
  window.addEventListener('pagehide',suspend);
})();

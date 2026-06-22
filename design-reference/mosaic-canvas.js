/* Arkode Mosaic — generative mosaic canvas, reusable.
   Markup:  <canvas data-mz="3" width="120" height="120"></canvas>
   data-mz = grid size (NxN). Optional data-cols / data-rows override.
   Call MosaicCanvas.hydrate() after DOM ready (or it auto-runs).
   PORT NOTE: in the Next app this becomes a <MosaicCanvas cols rows/> React component
   that runs the same animated grid in a useEffect + requestAnimationFrame loop. */
(function(){
  var COLORS=['#FF6C5D','#FF8A3D','#E8503F','#C5362A','#FF6C5D','#FF8A3D','#001C43','#F4ECDE','#FF6C5D','#E8503F'];
  function lerp(a,b,k){
    var ar=parseInt(a.slice(1,3),16),ag=parseInt(a.slice(3,5),16),ab=parseInt(a.slice(5,7),16),
        br=parseInt(b.slice(1,3),16),bg=parseInt(b.slice(3,5),16),bb=parseInt(b.slice(5,7),16);
    return 'rgb('+Math.round(ar+(br-ar)*k)+','+Math.round(ag+(bg-ag)*k)+','+Math.round(ab+(bb-ab)*k)+')';
  }
  function pick(){ return COLORS[(Math.random()*COLORS.length)|0]; }
  function mount(canvas){
    if(canvas.__mzMounted) return; canvas.__mzMounted=true;
    var ctx=canvas.getContext('2d'); if(!ctx) return;
    var n=parseInt(canvas.getAttribute('data-mz'),10)||3;
    var cols=parseInt(canvas.getAttribute('data-cols'),10)||n;
    var rows=parseInt(canvas.getAttribute('data-rows'),10)||n;
    var swap=parseInt(canvas.getAttribute('data-swap'),10)||1100;
    var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var W,H,cw,ch,dpr,cells=[],raf=null,last=0,nextSwap=0;
    function resize(){
      dpr=Math.min(2,window.devicePixelRatio||1);
      var r=canvas.getBoundingClientRect(); W=r.width||canvas.width; H=r.height||canvas.height;
      canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0); cw=W/cols; ch=H/rows;
    }
    function init(){ cells=[]; for(var i=0;i<cols*rows;i++) cells.push({from:pick(),to:pick(),t:1}); }
    function draw(){
      for(var y=0;y<rows;y++) for(var x=0;x<cols;x++){
        var c=cells[y*cols+x];
        var x0=Math.round(x*cw),x1=Math.round((x+1)*cw),y0=Math.round(y*ch),y1=Math.round((y+1)*ch);
        ctx.fillStyle = c.t>=1 ? c.to : lerp(c.from,c.to,c.t);
        ctx.fillRect(x0,y0,x1-x0,y1-y0);
      }
    }
    function frame(ts){
      if(!last) last=ts; var dt=ts-last; last=ts;
      for(var i=0;i<cells.length;i++){ if(cells[i].t<1) cells[i].t=Math.min(1,cells[i].t+dt/520); }
      if(ts>nextSwap){ nextSwap=ts+swap; var idx=(Math.random()*cells.length)|0; cells[idx].from=cells[idx].to; cells[idx].to=pick(); cells[idx].t=0; }
      draw(); raf=requestAnimationFrame(frame);
    }
    resize(); init(); draw();
    window.addEventListener('resize',function(){ resize(); draw(); });
    if(reduce) return;
    var ob=new IntersectionObserver(function(es){ es.forEach(function(e){
      if(e.isIntersecting){ if(!raf){ last=0; raf=requestAnimationFrame(frame); } }
      else if(raf){ cancelAnimationFrame(raf); raf=null; }
    }); },{threshold:0.01});
    ob.observe(canvas);
  }
  function hydrate(root){ (root||document).querySelectorAll('canvas[data-mz]').forEach(mount); }
  window.MosaicCanvas={ hydrate:hydrate, mount:mount };
  if(document.readyState!=='loading') hydrate();
  else document.addEventListener('DOMContentLoaded',function(){ hydrate(); });
})();

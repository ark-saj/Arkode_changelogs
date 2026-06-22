/* Arkode · Option 3 "Mosaic" — pixel-art sprite engine (canonical, two-weight).
   Source of truth for the React port at src/components/mosaic/pixel-icon.tsx.
   Renders crisp pixel sprites: each painted cell is one <i> sized to the
   weight's fill ratio, centered in its grid cell, with a soft corner radius.

   TWO WEIGHTS (per Arkode usage rules):
     inset (86% fill) — small & dense UI; legible at unit <= 3 (buttons, chips, rows)
     fine  (70% fill) — premium default for feature/standalone icons (unit >= 4)
   Override per icon with data-weight="inset|fine"; otherwise auto by size.
   Sizing: data-unit = px per cell. inline 2-3 · default 4-5 · feature 8+.
   Recolor with data-tint="#FF6C5D".
   Usage:  <span data-px="gear" data-unit="9" data-weight="fine"></span>
*/
(function(){
  var PAL = {
    n:'#001C43', c:'#FF6C5D', o:'#FF8A3D', r:'#C5362A', b:'#F4ECDE',
    w:'#FFFFFF', y:'#F2B705', s:'#2A6FDB', g:'#1F8A5B'
  };

  // '.' or ' ' = transparent. Each other char keys into PAL. 7x7 grid (some 9x9/11-row).
  var SPRITES = {
    arrowR: ['.......','....n..','.....n.','nnnnnnn','.....n.','....n..','.......'],
    arrowDownFull: ['...n...','...n...','...n...','nnnnnnn','.nnnnn.','..nnn..','...n...'],
    bolt: ['....c','...cc','..cc.','.cc..','ccc..','.cccc','..ccc','..cc.','.cc..','.c...','c....'],
    chartBar: ['.....c.','.....c.','.n...c.','.n.n.c.','.n.n.c.','nnnnnnn','.......'],
    chartLine: ['......c','.....c.','..c.c..','.c.c...','c......','.......','nnnnnnn'],
    chartPie: ['..ncc..','.nnccc.','nnncccc','nnncccc','nnnnnnn','.nnnnn.','..nnn..'],
    trendUp: ['....ccc','.....cc','....c.c','...c...','..c....','.c.....','c......'],
    trendDown: ['r......','.r.....','..r....','...r...','....r.r','.....rr','....rrr'],
    dot: ['.......','..ccc..','.ccccc.','.ccccc.','.ccccc.','..ccc..','.......'],
    doc: ['nnnnn.','n...nn','n....n','n.nn.n','n....n','n.nn.n','nnnnnn'],
    database: ['.nnnnn.','n.....n','.nnnnn.','n.....n','.nnnnn.','n.....n','.nnnnn.'],
    calendar: ['.n...n.','nnnnnnn','n.....n','n.c...n','n.....n','n.....n','nnnnnnn'],
    clock: ['..nnn..','.n...n.','n..n..n','n..nnnn','n.....n','.n...n.','..nnn..'],
    mail: ['nnnnnnn','nn...nn','n.n.n.n','n..n..n','n.....n','n.....n','nnnnnnn'],
    shield: ['.nnnnn.','n.....n','n.....n','n..c..n','.n...n.','..n.n..','...n...'],
    user: ['..nnn..','.n...n.','.n...n.','..nnn..','.nnnnn.','nnnnnnn','nn...nn'],
    search: ['.nnn...','n...n..','n...n..','n...n..','.nnn...','...nn..','....nn.'],
    money: ['...c...','..cccc.','.c.c...','..ccc..','...c.c.','.cccc..','...c...'],
    factory: ['n......','n..n..n','n.nn.nn','nnnnnnn','n.n.n.n','n.n.n.n','nnnnnnn'],
    truck: ['.......','nnnnn..','nnnnnnn','nnnnnnn','nnnnnnn','.n...n.','.......'],
    cloud: ['.......','...nn..','..nnnn.','.nnnnnn','nnnnnnn','.nnnnn.','.......'],
    code: ['..n.n..','.n...n.','n.....n','.n...n.','..n.n..','.......','.......'],
    layers: ['...n...','..nnn..','.nnnnn.','..nnn..','.nnnnn.','..nnn..','...n...'],
    bell: ['...n...','..nnn..','.nnnnn.','.nnnnn.','nnnnnnn','.......','...n...'],
    gear: ['..n...n..','..nn.nn..','nnnnnnnnn','.nn...nn.','nn.....nn','.nn...nn.','nnnnnnnnn','..nn.nn..','..n...n..'],
    chat: ['nnnnnnn','n.....n','n.....n','n.....n','nnnnnnn','..nn...','.nn....'],
    globe: ['..sss..','.s.s.s.','s..s..s','sssssss','s..s..s','.s.s.s.','..sss..'],
    bot: ['...n...','.nnnnn.','nnnnnnn','n.n.n.n','nnnnnnn','n.nnn.n','.nnnnn.'],
    brief: ['..ooo..','..o.o..','ooooooo','o.....o','o..o..o','o.....o','ooooooo'],
    plus: ['...c...','...c...','...c...','ccccccc','...c...','...c...','...c...'],
    check: ['......g','.....gg','....gg.','...gg..','g.gg...','ggg....','.g.....'],
    plug: ['.n...n.','.n...n.','nnnnnnn','nnnnnnn','.nnnnn.','...n...','...n...'],
    squares: ['cc.oo','cc.oo','.....','nn.cc','nn.cc'],
    mark: ['.nnnnncc','nn...ncc','n.....n.','n.....n.','n.....n.','nn...nn.','.nnnnn..'],
    cube: ['.ooooo.','oo.o.oo','ooooooo','o..o..o','o..o..o','o..o..o','ooooooo'],
    target: ['..nnn..','.n...n.','n.....n','n..c..n','n.....n','.n...n.','..nnn..']
  };

  var WEIGHTS = { inset: { fill: 0.86, rad: 0.14 }, fine: { fill: 0.70, rad: 0.22 } };
  function weightFor(unit, explicit){
    if (explicit && WEIGHTS[explicit]) return explicit;
    return unit <= 3 ? 'inset' : 'fine';
  }
  function dims(matrix){
    var cols = 0;
    for (var i=0;i<matrix.length;i++) cols = Math.max(cols, matrix[i].length);
    return { cols: cols, rows: matrix.length };
  }
  function build(name, unit, tint, weight){
    var m = SPRITES[name];
    if (!m) return null;
    var d = dims(m);
    var w = WEIGHTS[weightFor(unit, weight)];
    var size = Math.max(1, unit * w.fill);
    var off = (unit - size) / 2;
    var rad = (size / 2) * w.rad;
    var wrap = document.createElement('span');
    wrap.style.cssText = 'position:relative;display:inline-block;vertical-align:middle;width:'+(d.cols*unit)+'px;height:'+(d.rows*unit)+'px;';
    for (var y=0; y<m.length; y++){
      var row = m[y];
      for (var x=0; x<row.length; x++){
        var ch = row[x];
        if (ch===' ' || ch==='.') continue;
        var col = tint || PAL[ch] || '#001C43';
        var i = document.createElement('i');
        i.style.cssText = 'position:absolute;display:block;left:'+(x*unit+off)+'px;top:'+(y*unit+off)+'px;width:'+size+'px;height:'+size+'px;background:'+col+';'+(rad?'border-radius:'+rad+'px;':'');
        wrap.appendChild(i);
      }
    }
    return wrap;
  }
  function hydrate(root){
    (root||document).querySelectorAll('[data-px]:not([data-px-done])').forEach(function(el){
      var name = el.getAttribute('data-px');
      var unit = parseInt(el.getAttribute('data-unit'),10) || 5;
      var tint = el.getAttribute('data-tint') || null;
      var weight = el.getAttribute('data-weight') || null;
      var node = build(name, unit, tint, weight);
      if (node){ el.appendChild(node); el.setAttribute('data-px-done','1'); }
    });
  }
  window.Pixel = { build: build, hydrate: hydrate, SPRITES: SPRITES, PAL: PAL, WEIGHTS: WEIGHTS };
  if (document.readyState !== 'loading') hydrate();
  else document.addEventListener('DOMContentLoaded', function(){ hydrate(); });
})();

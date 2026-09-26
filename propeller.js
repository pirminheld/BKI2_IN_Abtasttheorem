(()=>{
  'use strict';
  const $=id=>document.getElementById(id),M=window.PropellerModel;
  const fmt=(v,d=2)=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:d}).format(Math.abs(v)<1e-8?0:v);
  const motion=new M.Motion(1);motion.advance(2.1);
  let request=null,last=null,lastDraw=-Infinity,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousStatus='';
  const blades=[0,120,240].map((a,i)=>`<g transform="rotate(${a} 150 150)"><path d="M139 149 C117 127 116 62 139 32 C152 16 171 24 175 39 C180 68 162 106 161 149 Z" fill="${i?'#4384ae':'#cc7408'}" stroke="${i?'#1c567d':'#945100'}" stroke-width="2"/>${i?'':'<circle cx="150" cy="46" r="7" fill="white"/>'}</g>`).join('');
  $('wheel-rotor').innerHTML=`<svg viewBox="0 0 300 300" role="img" aria-label="Propeller mit einem weiß markierten Blatt"><circle cx="150" cy="150" r="139" fill="#f3f8fc" stroke="#c6d7e5"/><path d="M150 5 V15 M285 150 H295 M150 285 V295 M5 150 H15" stroke="#7993aa" stroke-width="2"/><g id="wheel-blades">${blades}<circle cx="150" cy="150" r="23" fill="#244966" stroke="white" stroke-width="4"/><circle cx="150" cy="150" r="7" fill="#b6cbdb"/></g></svg>`;
  function plot(){
    const t=motion.displayTime,start=Math.max(0,t-2),end=start+2;
    const x=s=>55+(s-start)/2*820,y=u=>224-u*57;
    let svg='<svg viewBox="0 0 925 285" role="img" aria-label="Zeitverlauf des Propellersignals mit festen Abtastpunkten und passender Alias-Kurve">';
    for(let i=0;i<=8;i++){const s=start+i/4;svg+=`<line x1="${x(s)}" y1="42" x2="${x(s)}" y2="224" class="grid"/><text x="${x(s)}" y="248" text-anchor="middle">${fmt(s,2)}</text>`;}
    for(let u=0;u<=3;u++)svg+=`<line x1="55" y1="${y(u)}" x2="875" y2="${y(u)}" class="grid"/><text x="42" y="${y(u)+5}" text-anchor="end">${u}</text>`;
    svg+='<text x="55" y="23">Signal U / V</text><text x="875" y="278" text-anchor="end">Modellzeit t / s</text>';
    const path=(a,b,fn,steps)=>Array.from({length:steps+1},(_,i)=>{const s=a+(b-a)*i/steps;return `${i?'L':'M'}${x(s).toFixed(2)},${y(M.voltage(fn(s))).toFixed(2)}`;}).join(' ');
    const until=Math.min(end,motion.time);
    svg+=`<path d="${path(start,until,s=>motion.phaseAt(s),3200)}" class="actual-wave"/>`;
    for(let i=1;i<motion.samples.length;i++){
      const a=motion.samples[i-1],b=motion.samples[i],lo=Math.max(start,a.t),hi=Math.min(end,b.t);
      if(hi>lo&&Math.abs(b.trueDelta-b.delta)>1e-8){
        const phase=s=>a.apparent+b.delta*(s-a.t)/(b.t-a.t);
        svg+=`<path d="${path(lo,hi,phase,40)}" class="alias-wave"/>`;
      }
    }
    for(const s of motion.samples)if(s.t>=start&&s.t<=end)svg+=`<circle cx="${x(s.t)}" cy="${y(M.voltage(s.turns))}" r="4.5" class="sample"/>`;
    const actual=$('wheel-actual').checked,phase=actual?motion.phaseAt(t):motion.apparentAt(t);
    svg+=`<line x1="${x(t)}" x2="${x(t)}" y1="42" y2="224" class="now-line"/><circle class="current-value" cx="${x(t)}" cy="${y(M.voltage(phase))}" r="5.5" fill="${actual?'#005a9e':'#be6a00'}" stroke="white" stroke-width="2"/>`;
    $('wheel-signal').innerHTML=svg+'</svg>';
  }
  function render(){
    const t=motion.displayTime,actual=$('wheel-actual').checked;
    const turns=actual?motion.phaseAt(t):motion.apparentAt(t);
    const pair=motion.intervalAt(t),rate=pair[1].delta*M.RATE;
    const ambiguous=Math.abs(Math.abs(pair[1].delta)-.5)<1e-8;
    const direction=ambiguous?'Drehrichtung mehrdeutig':Math.abs(rate)<1e-8?'scheinbarer Stillstand':rate<0?'rückwärts':'vorwärts';
    $('wheel-blades').setAttribute('transform',`rotate(${((turns%1)+1)%1*360} 150 150)`);
    $('wheel-view-label').textContent=actual?'Tatsächliche Bewegung':'Beobachtete Bewegung';
    $('wheel-direction').textContent=actual?(motion.f===0?'Motor steht':'↻ tatsächliche Drehung vorwärts'):(rate<0?'↶ ':rate>0?'↻ ':'')+direction;
    $('wheel-apparent-output').textContent=fmt(Math.abs(rate),1)+' U/s';
    $('wheel-apparent-detail').textContent=direction;
    $('rotation-output').textContent=fmt(motion.f,1)+' Hz · '+fmt(motion.f*60,0)+' U/min';
    const status=motion.f===0?'Der Motor steht. Erhöhen Sie die Drehfrequenz langsam.':motion.f<M.RATE/2?'Unter 15 Hz: Die kürzeste Bewegung zwischen den Abtastbildern folgt der tatsächlichen Drehrichtung.':motion.f===M.RATE/2?'Grenzfall bei 15 Hz: Vorwärts und rückwärts passen gleichermaßen zu den erfassten Stellungen.':motion.f===M.RATE?'Bei 30 Hz: Zwischen zwei Abtastungen liegt eine volle Umdrehung. Der Propeller erscheint nach dem Übergang still.':'Über 15 Hz: Zeitliches Aliasing. Die beobachtete Bewegung kann langsamer, rückwärts oder still erscheinen.';
    if(status!==previousStatus){$('wheel-status').textContent=status;$('wheel-status').className='event '+(motion.f<M.RATE/2?'good':'caution');previousStatus=status;}
    plot();
  }
  function stop(){if(request!==null)cancelAnimationFrame(request);request=null;last=null;}
  function frame(now){
    if(last!==null)motion.advance(Math.min((now-last)/1000,1)*.25);
    last=now;
    if(now-lastDraw>=30){render();lastDraw=now;}
    request=requestAnimationFrame(frame);
  }
  function sync(){
    stop();
    $('wheel-play').textContent=paused?'Weiterlaufen':'Pause';$('wheel-play').setAttribute('aria-pressed',String(!paused));
    if(!paused&&!$('wheel').hidden&&!document.hidden)request=requestAnimationFrame(frame);
  }
  $('rotation').addEventListener('input',()=>{motion.setFrequency(Number($('rotation').value));render();});
  $('wheel-actual').addEventListener('change',render);
  $('wheel-play').addEventListener('click',()=>{paused=!paused;sync();});
  document.addEventListener('panelchange',()=>queueMicrotask(sync));
  document.addEventListener('visibilitychange',sync);
  render();sync();
})();

(()=>{
  'use strict';
  const $=id=>document.getElementById(id),M=window.Sampling;
  const fmt=(v,d=2)=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:d}).format(Math.abs(v)<1e-9?0:v);
  let time=0,request=null,last=null,lastFrame=-1;
  const state=()=>M.rotor(Number($('rotation').value),Number($('camera').value),time);
  function rotorSVG(angle,label,mini=false){
    const blades=[0,120,240].map((a,i)=>`<g transform="rotate(${a} 120 120)"><path d="M110 119 C91 98 92 49 111 27 C122 15 137 20 140 31 C147 55 133 87 130 118 Z" fill="${i?'#4384ae':'#cc7408'}" stroke="${i?'#1c567d':'#945100'}" stroke-width="2"/>${i?'':'<circle cx="121" cy="43" r="7" fill="white"/>'}</g>`).join('');
    return `<svg viewBox="0 0 240 240" role="img" aria-label="${label}"><title>${label}</title><circle cx="120" cy="120" r="108" fill="#f2f7fb" stroke="#c6d7e5"/><path d="M120 7 V17 M223 120 H233 M120 223 V233 M7 120 H17" stroke="#7993aa" stroke-width="2"/>${mini?'':'<text x="120" y="14" text-anchor="middle" font-size="10" fill="#52667c">0°</text>'}<g class="rotating" transform="rotate(${angle} 120 120)">${blades}<circle cx="120" cy="120" r="18" fill="#244966" stroke="white" stroke-width="3"/><circle cx="120" cy="120" r="6" fill="#b6cbdb"/></g></svg>`;
  }
  function stop(){
    if(request!==null)cancelAnimationFrame(request);
    request=null;last=null;$('wheel-play').textContent='Animation starten';$('wheel-play').setAttribute('aria-pressed','false');
  }
  function renderMotion(){
    const m=state();
    [['rotor-real',m.actualAngle],['rotor-sample',m.sampleAngle],['rotor-apparent',m.apparentAngle]].forEach(([id,angle])=>$(id).querySelector('.rotating').setAttribute('transform',`rotate(${angle} 120 120)`));
    $('wheel-clock').textContent=`Modellzeit: ${fmt(time,2)} s · Kamerabild ${m.frame} bei t = ${fmt(m.sampleTime,3)} s`;
    if(m.frame!==lastFrame){
      lastFrame=m.frame;
      $('frame-strip').innerHTML=Array.from({length:Math.min(6,m.frame+1)},(_,i)=>{
        const n=Math.max(0,m.frame-5)+i,s=M.rotor(m.f,m.rate,n/m.rate);
        return `<figure>${rotorSVG(s.sampleAngle,`Kamerabild ${n}`,true)}<figcaption>Bild ${n}<br><span>${fmt(s.sampleTime,3)} s</span></figcaption></figure>`;
      }).join('');
      $('sample-caption').textContent=`Bild ${m.frame} · ${fmt(m.sampleAngle,1)}° · unverändert bis zur nächsten Aufnahme`;
    }
  }
  function render(){
    const m=state();lastFrame=-1;
    $('rotation-output').textContent=fmt(m.f)+' U/s';$('camera-output').textContent=fmt(m.rate)+' Bilder/s';
    $('rotor-real').innerHTML=rotorSVG(m.actualAngle,'Tatsächliche Drehung im Uhrzeigersinn');
    $('rotor-sample').innerHTML=rotorSVG(m.sampleAngle,'Zuletzt erfasste Propellerstellung');
    $('rotor-apparent').innerHTML=rotorSVG(m.apparentAngle,'Aus den Kamerabildern gedeutete Bewegung');
    $('real-caption').textContent=`↻ ${fmt(m.f)} U/s · immer vorwärts`;
    $('apparent-caption').textContent=m.boundary?`↔ ${fmt(Math.abs(m.signed))} U/s · Richtung mehrdeutig`:m.signed===0?'0 U/s · scheinbarer Stillstand':`${m.signed<0?'↶':'↻'} ${fmt(Math.abs(m.signed))} U/s · ${m.signed<0?'rückwärts':'vorwärts'}`;
    $('wheel-status').className='event '+(m.signed===m.f&&!m.boundary?'good':'caution');
    $('wheel-status').textContent=m.boundary?`Grenzfall: Das markierte Blatt erscheint jeweils um 180° versetzt. Vorwärts und rückwärts sind gleich plausibel; rechts wird eine mögliche Richtung gezeigt.`:`Zwischen zwei Bildern: ${fmt(360*m.f/m.rate)}° tatsächlich vorwärts. Die kürzeste passende Bewegung beträgt ${fmt(m.step)}° (${m.signed<0?'rückwärts':m.signed===0?'Stillstand':'vorwärts'}). ${m.signed===m.f?'Die angenommene Bewegung stimmt mit der tatsächlichen überein.':'Die Kamerabilder passen zu einer falschen Deutung der Bewegung: zeitliches Aliasing.'}`;
    renderMotion();
  }
  function reset(){stop();time=0;render();}
  function animate(now){
    if(last!==null)time+=(now-last)/1000*.1;
    last=now;renderMotion();request=requestAnimationFrame(animate);
  }
  $('wheel-play').addEventListener('click',()=>{
    if(request!==null){stop();return;}
    $('wheel-play').textContent='Pause';$('wheel-play').setAttribute('aria-pressed','true');request=requestAnimationFrame(animate);
  });
  $('wheel-next').addEventListener('click',()=>{stop();const m=state();time=(m.frame+1)/m.rate;renderMotion();});
  $('wheel-reset').addEventListener('click',reset);
  ['rotation','camera'].forEach(id=>$(id).addEventListener('input',reset));
  document.querySelectorAll('[data-wheel]').forEach(b=>b.addEventListener('click',()=>{
    const [f,rate]={back:[9,10],still:[10,10],slow:[11,10],correct:[5,12]}[b.dataset.wheel];
    $('rotation').value=f;$('camera').value=rate;reset();
  }));
  document.addEventListener('panelchange',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  render();
})();

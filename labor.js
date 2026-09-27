(()=>{
  'use strict';
  const M=window.Sampling,$=id=>document.getElementById(id),fmt=(v,d=3)=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:d}).format(Math.abs(v)<1e-10?0:v);
  const text=(x,y,s,attr='')=>`<text x="${x}" y="${y}" ${attr}>${s}</text>`;
  const line=(x1,y1,x2,y2,cls)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
  const metric=(label,value,detail)=>`<div class="result"><span>${label}</span><b>${value}</b><small>${detail}</small></div>`;
  function plot(m,{showOriginal=true,count=m.points.length,alternate=null,cursor=false,label='Abtastpunkte und Signal'}={}){
    const x=t=>58+t/m.duration*650,y=u=>264-u*58;
    let s=`<svg class="plot" viewBox="0 0 770 325" role="img" aria-label="${label}"><title>${label}</title>`;
    const tick=m.duration===8?1:m.duration/10;
    for(let t=0;t<=m.duration;t+=tick)s+=line(x(t),58,x(t),264,'grid')+text(x(t),287,fmt(t),'text-anchor="middle"');
    for(let u=0;u<=3;u++)s+=line(58,y(u),708,y(u),'grid')+text(46,y(u)+5,u,'text-anchor="end"');
    s+=line(58,264,724,264,'axis')+line(58,264,58,48,'axis')+text(58,27,'Spannung Uₑ / V')+text(724,315,'Zeit t / ms','text-anchor="end"');
    const resolution=Math.max(800,Math.ceil(m.duration*m.f/1000*40));
    const path=fn=>Array.from({length:resolution+1},(_,i)=>{const t=i*m.duration/resolution;return `${i?'L':'M'}${x(t).toFixed(2)},${y(fn(t)).toFixed(2)}`;}).join(' ');
    if(showOriginal)s+=`<path d="${path(t=>M.signal(t,m.f))}" class="signal"/>`;
    if(alternate)s+=`<path d="${path(alternate.value)}" class="alias"/>`;
    m.points.slice(0,count).forEach(p=>{s+=line(x(p.t),264,x(p.t),y(p.u),'stem')+`<circle cx="${x(p.t)}" cy="${y(p.u)}" r="5" class="sample"/>`;});
    if(cursor&&count)s+=line(x(m.points[count-1].t),58,x(m.points[count-1].t),264,'cursor');
    return s+'</svg>';
  }
  function renderLab(){
    const m=M.sample(Number($('rate').value),Number($('offset').value),Number($('window').value),Number($('frequency').value)),a=M.alias(m),show=$('show-alias').checked;
    $('rate-output').textContent=fmt(m.rate)+' Hz';
    $('frequency-output').textContent=fmt(m.f)+' Hz';
    $('original-label').textContent='Original · '+fmt(m.f)+' Hz';
    $('lab-chart').innerHTML=plot(m,{showOriginal:$('lab-original').checked,alternate:show?a:null,label:`Sinussignal mit ${fmt(m.f)} Hertz, Messpunkte und optional ein passender Aliasverlauf`});
    $('lab-results').innerHTML=metric('Signalfrequenz f',fmt(m.f)+' Hz','T = '+fmt(m.period)+' ms')+metric('Abtastfrequenz fₐ',fmt(m.rate)+' Hz','Tₐ = '+fmt(m.interval)+' ms')+metric('Scheinbare Frequenz',a?fmt(a.frequency)+' Hz':m.kind==='boundary'?'Grenzfall':fmt(m.f)+' Hz',a?'Passend zu denselben Messwerten':m.kind==='boundary'?'Keine eindeutige Rekonstruktion':'Kein langsamerer Alias');
    $('lab-status').className='event '+(m.kind==='sufficient'?'good':'caution');
    $('lab-status').textContent=m.kind==='sufficient'?`${fmt(m.rate)} Hz > 2 · ${fmt(m.f)} Hz: Die Bedingung ist erfüllt, sofern keine Signalanteile oberhalb von ${fmt(m.f)} Hz vorhanden sind.`:m.kind==='boundary'?`${fmt(m.rate)} Hz = 2 · ${fmt(m.f)} Hz: Genau auf der Grenze. Das Ergebnis hängt von der Lage der Abtastzeitpunkte ab.`:`Aliasing: ${fmt(m.rate)} Hz < 2 · ${fmt(m.f)} Hz. Die Abtastfrequenz ist zu gering. Unterschiedliche Verläufe passen zu denselben Messwerten.`;
    $('alias-status').hidden=!show;
    if(a)$('alias-status').textContent=a.frequency===0?`Auch eine konstante Spannung von ${fmt(a.value(0))} V passt zu allen Messpunkten.`:`Eine weitere Schwingung mit ${fmt(a.frequency)} Hz passt zu denselben Messpunkten. Die orange Kurve trifft jeden grünen Punkt.`;
    else $('alias-status').textContent=m.kind==='boundary'?'Bei dieser Startlage ergibt sich keine konstante Messreihe. Der Grenzfall bleibt dennoch keine verlässliche allgemeine Einstellung. Prüfen Sie zusätzlich die Startzeit 0 ms.':`Für die vorausgesetzte Bandbegrenzung auf ${fmt(m.f)} Hz ist die Abtastrate ausreichend. Deshalb wird hier kein langsamerer Aliasverlauf eingeblendet.`;
  }
  ['rate','frequency'].forEach(id=>$(id).addEventListener('input',renderLab));
  ['offset','window','show-alias','lab-original'].forEach(id=>$(id).addEventListener('change',renderLab));
  document.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>{$('rate').value=b.dataset.rate;renderLab();}));
  $('lab-reset').addEventListener('click',()=>{$('frequency').value='250';$('rate').value='1000';$('offset').value='0';$('window').value='8';$('show-alias').checked=true;$('lab-original').checked=true;renderLab();});
  renderLab();
})();

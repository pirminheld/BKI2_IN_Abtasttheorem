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
  let revealed=false;
  function renderProblem(){
    $('problem-chart').innerHTML=plot(M.sample(250),{showOriginal:revealed,label:revealed?'Das 250-Hz-Signal und drei Messwerte von 2 Volt':'Drei Messpunkte: bei 0, 4 und 8 Millisekunden jeweils 2 Volt'});
    $('problem-answer').hidden=!revealed;$('reveal').setAttribute('aria-pressed',String(revealed));$('reveal').textContent=revealed?'Signal wieder ausblenden':'Tatsächliches Signal aufdecken';
  }
  $('reveal').addEventListener('click',()=>{revealed=!revealed;renderProblem();});
  $('problem-reset').addEventListener('click',()=>{revealed=false;renderProblem();});
  let selectedCase='A',count=0,timer=null;
  const compareModel=()=>M.sample({A:250,B:500,C:1000}[selectedCase],Number($('start').value));
  function stop(){if(timer!==null)clearInterval(timer);timer=null;$('play').textContent='Automatisch erfassen';$('play').setAttribute('aria-pressed','false');}
  function renderCompare(){
    const m=compareModel();count=Math.min(count,m.points.length);
    document.querySelectorAll('[data-case]').forEach(b=>{const active=b.dataset.case===selectedCase;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
    $('start').disabled=selectedCase!=='B';
    $('compare-results').innerHTML=metric('Signalperiode T','4 ms','f = 250 Hz')+metric('Abtastintervall Tₐ',fmt(m.interval)+' ms','Zeit zwischen zwei Erfassungen')+metric('Abtastfrequenz fₐ',fmt(m.rate)+' Hz','fₐ = 1 / Tₐ (Tₐ in s)')+metric('Intervalle pro Periode',fmt(m.ratio),'T / Tₐ');
    $('compare-chart').innerHTML=plot(m,{showOriginal:$('show-original').checked,count,cursor:true,label:`Fall ${selectedCase}: Abtastung alle ${fmt(m.interval)} Millisekunden`});
    $('time-row').innerHTML='<th scope="row">t / ms</th>'+m.points.map(p=>`<th scope="col">${fmt(p.t)}</th>`).join('');
    $('voltage-row').innerHTML='<th scope="row">Uₑ / V</th>'+m.points.map((p,i)=>`<td>${i<count?fmt(p.u):'—'}</td>`).join('');
    ['next','play','all'].forEach(id=>$(id).disabled=count===m.points.length);
    $('compare-status').textContent=count?`${count} von ${m.points.length} Punkten erfasst. Zuletzt: t = ${fmt(m.points[count-1].t)} ms; Uₑ = ${fmt(m.points[count-1].u)} V.`:`Noch keine Werte erfasst. Start bei ${fmt(m.start)} ms.`;
  }
  function resetCompare(){stop();selectedCase='A';count=0;$('start').value='0';$('show-original').checked=true;renderCompare();}
  document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{stop();selectedCase=b.dataset.case;count=0;$('start').value='0';renderCompare();}));
  $('start').addEventListener('change',()=>{stop();count=0;renderCompare();});
  $('show-original').addEventListener('change',renderCompare);
  function next(){const m=compareModel();if(count<m.points.length)count++;if(count===m.points.length)stop();renderCompare();}
  $('next').addEventListener('click',next);
  $('play').addEventListener('click',()=>{if(timer!==null){stop();return;}$('play').textContent='Pause';$('play').setAttribute('aria-pressed','true');timer=setInterval(next,450);});
  $('all').addEventListener('click',()=>{stop();count=compareModel().points.length;renderCompare();});
  $('clear').addEventListener('click',()=>{stop();count=0;renderCompare();});
  $('compare-reset').addEventListener('click',resetCompare);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
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
  $('lab-reset').addEventListener('click',()=>{$('frequency').value='250';$('rate').value='400';$('offset').value='0';$('window').value='20';$('show-alias').checked=true;$('lab-original').checked=true;renderLab();});
  $('rule-reveal').addEventListener('click',()=>{const visible=$('theorem').hidden;$('theorem').hidden=!visible;$('rule-reveal').setAttribute('aria-expanded',String(visible));$('rule-reveal').textContent=visible?'Abtasttheorem ausblenden':'Abtasttheorem aufdecken';});
  $('check-choice').addEventListener('click',()=>{const chosen=document.querySelector('input[name="choice"]:checked');$('choice-feedback').className='event';if(!chosen){$('choice-feedback').textContent='Bitte wählen Sie zunächst eine Abtastfrequenz.';return;}const ok=chosen.value==='1000';$('choice-feedback').classList.add(ok?'good':'caution');$('choice-feedback').textContent=ok?'Richtig: 1000 Hz > 2 · 300 Hz. 500 Hz liegt darunter; 600 Hz liegt genau auf der Grenze.':chosen.value==='600'?'600 Hz ist genau das Doppelte. Die allgemeine Bedingung verlangt mehr als 600 Hz.':'500 Hz liegt unter 2 · 300 Hz = 600 Hz. Die Abtastfrequenz muss größer als 600 Hz sein.';});
  const resetFeedback=()=>{$('choice-feedback').className='event';$('choice-feedback').textContent='Noch keine Auswahl geprüft.';};
  $('choice-reset').addEventListener('click',()=>{document.querySelectorAll('input[name="choice"]').forEach(i=>i.checked=false);resetFeedback();});
  document.querySelectorAll('input[name="choice"]').forEach(i=>i.addEventListener('change',resetFeedback));
  function panel(id){if(!['problem','compare','lab','wheel','rule'].includes(id))id='problem';stop();document.dispatchEvent(new Event('panelchange'));document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==id);document.querySelectorAll('[data-panel]').forEach(b=>{const active=b.dataset.panel===id;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});}
  function navigate(id){panel(id);history.replaceState(null,'','#'+id);}
  document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.panel)));
  $('to-compare').addEventListener('click',()=>{navigate('compare');$('compare-title').scrollIntoView({block:'start'});});
  window.addEventListener('hashchange',()=>panel(location.hash.slice(1)));
  renderProblem();renderCompare();renderLab();panel(location.hash.slice(1));
})();

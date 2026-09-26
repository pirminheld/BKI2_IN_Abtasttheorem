'use strict';
const assert=require('node:assert/strict'),M=require('./propeller-model.js');let checks=0;
const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);checks++;};
near(M.RATE,30);
function audit(m){
  m.samples.forEach((s,i)=>{
    near(M.voltage(s.turns),M.voltage(s.apparent));
    near(m.phaseAt(s.t),s.turns);
    near(M.voltage(m.apparentAt(s.t)),M.voltage(s.turns));
    if(i)near(s.t-m.samples[i-1].t,M.INTERVAL);
  });
}
for(const [f,expected] of [[0,0],[1,1],[5,5],[14.9,14.9],[15,-15],[15.1,-14.9],[25,-5],[30,0],[35,5],[40,10]]){
  const m=new M.Motion(f);m.advance(2.1);audit(m);
  near(m.samples.at(-1).delta*M.RATE,expected);
  // Constant speeds generate the expected sine between the samples as well.
  for(let i=1;i<=60;i++){
    const t=(i-.4)/M.RATE;
    near(M.voltage(m.apparentAt(t)),M.voltage(expected*t));
  }
}
const m=new M.Motion(1);
for(let i=0;i<1200;i++){
  if(i%11===0){
    const phase=m.phaseAt(m.time),before=m.samples.map(s=>({...s})),time=m.time;
    m.setFrequency((i%401)/10);
    near(m.time,time);near(m.phaseAt(m.time),phase);
    assert.deepEqual(m.samples,before);checks++;
  }
  m.advance(.013);audit(m);
}
assert.ok(m.samples.length<=3*M.RATE+3);checks++;
const paused=m.time;m.advance(0);near(m.time,paused);
for(const f of [-1,41,NaN,Infinity]){assert.throws(()=>m.setFrequency(f),RangeError);checks++;}
console.log(`${checks} Propeller-Pruefungen bestanden: feste Abtastung, Phasenkontinuitaet, Messwerterhalt und Alias.`);

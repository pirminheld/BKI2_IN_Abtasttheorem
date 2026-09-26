'use strict';
const assert=require('node:assert/strict'),M=require('./model.js');let checks=0;
function near(a,b){assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);checks++;}
for(const [rate,start,expected] of [[250,0,[2,2,2]],[500,0,[2,2,2,2,2]],[1000,0,[2,3,2,1,2,3,2,1,2]],[500,1,[3,1,3,1]]]){
 const m=M.sample(rate,start);assert.equal(m.points.length,expected.length);checks++;
 m.points.forEach((p,i)=>near(p.u,expected[i]));
}
for(const rate of [100,125,175,200,250,300,350,400,425,475,500,525,750,1000,1500])for(const start of [0,.25,.5,.75,1])for(const f of [125,250,375]){
 const m=M.sample(rate,start,20,f),a=M.alias(m);
 m.points.forEach((p,i)=>{near(p.t,start+1000*i/rate);assert.ok(p.t<=20+1e-8);checks++;if(a)near(a.value(p.t),p.u);});
 if(m.kind==='sufficient'){assert.equal(a,null);checks++;}
 if(m.kind==='undersampled'){assert.ok(a.frequency<=rate/2+1e-8);checks++;}
}
assert.equal(M.alias(M.sample(400,0,20)).frequency,150);checks++;
assert.equal(M.sample(500).kind,'boundary');checks++;
assert.equal(M.alias(M.sample(500,1)),null);checks++;
for(const args of [[0],[-1],[NaN],[250,-1],[250,9,8],[Infinity],[250,0,8,0],[10000000,0,20]]){assert.throws(()=>M.sample(...args),RangeError);checks++;}
console.log(`${checks} fachliche Prüfungen bestanden.`);

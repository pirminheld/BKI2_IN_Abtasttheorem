(function(root){
  'use strict';
  const signal=(tMs,f=250)=>2+Math.sin(2*Math.PI*f*tMs/1000);
  function sample(rate,start=0,duration=8,f=250){
    if(![rate,start,duration,f].every(Number.isFinite)||rate<=0||f<=0||start<0||duration<start||rate*duration/1000>10000)throw new RangeError('Ungültige Signal- oder Abtastwerte');
    const interval=1000/rate;
    const points=Array.from({length:Math.floor((duration-start)/interval+1e-10)+1},(_,i)=>{const t=start+i*interval;return {t,u:signal(t,f)};});
    const tolerance=1e-9;
    const kind=rate>2*f+tolerance?'sufficient':Math.abs(rate-2*f)<=tolerance?'boundary':'undersampled';
    return {rate,start,duration,f,interval,period:1000/f,ratio:rate/f,points,kind};
  }
  function alias(m){
    // A lower-frequency sinusoid that agrees at t = start + k/rate.
    if(m.kind==='sufficient')return null;
    if(m.kind==='boundary'){
      const constant=Math.abs(Math.sin(2*Math.PI*m.f*m.start/1000))<1e-9;
      return constant?{frequency:0,value:()=>2}:null;
    }
    const signed=m.f-Math.round(m.f/m.rate)*m.rate;
    const phase=2*Math.PI*(m.f-signed)*m.start/1000;
    return {frequency:Math.abs(signed),signed,phase,value:t=>2+Math.sin(2*Math.PI*signed*t/1000+phase)};
  }
  function rotor(f,rate,t=0){
    if(![f,rate,t].every(Number.isFinite)||f<=0||rate<=0||t<0)throw new RangeError('Ungültige Propellerwerte');
    const signed=f-Math.round(f/rate)*rate;
    const frame=Math.floor(t*rate+1e-9),sampleTime=frame/rate;
    const angle=turns=>((turns%1)+1)%1*360;
    return {f,rate,signed,frame,sampleTime,actualAngle:angle(f*t),sampleAngle:angle(f*sampleTime),apparentAngle:angle(signed*t),step:360*signed/rate,boundary:Math.abs(Math.abs(signed)-rate/2)<1e-9};
  }
  const api={signal,sample,alias,rotor};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Sampling=Object.freeze(api);
})(typeof window!=='undefined'?window:this);

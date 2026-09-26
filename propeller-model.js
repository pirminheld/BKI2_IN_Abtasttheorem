(function(root){
  'use strict';
  const RATE=30,INTERVAL=1/RATE,TAU=2*Math.PI;
  const voltage=turns=>2+Math.sin(TAU*turns);
  const fold=turns=>turns-Math.floor(turns+.5+1e-10);
  class Motion {
    constructor(f=1){
      this.time=0;this.turns=0;this.f=f;this.nextFrame=1;
      this.segments=[{t:0,turns:0,f}];
      this.samples=[{t:0,turns:0,apparent:0,delta:0,trueDelta:0}];
      this.setFrequency(f);
    }
    setFrequency(f){
      if(!Number.isFinite(f)||f<0||f>40)throw new RangeError('Drehfrequenz muss zwischen 0 und 40 Hz liegen.');
      this.f=f;
      const s={t:this.time,turns:this.turns,f};
      if(this.segments.at(-1).t===this.time)this.segments[this.segments.length-1]=s;
      else this.segments.push(s);
    }
    advance(dt){
      if(!Number.isFinite(dt)||dt<0||dt>10)throw new RangeError('Ungültiger Zeitschritt');
      const end=this.time+dt;
      while(this.nextFrame/RATE<=end+1e-10){
        const t=this.nextFrame/RATE,turns=this.turns+this.f*(t-this.time),prev=this.samples.at(-1);
        const trueDelta=turns-prev.turns,delta=fold(trueDelta);
        this.samples.push({t,turns,apparent:prev.apparent+delta,delta,trueDelta});
        this.nextFrame++;
      }
      this.turns+=this.f*dt;this.time=end;
      const cutoff=this.time-3;
      while(this.samples.length>2&&this.samples[1].t<cutoff)this.samples.shift();
      while(this.segments.length>1&&this.segments[1].t<this.samples[0].t)this.segments.shift();
    }
    phaseAt(t){
      for(let i=this.segments.length-1;i>=0;i--){
        const s=this.segments[i];if(t>=s.t-1e-10)return s.turns+s.f*(t-s.t);
      }
      throw new RangeError('Zeit liegt außerhalb der gespeicherten Bewegung');
    }
    intervalAt(t){
      for(let i=1;i<this.samples.length;i++)if(t<=this.samples[i].t+1e-10)return [this.samples[i-1],this.samples[i]];
      return this.samples.slice(-2);
    }
    apparentAt(t){
      const [a,b]=this.intervalAt(t);
      if(!b)return a.apparent;
      return a.apparent+(b.apparent-a.apparent)*(t-a.t)/(b.t-a.t);
    }
    get displayTime(){return Math.max(0,this.time-INTERVAL);}
  }
  const api={RATE,INTERVAL,voltage,fold,Motion};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PropellerModel=Object.freeze(api);
})(typeof window!=='undefined'?window:this);

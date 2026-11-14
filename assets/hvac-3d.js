(()=>{'use strict';
const root=document.getElementById('hvac3d');if(!root)return;
const world=document.getElementById('hvacWorld'),stage=document.getElementById('hvacStage');
const byId=id=>document.getElementById(id);
const sliders={x:byId('hvacX'),y:byId('hvacY'),z:byId('hvacZ'),zoom:byId('hvacZoom')};
const outputs={x:byId('hvacXOut'),y:byId('hvacYOut'),z:byId('hvacZOut'),zoom:byId('hvacZoomOut')};
const status=byId('hvacStageStatus'),autoBtn=byId('hvacAuto');
let rot={x:0,y:-20,z:0},zoom=100,auto=true,drag=null;
const parts={
 compressor:['Compressor','Memampat dan mengalirkan refrigerant. Jenis pemacu boleh menggunakan tali sawat enjin atau motor elektrik pada kenderaan hibrid/EV.'],
 condenser:['Condenser','Membuang haba refrigerant ke udara melalui aliran udara dan kipas.'],
 txv:['Expansion Valve','Mengawal aliran refrigerant masuk ke evaporator mengikut keperluan sistem.'],
 evaporator:['Evaporator / Cooling Coil','Menyerap haba daripada udara kabin. Kelembapan boleh memeluwap pada permukaannya.'],
 blower:['Blower Fan','Menggerakkan udara melalui evaporator dan saluran HVAC ke ruang kabin.'],
 dryer:['Receiver Drier','Menapis zarah dan menyerap kelembapan dalam sistem yang menggunakan receiver-drier.'],
 hoses:['Hoses & Pipes','Menghubungkan komponen bagi laluan tekanan tinggi dan rendah.']
};
const sensors={
 'pressure-high':['Sensor 1 · Tekanan bahagian tinggi','Memantau tekanan sisi tinggi. Sesetengah kenderaan menggunakan pressure transducer atau pressure switch; lokasi dan logiknya berbeza.'],
 'condenser-temp':['Sensor 2 · Suhu condenser','Membantu sistem kawalan menilai suhu penukar haba atau keadaan aliran udara, jika dilengkapi.'],
 'refrigerant-pressure':['Sensor 3 · Tekanan refrigerant','Isyarat tekanan refrigerant digunakan oleh ECU/HVAC untuk kawalan compressor dan perlindungan sistem.'],
 'evaporator-temp':['Sensor 4 · Suhu evaporator','Mengelakkan evaporator membeku dan membantu kawalan suhu penyejukan.'],
 'cabin-temp':['Sensor 5 · Suhu kabin','Mengukur suhu ruang kabin untuk kawalan automatik, jika sistem mempunyai sensor ini.'],
 'sunload':['Sensor 6 · Sunload','Mengesan beban haba cahaya matahari dan membantu pelarasan pendinginan kabin.'],
 'ambient-temp':['Sensor 7 · Suhu luar','Mengukur suhu udara persekitaran; boleh mempengaruhi paparan dan strategi HVAC.']
};
function paint(){
 world.style.transform='translate(calc(-50% + var(--pan-x,0px)),calc(-50% + var(--pan-y,0px))) perspective(950px) rotateX('+rot.x+'deg) rotateY('+rot.y+'deg) rotateZ('+rot.z+'deg) scale('+zoom/100+')';
 for(const k of ['x','y','z']){if(sliders[k])sliders[k].value=rot[k];if(outputs[k])outputs[k].textContent=Math.round(rot[k])+'°'}
 if(sliders.zoom)sliders.zoom.value=zoom;if(outputs.zoom)outputs.zoom.textContent=Math.round(zoom)+'%';
}
function pause(){auto=false;root.classList.add('hvac-paused');if(autoBtn){autoBtn.textContent='Sambung putaran';autoBtn.setAttribute('aria-pressed','false')}if(status)status.textContent='PUTARAN MANUAL'}
function selectPart(key){
 root.querySelectorAll('[data-part]').forEach(el=>el.classList.toggle('is-selected',el.dataset.part===key));
 root.querySelectorAll('[data-focus-part]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.focusPart===key)));
 const info=byId('hvacInfo');if(info&&parts[key]){info.replaceChildren();const strong=document.createElement('strong');strong.textContent=parts[key][0];info.append(strong,document.createTextNode(parts[key][1]))}
}
function selectSensor(key){
 pause();root.querySelectorAll('[data-sensor]').forEach(el=>el.classList.toggle('is-selected',el.dataset.sensor===key));
 root.querySelectorAll('[data-sensor-select]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.sensorSelect===key)));
 const info=byId('hvacInfo');if(info&&sensors[key]){info.replaceChildren();const strong=document.createElement('strong');strong.textContent=sensors[key][0];info.append(strong,document.createTextNode(sensors[key][1]))}
}
root.querySelectorAll('[data-focus-part]').forEach(btn=>btn.addEventListener('click',()=>{pause();selectPart(btn.dataset.focusPart)}));
root.querySelectorAll('[data-part]').forEach(el=>el.addEventListener('click',()=>{pause();selectPart(el.dataset.part)}));
root.querySelectorAll('[data-sensor],[data-sensor-select]').forEach(el=>el.addEventListener('click',()=>selectSensor(el.dataset.sensor||el.dataset.sensorSelect)));
Object.entries(sliders).forEach(([key,input])=>input&&input.addEventListener('input',()=>{pause();if(key==='zoom')zoom=Number(input.value);else rot[key]=Number(input.value);paint()}));
if(autoBtn)autoBtn.addEventListener('click',()=>{const wasRunning=auto;auto=!auto;root.classList.toggle('hvac-paused',!auto);autoBtn.textContent=auto?'Henti putaran':'Sambung putaran';autoBtn.setAttribute('aria-pressed',String(auto));if(status)status.textContent=auto?'BERPUTAR AUTOMATIK':'PUTARAN MANUAL';if(auto&&!wasRunning)requestAnimationFrame(animate)});
const reset=byId('hvacReset');if(reset)reset.addEventListener('click',()=>{rot={x:0,y:-20,z:0};zoom=100;world.style.setProperty('--pan-x','0px');world.style.setProperty('--pan-y','0px');paint();pause()});
function point(e){return{x:e.clientX,y:e.clientY}}
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;pause();drag={...point(e),rot:{...rot},shift:e.shiftKey};stage.setPointerCapture?.(e.pointerId)});
stage.addEventListener('pointermove',e=>{if(!drag)return;const p=point(e),dx=p.x-drag.x,dy=p.y-drag.y;if(drag.shift){world.style.setProperty('--pan-x',dx+'px');world.style.setProperty('--pan-y',dy+'px')}else{rot.y=drag.rot.y+dx*.55;rot.x=Math.max(-85,Math.min(85,drag.rot.x-dy*.45));paint()}});
const end=()=>{drag=null};stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);stage.addEventListener('lostpointercapture',end);
stage.addEventListener('wheel',e=>{e.preventDefault();pause();zoom=Math.max(65,Math.min(145,zoom+(e.deltaY<0?5:-5)));paint()},{passive:false});
stage.addEventListener('keydown',e=>{const step=e.shiftKey?12:5;if(e.key==='ArrowLeft')rot.y-=step;else if(e.key==='ArrowRight')rot.y+=step;else if(e.key==='ArrowUp')rot.x+=step;else if(e.key==='ArrowDown')rot.x-=step;else return;e.preventDefault();pause();paint()});
document.querySelectorAll('[data-system-mode]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-system-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));const ev=btn.dataset.systemMode==='ev';const desc=byId('systemModeDescription');if(desc)desc.textContent=ev?'Mod Hybrid / EV: compressor dipacu motor elektrik. Pengurusan suhu bateri voltan tinggi bergantung pada reka bentuk dan kelengkapan kenderaan.':'Mod petrol / diesel: compressor lazimnya dipacu enjin melalui tali sawat. Susunan sebenar bergantung pada model dan varian.'}));
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){auto=false;root.classList.add('hvac-paused');if(autoBtn){autoBtn.textContent='Sambung putaran';autoBtn.setAttribute('aria-pressed','false')}if(status)status.textContent='GERAKAN AUTOMATIK DIJEDA'}
function animate(){if(auto&&!drag){rot.y+=.12;paint()}if(auto)requestAnimationFrame(animate)}paint();if(auto)requestAnimationFrame(animate);
selectPart('compressor');
})();
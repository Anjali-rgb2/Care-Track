const CAP=74,FEV=37.5,BENCH=85,KEY='caretrack.v1';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const iso=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const ago=d=>Math.round((new Date(iso(0))-new Date(d))/864e5);
const NAMES={Nurse:'Nurse Priya Nair',Doctor:'Dr. Arjun Mehta',Admin:'Admin Kavita Rao'};
let S,role=localStorage.getItem('caretrack.role')||'Nurse',tab='Dashboard',q='',flt='all';
function rng(s){return()=>(s=(s*16807)%2147483647)/2147483647}
function seed(){const r=rng(42),pick=a=>a[Math.floor(r()*a.length)];
const F=['Aarav','Diya','Rohan','Meera','Kabir','Ananya','Vikram','Sana','Ishaan','Neha','Arjun','Priya','Rahul','Fatima','Sameer','Tara','Dev','Zoya','Manav','Riya','Aditya','Kiran','Nikhil','Pooja'],L=['Sharma','Patel','Khan','Iyer','Gupta','Desai','Joshi','Shah','Reddy','Menon','Verma','Kulkarni','Singh','Naik','Pillai'];
const P=[];let id=1;const nm=()=>pick(F)+' '+pick(L);
const docs=['Dr. Arjun Mehta','Dr. Sunita Rao','Dr. Farhan Ali'];
for(let i=0;i<64;i++){const a=Math.floor(r()*10),p={id:'P'+String(id++).padStart(3,'0'),name:nm(),age:18+Math.floor(r()*65),sex:r()<.5?'F':'M',bed:i+1,admitted:iso(a),status:'active',temps:{},visits:[],approval:null,note:''};
const fev=r()<.22;for(let d=a;d>=0;d--){if(d>0&&r()<.04)continue;if(d===0&&r()<.35)continue;const n=(d>0&&r()<.03)?2:1;for(let k=0;k<n;k++){const hi=fev&&d<=2+Math.floor(r()*3);const t=+(hi?37.6+r()*1.6:36.3+r()*.9).toFixed(1);(p.temps[iso(d)]=p.temps[iso(d)]||[]).push({t,by:'Nurse Priya Nair',at:(6+k*5+Math.floor(r()*4))+':'+String(Math.floor(r()*60)).padStart(2,'0')})}}
for(let v=0;v<Math.floor(a/3)+1;v++)p.visits.push({date:iso(Math.max(0,a-v*3)),doc:pick(docs),note:pick(['Stable, continue monitoring','Cough improving','Hydration advised','Oxygen saturation normal','Review in 48h'])});
P.push(p)}
P.forEach(p=>{if(!p.approval&&elig(p).ok&&r()<.4){p.approval={by:'Dr. Sunita Rao',on:iso(0)}}});
for(let i=0;i<112;i++)P.push({id:'P'+String(id++).padStart(3,'0'),name:nm(),age:18+Math.floor(r()*65),sex:r()<.5?'F':'M',bed:null,admitted:iso(70),status:'discharged',outOn:iso(1+Math.floor(r()*60)),temps:{},visits:[],approval:{by:pick(docs)}});
for(let i=0;i<14;i++)P.push({id:'P'+String(id++).padStart(3,'0'),name:nm(),age:55+Math.floor(r()*30),sex:r()<.5?'F':'M',bed:null,admitted:iso(70),status:'deceased',outOn:iso(1+Math.floor(r()*60)),temps:{},visits:[],approval:null});
return{p:P,n:id}}
function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&v.p)return v}catch(e){}return seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function toast(m,er){const t=$('#toast');t.textContent=m;t.className=er?'er':'';t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',3200)}
const act=()=>S.p.filter(p=>p.status==='active'),by=id=>S.p.find(p=>p.id===id),rd=(p,d)=>p.temps[iso(d)]||[];
function flags(p){const m=[],dup=[];for(let d=ago(p.admitted);d>=0;d--){const n=rd(p,d).length;if(d>0&&n===0)m.push(iso(d));if(n>1)dup.push(iso(d))}return{m,dup}}
function elig(p){if(ago(p.admitted)<3)return{ok:false,why:'Admitted less than 3 full days ago'};
for(let d=1;d<=3;d++){const r=rd(p,d);if(!r.length)return{ok:false,why:'No temperature recorded on '+iso(d)};if(Math.max(...r.map(x=>x.t))>=FEV)return{ok:false,why:'Fever (≥'+FEV+'°C) on '+iso(d)}}
const t=rd(p,0);if(t.length&&Math.max(...t.map(x=>x.t))>=FEV)return{ok:false,why:'Fever recorded today'};return{ok:true,why:'3 full fever-free days confirmed'}}
function stat(p){const f=flags(p),e=elig(p),t=rd(p,0);const hot=Object.values(p.temps).flat().length&&[0,1,2].some(d=>rd(p,d).some(x=>x.t>=FEV));
if(p.approval&&e.ok)return['rd','Approved'];if(e.ok)return['rd','Eligible'];if(hot)return['fv','Fever'];if(f.m.length||f.dup.length)return['wn','Flagged'];return['ok','Monitoring']}
function surv(days){const o=S.p.filter(p=>(p.status==='discharged'||p.status==='deceased')&&(!days||ago(p.outOn)<=days));const dis=o.filter(p=>p.status==='discharged').length,dec=o.length-dis;return{dis,dec,rate:o.length?dis/o.length*100:null}}
const can={Nurse:['Dashboard','Patients','Temperatures','Visits','Discharge','Survival'],Doctor:['Dashboard','Patients','Temperatures','Visits','Discharge','Survival'],Admin:['Dashboard','Patients','Temperatures','Visits','Discharge','Survival']};
function render(){$('#role').value=role;$('#nav').innerHTML=can[role].map(t=>`<button class="${t===tab?'on':''}" data-t="${t}">${t}</button>`).join('');$('#main').innerHTML=V[tab]();labelTables($('#main'))}
function labelTables(root){root.querySelectorAll('table').forEach(t=>{const h=[...t.querySelectorAll('th')].map(x=>x.textContent);if(!h.length)return;t.classList.add('stack');t.querySelectorAll('tr').forEach(r=>[...r.children].forEach((c,i)=>{if(c.tagName==='TD')c.setAttribute('data-label',h[i]||'')}))})}
const tg=(c,t)=>`<span class="tg t-${c}">${t}</span>`;
const V={
Dashboard(){const a=act(),oc=a.length,s=surv(),due=a.filter(p=>!rd(p,0).length).length,fl=a.reduce((n,p)=>{const f=flags(p);return n+f.m.length+f.dup.length},0),ap=a.filter(p=>p.approval&&elig(p).ok).length,el=a.filter(p=>!p.approval&&elig(p).ok).length,fv=a.filter(p=>stat(p)[0]==='fv').length;
const beds=Array.from({length:CAP},(_,i)=>{const p=a.find(x=>x.bed===i+1);return p?`<button class="bed ${stat(p)[0]}" title="${esc(p.name)}" data-p="${p.id}">${i+1}</button>`:`<button class="bed" data-free="${i+1}" title="Free">${i+1}</button>`}).join('');
return`<div class="grid k"><div class="c"><div class="mu">Occupancy</div><div class="big">${oc}/${CAP}</div><div class="bar"><i style="width:${oc/CAP*100}%"></i></div><div class="mu">${CAP-oc} beds free</div></div>
<div class="c"><div class="mu">Survival rate (all time)</div><div class="big" style="color:var(${s.rate>=BENCH?'--ok':'--er'})">${s.rate?.toFixed(1)}%</div><div class="mu">Benchmark ${BENCH}% · ${s.dis} discharged, ${s.dec} deceased</div></div>
<div class="c"><div class="mu">Temperatures still due today</div><div class="big">${due}</div><div class="mu">${fv} patients with recent fever</div></div>
<div class="c"><div class="mu">Record flags</div><div class="big" style="color:var(${fl?'--wa':'--ok'})">${fl}</div><div class="mu">missing or duplicate readings</div></div>
<div class="c"><div class="mu">Discharge pipeline</div><div class="big">${el} / ${ap}</div><div class="mu">awaiting doctor / ready for admin</div></div></div>
<div class="grid two" style="margin-top:12px"><div class="c"><h3>Bed map</h3><div class="beds">${beds}</div><p class="mu">${tg('ok','Monitoring')} ${tg('wa','Flagged')} ${tg('er','Fever')} ${tg('ok','Eligible')} Green solid = eligible or approved. Click a bed for details; empty beds admit a patient.</p></div>
<div class="c"><h3>Needs attention</h3><div class="tw"><table>${a.filter(p=>flags(p).m.length||flags(p).dup.length).slice(0,8).map(p=>{const f=flags(p);return`<tr class="pill" data-p="${p.id}"><td>${p.name}<div class="mu">Bed ${p.bed}</div></td><td>${f.m.length?tg('wa',f.m.length+' missing'):''} ${f.dup.length?tg('er',f.dup.length+' duplicate'):''}</td></tr>`}).join('')||'<tr><td>No flagged records.</td></tr>'}</table></div></div></div>`},
Patients(){const a=S.p.filter(p=>flt==='all'?p.status==='active':p.status===flt).filter(p=>(p.name+p.id).toLowerCase().includes(q.toLowerCase()));
return`<div class="row sp"><div class="row"><input id="q" placeholder="Search name or ID" value="${esc(q)}"><select id="flt">${['all|Active','discharged|Discharged','deceased|Deceased'].map(o=>{const[v,l]=o.split('|');return`<option value="${v}" ${flt===v?'selected':''}>${l}</option>`}).join('')}</select></div>${role==='Admin'?'<button class="b" data-admit>Admit patient</button>':''}</div>
<div class="c tw" style="margin-top:12px"><table><tr><th>ID</th><th>Name</th><th>Age/Sex</th><th>Bed</th><th>Admitted</th><th>Status</th></tr>${a.slice(0,100).map(p=>{const s=stat(p);return`<tr class="pill" data-p="${p.id}"><td>${p.id}</td><td>${esc(p.name)}</td><td>${p.age}/${p.sex}</td><td>${p.bed||'—'}</td><td>${p.admitted}</td><td>${p.status==='active'?tg(s[0]==='fv'?'er':s[0]==='wn'?'wa':s[0]==='rd'?'ok':'bl',s[1]):tg(p.status==='deceased'?'er':'mu',p.status)}</td></tr>`}).join('')}</table></div>`},
Temperatures(){const a=act().sort((x,y)=>x.bed-y.bed);return`<div class="note">Normal below ${FEV}°C. One reading per patient per day is expected; a second reading is flagged as a duplicate, and days without a reading are flagged as missing.${role!=='Nurse'?' Only nurses can record temperatures.':''}</div><div class="c tw"><table><tr><th>Bed</th><th>Patient</th><th>Today</th><th>Flags</th><th>Record °C</th></tr>${a.map(p=>{const t=rd(p,0),f=flags(p);return`<tr><td>${p.bed}</td><td class="pill" data-p="${p.id}">${esc(p.name)}</td><td>${t.length?t.map(x=>tg(x.t>=FEV?'er':'ok',x.t.toFixed(1))).join(' '):tg('mu','Due')}</td><td>${f.m.length?tg('wa',f.m.length+' missing'):''} ${f.dup.length?tg('er',f.dup.length+' dup'):''}</td><td>${role==='Nurse'?`<form class="row tf" data-id="${p.id}"><input type="number" step="0.1" min="34" max="42" required style="width:80px"><button class="b sm">Save</button></form>`:'—'}</td></tr>`}).join('')}</table></div>`},
Visits(){const a=act();const all=a.flatMap(p=>p.visits.map(v=>({...v,p}))).sort((x,y)=>y.date.localeCompare(x.date)).slice(0,25),un=a.filter(p=>!p.visits.some(v=>v.date===iso(0)));
return`<div class="grid two"><div class="c"><h3>Not yet seen today (${un.length})</h3><div class="tw"><table>${un.slice(0,15).map(p=>`<tr><td>${esc(p.name)}<div class="mu">Bed ${p.bed}</div></td><td>${role==='Doctor'?`<button class="b sm" data-visit="${p.id}">Log visit</button>`:''}</td></tr>`).join('')||'<tr><td>All patients seen today.</td></tr>'}</table></div></div>
<div class="c"><h3>Recent visits</h3><div class="tw"><table>${all.map(v=>`<tr><td>${v.date}</td><td>${esc(v.p.name)}</td><td>${esc(v.doc)}<div class="mu">${esc(v.note)}</div></td></tr>`).join('')}</table></div></div></div>${role!=='Doctor'?'<p class="mu">Switch to the Doctor role to log visits.</p>':''}`},
Discharge(){const a=act(),el=a.filter(p=>elig(p).ok),pend=el.filter(p=>!p.approval),rdy=el.filter(p=>p.approval),blocked=a.filter(p=>p.approval&&!elig(p).ok),no=a.filter(p=>!p.approval&&!elig(p).ok);
const row=(p,btn)=>`<tr><td class="pill" data-p="${p.id}">${esc(p.name)}<div class="mu">Bed ${p.bed}</div></td><td>${btn}</td></tr>`;
return`<div class="note">Rule: a patient needs 3 full days (yesterday and the two before) with a recorded temperature each day, all below ${FEV}°C. The doctor approves first; the admin then discharges.</div><div class="grid two">
<div class="c"><h3>Awaiting doctor approval (${pend.length})</h3><table>${pend.map(p=>row(p,role==='Doctor'?`<button class="b sm" data-ap="${p.id}">Approve</button>`:tg('wa','Doctor needed'))).join('')||'<tr><td>None.</td></tr>'}</table></div>
<div class="c"><h3>Approved, ready to discharge (${rdy.length})</h3><table>${rdy.map(p=>row(p,role==='Admin'?`<button class="b sm" data-dc="${p.id}">Discharge</button> `:tg('ok','Approved')+(role==='Doctor'?` <button class="b s sm" data-rv="${p.id}">Revoke</button>`:''))).join('')||'<tr><td>None.</td></tr>'}</table></div>
<div class="c"><h3>Approval no longer valid (${blocked.length})</h3><table>${blocked.map(p=>row(p,'<span class="mu">'+elig(p).why+'</span>')).join('')||'<tr><td>None.</td></tr>'}</table></div>
<div class="c"><h3>Not yet eligible (${no.length})</h3><div class="tw" style="max-height:340px;overflow:auto"><table>${no.map(p=>row(p,'<span class="mu">'+elig(p).why+'</span>')).join('')}</table></div></div></div>`},
Survival(){const x=surv(),w=surv(30),w7=surv(7),pr=r=>r==null?'n/a':r.toFixed(1)+'%',dead=S.p.filter(p=>p.status==='deceased').sort((a,b)=>b.outOn.localeCompare(a.outOn)).slice(0,10);
const gap=x.rate-BENCH;return`<div class="grid k">${[['All time',x],['Last 30 days',w],['Last 7 days',w7]].map(([l,s])=>`<div class="c"><div class="mu">${l}</div><div class="big" style="color:var(${s.rate==null?'--mu':s.rate>=BENCH?'--ok':'--er'})">${pr(s.rate)}</div><div class="bar"><i style="width:${s.rate||0}%;background:var(${s.rate>=BENCH?'--ok':'--er'})"></i><b style="left:${BENCH}%"></b></div><div class="mu">${s.dis} recovered, ${s.dec} deceased</div></div>`).join('')}</div>
<div class="c" style="margin-top:12px"><h3>Benchmark ${BENCH}%</h3><p>${gap>=0?tg('ok','Above benchmark')+' by '+gap.toFixed(1)+' points.':tg('er','Below benchmark')+' by '+Math.abs(gap).toFixed(1)+' points. Review clinical protocols.'}</p><p class="mu">Survival rate = discharged ÷ (discharged + deceased). Active patients are excluded until an outcome is recorded.</p></div>
<div class="c" style="margin-top:12px"><h3>Recent deaths</h3><table>${dead.map(p=>`<tr><td>${esc(p.name)}</td><td>${p.age}/${p.sex}</td><td>${p.outOn}</td></tr>`).join('')}</table></div>`}};
function modal(h,t){$('#dlg').innerHTML=`<div class="dh"><b>${t}</b><button class="b s sm" onclick="dlg.close()">Close</button></div><div class="db">${h}</div>`;$('#dlg').showModal();labelTables($('#dlg'))}
const dlg=$('#dlg');
function detail(id){const p=by(id),f=flags(p),e=elig(p),days=[];for(let d=Math.min(ago(p.admitted),9);d>=0;d--)days.push(d);
const live=p.status==='active';
modal(`<div class="row">${tg(live?'bl':'mu',p.status)} <span class="mu">${p.id} · ${p.age}/${p.sex} · Bed ${p.bed||'—'} · admitted ${p.admitted}</span></div>
${live?`<div class="note" style="background:var(${e.ok?'--okb':'--wab'});color:var(${e.ok?'--ok':'--wa'})">Discharge rule: ${e.why}${p.approval?' · Approved by '+esc(p.approval.by):''}</div>`:''}
<h3>Temperatures</h3><div class="tw"><table><tr><th>Date</th><th>Readings</th><th>Flag</th></tr>${days.map(d=>{const r=rd(p,d);return`<tr><td>${iso(d)}</td><td>${r.map((x,i)=>tg(x.t>=FEV?'er':'ok',x.t.toFixed(1))+(role==='Admin'&&r.length>1?` <button class="b s sm" data-del="${p.id}|${iso(d)}|${i}">×</button>`:'')).join(' ')||'—'}</td><td>${r.length>1?tg('er','Duplicate'):!r.length&&d>0?tg('wa','Missing'):d===0&&!r.length?tg('mu','Due'):''}</td></tr>`}).join('')}</table></div>
<h3>Doctor visits</h3>${p.visits.map(v=>`<div class="mu">${v.date} · ${esc(v.doc)}: ${esc(v.note)}</div>`).join('')||'<div class="mu">None yet.</div>'}
<div class="row" style="margin-top:14px">${live&&role==='Doctor'?`<button class="b s" data-visit="${p.id}">Log visit</button><button class="b d" data-death="${p.id}">Record death</button>`:''}${live&&role==='Admin'?`<button class="b s" data-move="${p.id}">Change bed</button>`:''}</div>`,esc(p.name))}
function visitForm(id){const p=by(id);modal(`<form id="vf" data-id="${id}"><label>Clinical note<textarea name="n" rows="3" required></textarea></label><button class="b">Save visit</button></form>`,'Log visit: '+esc(p.name))}
function admitForm(bed){const free=Array.from({length:CAP},(_,i)=>i+1).filter(b=>!act().some(p=>p.bed===b));modal(`<form id="af"><div class="grid two"><label>Full name<input name="name" required></label><label>Age<input name="age" type="number" min="0" max="120" required></label><label>Sex<select name="sex"><option>F</option><option>M</option></select></label><label>Bed<select name="bed">${free.map(b=>`<option ${b===bed?'selected':''}>${b}</option>`).join('')}</select></label></div><button class="b">Admit</button></form>`,'Admit patient')}
document.addEventListener('click',ev=>{const t=ev.target.closest('button,tr.pill,td.pill,[data-t]');if(!t)return;const d=t.dataset;
if(d.t){tab=d.t;return render()}
if(d.p){return detail(d.p)}
if('admit' in d)return admitForm();
if(d.free){if(role!=='Admin')return toast('Only Admin can admit patients. Switch role.',1);return admitForm(+d.free)}
if(d.visit){if(role!=='Doctor')return toast('Only doctors can log visits.',1);return visitForm(d.visit)}
if(d.ap){const p=by(d.ap),e=elig(p);if(role!=='Doctor')return toast('Only doctors approve discharge.',1);if(!e.ok)return toast('Cannot approve: '+e.why,1);p.approval={by:NAMES.Doctor,on:iso(0)};save();toast('Discharge approved for '+p.name);render()}
if(d.rv){by(d.rv).approval=null;save();toast('Approval revoked');render()}
if(d.dc){const p=by(d.dc),e=elig(p);if(role!=='Admin')return toast('Only Admin can discharge.',1);if(!p.approval)return toast('Doctor approval required first.',1);if(!e.ok)return toast('Cannot discharge: '+e.why,1);p.status='discharged';p.outOn=iso(0);p.bed=null;save();toast(p.name+' discharged. Bed freed.');render()}
if(d.death){if(role!=='Doctor')return;if(!confirm('Record death for '+by(d.death).name+'? This cannot be undone.'))return;const p=by(d.death);p.status='deceased';p.outOn=iso(0);p.bed=null;p.approval=null;save();dlg.close();toast('Outcome recorded');render()}
if(d.del){if(role!=='Admin')return;const[id,day,i]=d.del.split('|'),p=by(id);p.temps[day].splice(+i,1);save();toast('Duplicate reading removed');detail(id);render()}
if(d.move){const p=by(d.move),free=Array.from({length:CAP},(_,i)=>i+1).filter(b=>!act().some(x=>x.bed===b)),n=prompt('Move to which free bed? Free: '+free.slice(0,15).join(', ')+(free.length>15?'…':''));if(n==null)return;if(!free.includes(+n))return toast('Bed unavailable.',1);p.bed=+n;save();dlg.close();toast('Moved to bed '+n);render()}});
document.addEventListener('submit',ev=>{ev.preventDefault();const f=ev.target;
if(f.classList.contains('tf')){if(role!=='Nurse')return toast('Only nurses can record temperatures.',1);const p=by(f.dataset.id),v=parseFloat(f.querySelector('input').value);if(!(v>=34&&v<=42))return toast('Enter a temperature between 34 and 42 °C.',1);
if(rd(p,0).length&&!confirm(p.name+' already has a reading today. Saving will flag a duplicate. Continue?'))return;
(p.temps[iso(0)]=p.temps[iso(0)]||[]).push({t:v,by:NAMES.Nurse,at:new Date().toTimeString().slice(0,5)});save();toast('Recorded '+v.toFixed(1)+' °C for '+p.name+(v>=FEV?' · FEVER':''),v>=FEV);render()}
if(f.id==='vf'){by(f.dataset.id).visits.push({date:iso(0),doc:NAMES.Doctor,note:f.n.value});save();dlg.close();toast('Visit saved');render()}
if(f.id==='af'){if(role!=='Admin')return;if(act().length>=CAP){return toast('Facility is at full capacity (74/74). Discharge a patient first.',1)}const bed=+f.bed.value;if(act().some(p=>p.bed===bed))return toast('Bed '+bed+' is occupied.',1);
S.p.push({id:'P'+String(S.n++).padStart(3,'0'),name:f.name.value.trim(),age:+f.age.value,sex:f.sex.value,bed,admitted:iso(0),status:'active',temps:{},visits:[],approval:null});save();dlg.close();toast('Admitted to bed '+bed);render()}});
document.addEventListener('input',ev=>{if(ev.target.id==='q'){q=ev.target.value;const pos=ev.target.selectionStart;render();const i=$('#q');i.focus();i.setSelectionRange(pos,pos)}});
document.addEventListener('change',ev=>{if(ev.target.id==='flt'){flt=ev.target.value;render()}});
$('#role').onchange=e=>{role=e.target.value;localStorage.setItem('caretrack.role',role);toast('Signed in as '+NAMES[role]);render()};
$('#reset').onclick=()=>{if(confirm('Reset all data to the demo set?')){S=seed();save();render();toast('Demo data restored')}};
S=load();save();render();

const STORAGE="medsim_cases_v2", DONE="medsim_completed_v2";
const seed=[{
 id:"001",title:"Demam & Batuk",name:"Alya Putri",age:17,gender:"Perempuan",status:"Pelajar",
 complaint:"Demam, batuk, dan mudah lelah sejak beberapa hari terakhir.",
 symptoms:[["🌡️","Demam","Suhu meningkat terutama sore hingga malam."],["🫁","Batuk","Batuk berlangsung beberapa hari."],["💨","Sesak ringan","Napas terasa sedikit lebih berat saat beraktivitas."],["💤","Mudah lelah","Energi menurun dan lebih cepat lelah."]],
 tests:[["🩸","Complete Blood Count","Melihat jumlah sel darah dan indikator infeksi.","cbc"],["🫁","Chest X-Ray","Melihat gambaran paru-paru.","xray"],["🦠","Rapid Antigen","Pemeriksaan antigen saluran napas.","antigen"],["💓","Pulse Oximetry","Mengukur saturasi oksigen.","spo2"]],
 results:{cbc:[["Leukosit","12.8 ×10³/µL","abnormal"],["Hemoglobin","12.7 g/dL","normal"],["Neutrofil","78%","abnormal"]],xray:[["Gambaran paru","Infiltrat ringan pada satu area","abnormal"],["Efusi pleura","Tidak tampak","normal"]],antigen:[["Hasil","Negatif","normal"]],spo2:[["SpO₂","97%","normal"],["Denyut nadi","96 bpm","normal"]]},
 diagnosis:["Pneumonia","Influenza","Asma","Anemia"],correct:0,
 explanation:"Kombinasi demam, batuk, infiltrat pada foto toraks, dan peningkatan sel darah putih mendukung gambaran pneumonia. Simulasi ini hanya untuk pembelajaran."
}];

let cases=loadCases(), completed=Number(localStorage.getItem(DONE)||0), current=null;
let sim={step:0,selected:[],choice:null,submitted:false};

function loadCases(){try{const x=JSON.parse(localStorage.getItem(STORAGE));return x?.length?x:seed}catch{return seed}}
function saveCases(){localStorage.setItem(STORAGE,JSON.stringify(cases));updateStats()}
function updateStats(){document.getElementById("caseCount").textContent=cases.length;document.getElementById("completedCount").textContent=completed}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function nav(page){document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===page));page==="simulator"?renderSimulator():page==="builder"?renderBuilder():renderLibrary()}
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>nav(b.dataset.page));
document.getElementById("randomTop").onclick=randomCase;

function randomCase(){if(!cases.length)return;const pool=cases.filter(c=>!current||c.id!==current.id);current=pool[Math.floor(Math.random()*pool.length)]||cases[0];startCase(current.id)}
function startCase(id){current=cases.find(c=>c.id===id);sim={step:0,selected:[],choice:null,submitted:false};nav("simulator")}
function stepShell(c,body){
 const labels=[["01","Patient","Profil pasien"],["02","Symptoms","Keluhan & tanda"],["03","Examination","Pilih pemeriksaan"],["04","Results","Interpretasi hasil"],["05","Diagnosis","Kesimpulan kasus"]];
 return `<div class="workspace"><aside class="steps">${labels.map((x,i)=>`<button class="step ${sim.step===i?"active":""}" onclick="gotoStep(${i})"><i>${x[0]}</i><span>${x[1]}</span><small>${x[2]}</small></button>`).join("")}</aside><section>${body}</section></div>`
}
function panel(title,desc,body){return `<div class="panel"><div class="panel-head"><div><h2>${title}</h2><p>${desc}</p></div><span class="badge">CASE ${current?.id||"001"}</span></div>${body}</div>`}
function navButtons(disabled=false){return `<div class="btn-row"><button class="secondary" onclick="prevStep()">← Kembali</button><button class="primary" onclick="nextStep()" ${disabled?"disabled":""}>Lanjut →</button></div>`}
function renderSimulator(){
 updateStats();
 if(!current)current=cases[0];
 document.getElementById("caseNo").textContent=current.id;
 const views=[patientView,symptomView,examView,resultView,diagnosisView];
 document.getElementById("appContent").innerHTML=stepShell(current,views[sim.step](current));
}
function patientView(c){return panel(c.title||"Patient","Kenali profil pasien sebelum masuk ke keluhan.",`<div class="patient-grid"><div class="avatar">🧑‍⚕️</div><div><div class="facts"><div class="fact"><small>Nama</small><b>${esc(c.name)}</b></div><div class="fact"><small>Usia</small><b>${esc(c.age)} tahun</b></div><div class="fact"><small>Jenis kelamin</small><b>${esc(c.gender)}</b></div><div class="fact"><small>Status</small><b>${esc(c.status)}</b></div></div><div class="quote">“${esc(c.complaint)}”</div></div></div>${navButtons()}`)}
function symptomView(c){return panel("Symptoms & Signs","Catat informasi yang diberikan pasien.",`<div class="symptoms">${c.symptoms.map(x=>`<div class="symptom"><b>${x[0]} ${esc(x[1])}</b><span>${esc(x[2])}</span></div>`).join("")}</div>${navButtons()}`)}
function examView(c){return panel("Choose examinations","Pilih pemeriksaan yang menurutmu paling membantu. Kamu boleh memilih lebih dari satu.",`<div class="tests">${c.tests.map(x=>`<button class="test ${sim.selected.includes(x[3])?"selected":""}" onclick="toggleTest('${x[3]}')"><div class="test-icon">${x[0]}</div><b>${esc(x[1])}</b><span>${esc(x[2])}</span></button>`).join("")}</div>${navButtons(sim.selected.length===0)}`)}
function resultView(c){const keys=sim.selected.length?sim.selected:Object.keys(c.results||{});const rows=keys.flatMap(k=>c.results[k]||[]);return panel("Investigation results","Hubungkan keluhan dengan hasil pemeriksaan.",`<div class="results">${rows.map(r=>`<div class="result"><div><b>${esc(r[0])}</b><br><span>${esc(r[1])}</span></div><span class="${r[2]}">${r[2]==="normal"?"NORMAL":"ABNORMAL"}</span></div>`).join("")}</div><div class="explain"><b>Clinical reasoning tip</b>Jangan melihat satu hasil secara terpisah. Hubungkan keluhan, tanda, dan hasil pemeriksaan.</div>${navButtons()}`)}
function diagnosisView(c){return panel("What is your diagnosis?","Pilih jawaban berdasarkan data kasus.",`<div class="choices">${c.diagnosis.map((d,i)=>`<button class="choice ${sim.submitted?(i===c.correct?"correct":i===sim.choice?"wrong":""):""}" onclick="chooseDx(${i})" ${sim.submitted?"disabled":""}>${String.fromCharCode(65+i)}. ${esc(d)}</button>`).join("")}</div>${sim.submitted?`<div class="score"><div class="score-num">${sim.choice===c.correct?"100":"50"}</div><b>${sim.choice===c.correct?"Excellent! 🎉":"Good try! 💡"}</b></div><div class="explain"><b>Why?</b>${esc(c.explanation)}</div>`:""}<div class="btn-row"><button class="secondary" onclick="prevStep()">← Kembali</button><button class="primary" onclick="submitDx()" ${sim.choice===null||sim.submitted?"disabled":""}>${sim.submitted?"Case selesai ✓":"Submit diagnosis"}</button></div>`)}

function gotoStep(i){if(i<=sim.step||i===sim.step+1){sim.step=i;renderSimulator()}}
function nextStep(){if(sim.step<4){sim.step++;renderSimulator()}}
function prevStep(){if(sim.step>0){sim.step--;renderSimulator()}}
function toggleTest(k){sim.selected.includes(k)?sim.selected=sim.selected.filter(x=>x!==k):sim.selected.push(k);renderSimulator()}
function chooseDx(i){sim.choice=i;renderSimulator()}
function submitDx(){if(sim.choice!==null){sim.submitted=true;completed++;localStorage.setItem(DONE,completed);updateStats();renderSimulator()}}

function renderBuilder(editId=null){
 const c=editId?cases.find(x=>x.id===editId):null;
 const d=c||{title:"",name:"",age:"",gender:"Perempuan",status:"Pelajar",complaint:"",symptoms:[],tests:[],results:{},diagnosis:["","",""],correct:0,explanation:""};
 document.getElementById("appContent").innerHTML=panel(c?"Edit Case":"Create New Case",c?"Ubah data kasus lalu simpan perubahan.":"Buat kasus pasien sendiri tanpa perlu menyentuh kode.",`
 <div class="notice">💡 Semua data disimpan di browser kamu menggunakan localStorage. Tidak ada data yang dikirim ke server.</div>
 <form id="caseForm" onsubmit="saveCase(event,${c?`'${c.id}'`:"null"})">
 <div class="form-grid">
  ${field("Case title","title",d.title,"Contoh: Nyeri dada setelah olahraga")}
  ${field("Nama pasien","name",d.name,"Nama pasien")}
  ${field("Usia","age",d.age,"17")}
  <div class="field"><label>Jenis kelamin</label><select name="gender"><option ${d.gender==="Perempuan"?"selected":""}>Perempuan</option><option ${d.gender==="Laki-laki"?"selected":""}>Laki-laki</option></select></div>
  ${field("Status / pekerjaan","status",d.status,"Pelajar")}
  ${field("Keluhan utama","complaint",d.complaint,"Keluhan pasien...",true)}
 </div>
 <div class="builder-section"><h3>🌡️ Symptoms</h3><div id="symptomRows">${(d.symptoms.length?d.symptoms:[["🌡️","",""]]).map(row=>rowInputs("symptom",row)).join("")}</div><button type="button" class="mini-btn" onclick="addRow('symptom')">+ Tambah gejala</button></div>
 <div class="builder-section"><h3>🧪 Examinations</h3><div id="testRows">${(d.tests.length?d.tests:[["🩸","","","test1"]]).map(row=>rowInputs("test",row)).join("")}</div><button type="button" class="mini-btn" onclick="addRow('test')">+ Tambah pemeriksaan</button></div>
 <div class="builder-section"><h3>📊 Examination Results</h3><p style="font-size:11px;margin-bottom:12px">Isi hasil untuk setiap pemeriksaan menggunakan key yang sama seperti pada kolom terakhir pemeriksaan.</p><div id="resultRows">${resultInputs(d.results)}</div><button type="button" class="mini-btn" onclick="addResult()">+ Tambah hasil</button></div>
 <div class="builder-section"><h3>🧠 Diagnosis</h3><div id="dxRows">${d.diagnosis.map((x,i)=>`<div class="builder-row dx-row"><input name="dx" value="${escAttr(x)}" placeholder="Pilihan diagnosis ${i+1}"><select name="correct"><option value="${i}" ${d.correct===i?"selected":""}>${i===d.correct?"✓ ":""}Jawaban benar</option></select><button type="button" class="mini-btn remove" onclick="this.parentElement.remove()">×</button></div>`).join("")}</div><button type="button" class="mini-btn" onclick="addDx()">+ Tambah diagnosis</button></div>
 <div class="builder-section">${field("Penjelasan jawaban benar","explanation",d.explanation,"Jelaskan alasan diagnosis...",true)}</div>
 <div class="btn-row"><button type="button" class="secondary" onclick="nav('library')">Batal</button><button class="primary" type="submit">💾 ${c?"Simpan perubahan":"Simpan case"}</button></div>
 </form>`);
}
function field(label,name,value,placeholder,area=false){return `<div class="field ${area?"full":""}"><label>${label}</label>${area?`<textarea name="${name}" placeholder="${placeholder}">${esc(value)}</textarea>`:`<input name="${name}" value="${escAttr(value)}" placeholder="${placeholder}">`}</div>`}
function rowInputs(type,row){if(type==="symptom")return `<div class="builder-row symptom-row"><input name="symIcon" value="${escAttr(row[0])}" placeholder="🌡️"><input name="symName" value="${escAttr(row[1])}" placeholder="Nama gejala"><input name="symDesc" value="${escAttr(row[2])}" placeholder="Deskripsi"><button type="button" class="mini-btn remove" onclick="this.parentElement.remove()">×</button></div>`;return `<div class="builder-row test-row"><input name="testIcon" value="${escAttr(row[0])}" placeholder="🩸"><input name="testName" value="${escAttr(row[1])}" placeholder="Nama pemeriksaan"><input name="testDesc" value="${escAttr(row[2])}" placeholder="Deskripsi"><input name="testKey" value="${escAttr(row[3])}" placeholder="key"><button type="button" class="mini-btn remove" onclick="this.parentElement.remove()">×</button></div>`}
function resultInputs(results){let rows=[];Object.entries(results||{}).forEach(([key,vals])=>vals.forEach(v=>rows.push([key,...v])));if(!rows.length)rows=[["test1","","","normal"]];return rows.map(r=>`<div class="builder-row result-row"><input name="resKey" value="${escAttr(r[0])}" placeholder="test1"><input name="resName" value="${escAttr(r[1])}" placeholder="Parameter"><input name="resValue" value="${escAttr(r[2])}" placeholder="Hasil"><select name="resStatus"><option value="normal" ${r[3]==="normal"?"selected":""}>Normal</option><option value="abnormal" ${r[3]==="abnormal"?"selected":""}>Abnormal</option></select><button type="button" class="mini-btn remove" onclick="this.parentElement.remove()">×</button></div>`).join("")}
function addRow(type){document.getElementById(type==="symptom"?"symptomRows":"testRows").insertAdjacentHTML("beforeend",rowInputs(type,type==="symptom"?["🌡️","",""]:["🧪","","","test"+Date.now()]))}
function addResult(){document.getElementById("resultRows").insertAdjacentHTML("beforeend",resultInputs({x:[["","","normal"]]}))}
function addDx(){document.getElementById("dxRows").insertAdjacentHTML("beforeend",`<div class="builder-row dx-row"><input name="dx" placeholder="Pilihan diagnosis"><select name="correct"><option value="">Jawaban benar</option></select><button type="button" class="mini-btn remove" onclick="this.parentElement.remove()">×</button></div>`)}
function saveCase(e,editId){e.preventDefault();const f=new FormData(e.target);const getAll=n=>f.getAll(n);const id=editId||String(Math.max(0,...cases.map(c=>Number(c.id)||0))+1).padStart(3,"0");const symptoms=getAll("symName").map((n,i)=>[getAll("symIcon")[i]||"•",n,getAll("symDesc")[i]||""]);const tests=getAll("testName").map((n,i)=>[getAll("testIcon")[i]||"🧪",n,getAll("testDesc")[i]||"",getAll("testKey")[i]||"test"+i]);const results={};getAll("resKey").forEach((k,i)=>{if(!k)return;(results[k]??=[]).push([getAll("resName")[i]||"Parameter",getAll("resValue")[i]||"-",getAll("resStatus")[i]||"normal"])});const dx=getAll("dx").filter(Boolean);const selects=getAll("correct").filter(x=>x!=="");let correct=0;if(selects.length){const idx=selects.findIndex((x,i)=>x===String(i));correct=idx>=0?idx:Math.min(Number(selects[0])||0,dx.length-1)}const obj={id,title:f.get("title")||"Untitled Case",name:f.get("name")||"Anonymous",age:f.get("age")||"-",gender:f.get("gender"),status:f.get("status"),complaint:f.get("complaint"),symptoms,tests,results,diagnosis:dx.length?dx:["Belum ditentukan"],correct,explanation:f.get("explanation")||"Belum ada penjelasan."};if(editId){const i=cases.findIndex(c=>c.id===editId);cases[i]=obj;toast("Case berhasil diperbarui ✓")}else{cases.push(obj);toast("Case berhasil dibuat ✓")}saveCases();setTimeout(()=>nav("library"),400)}
function renderLibrary(){updateStats();document.getElementById("appContent").innerHTML=panel("Case Library","Semua kasus tersimpan di browser kamu.",`${cases.length?`<div class="library-grid">${cases.map(c=>`<article class="case-card"><span class="badge">CASE ${c.id}</span><h3>${esc(c.title)}</h3><p><b>${esc(c.name)}</b> • ${esc(c.age)} tahun • ${esc(c.gender)}</p><p>${esc(c.complaint).slice(0,115)}${c.complaint.length>115?"…":""}</p><div class="case-meta"><span class="tag">🩺 ${c.diagnosis.length} diagnosis</span><span class="tag">🧪 ${c.tests.length} tests</span></div><div class="card-actions"><button class="play" onclick="startCase('${c.id}')">▶ Play</button><button onclick="renderBuilder('${c.id}')">✏️ Edit</button><button onclick="deleteCase('${c.id}')">🗑️ Delete</button></div></article>`).join("")}</div>`:`<div class="empty">📚<h3>Belum ada case</h3><p>Buat case pertamamu dari Case Builder.</p><button class="primary" onclick="nav('builder')">+ Create Case</button></div>`}`)}
function deleteCase(id){const c=cases.find(x=>x.id===id);if(!c)return;if(!confirm(`Hapus case "${c.title}"?`))return;cases=cases.filter(x=>x.id!==id);saveCases();if(current?.id===id)current=cases[0]||null;toast("Case dihapus");renderLibrary()}
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function escAttr(x){return esc(x)}
updateStats();current=cases[0];renderSimulator();

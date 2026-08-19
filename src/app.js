import{parseCSV,downloadCSV}from"./csv.js";
import{normalizeZotero,mergeCoding,codingTemplate,codingHeaders,shortAuthor,summarize}from"./model.js";

const state={records:[],selected:null,filters:{q:"",cluster:"",relevance:"",basis:""}};
const $=s=>document.querySelector(s);const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

async function readFile(file){return parseCSV(await file.text())}
async function loadZotero(file){state.records=(await readFile(file)).map(normalizeZotero);state.selected=state.records[0]||null;render()}
async function loadCoding(file){if(!state.records.length)return alert("Primero importa un CSV de Zotero.");state.records=mergeCoding(state.records,await readFile(file));render()}
async function loadExample(){
  try{const [z,c]=await Promise.all([fetch("data/zotero-example.csv").then(r=>r.text()),fetch("data/coding-example.csv").then(r=>r.text())]);state.records=mergeCoding(parseCSV(z).map(normalizeZotero),parseCSV(c));state.selected=state.records[0];render();}
  catch{alert("El ejemplo necesita abrirse desde un servidor local o GitHub Pages. Consulta el README.")}
}

function countBy(field){const m=new Map();state.records.forEach(r=>{const v=r[field]||"Sin clasificar";m.set(v,(m.get(v)||0)+1)});return [...m].sort((a,b)=>b[1]-a[1])}
function bars(target,items,color="#472764",limit=12){const max=Math.max(...items.map(x=>x[1]),1);$(target).innerHTML=items.slice(0,limit).map(([label,n])=>`<div class="bar-row"><label title="${esc(label)}">${esc(label)}</label><div class="bar-track"><i style="width:${n/max*100}%;background:${color}"></i></div><b>${n}</b></div>`).join("")}
function topValues(field,n=3){return countBy(field).filter(x=>x[0]!=="Sin clasificar").slice(0,n).map(x=>x[0]).join(", ")||"Sin codificación"}

function renderOverview(){
  const s=summarize(state.records);$("#library-summary").textContent=`${s.n} registros · ${s.abstracts} con resumen · ${s.coded} con codificación sustantiva`;
  $("#stat-cards").innerHTML=[[s.n,"Referencias"],[s.abstracts,"Con resumen"],[s.doi,"Con DOI"],[s.journals,"Fuentes"],[s.coded,"Codificadas"]].map(x=>`<article class="stat"><b>${x[0]}</b><span>${x[1]}</span></article>`).join("");
  bars("#year-chart",countBy("Year").sort((a,b)=>String(a[0]).localeCompare(String(b[0]))),"#2f766d",20);bars("#cluster-chart",countBy("Cluster"),"#c69c2a",12);
  $("#coding-hint").textContent=s.coded?"Los núcleos proceden de coding.csv y deben documentarse en un libro de códigos.":"Aún no hay coding.csv: descarga la plantilla para añadir una capa conceptual.";
  $("#flow-exposure").textContent=topValues("Exposure");$("#flow-resources").textContent=topValues("Resources");$("#flow-mechanism").textContent=topValues("Mechanism");$("#flow-outcome").textContent=topValues("Outcome");
}

function populateFilters(){
  const clusters=countBy("Cluster").map(x=>x[0]).filter(x=>x!=="Sin clasificar");const rels=countBy("Relevance").map(x=>x[0]).filter(x=>x!=="Sin clasificar");
  const fill=(id,values,label)=>{const old=$(id).value;$(id).innerHTML=`<option value="">${label}</option>`+values.map(v=>`<option>${esc(v)}</option>`).join("");$(id).value=old};fill("#cluster-filter",clusters,"Todos los núcleos");fill("#relevance-filter",rels,"Toda relevancia");
}
function filtered(){const f=state.filters;return state.records.filter(r=>(!f.cluster||r.Cluster===f.cluster)&&(!f.relevance||r.Relevance===f.relevance)&&(!f.basis||(f.basis==="abstract"?!!r.Abstract:!r.Abstract))&&(!f.q||Object.values(r).join(" ").toLowerCase().includes(f.q.toLowerCase())))}
function renderList(){const list=filtered();$("#visible-count").textContent=`${list.length} de ${state.records.length} referencias visibles`;$("#article-list").innerHTML=list.length?list.map(r=>`<article class="article ${state.selected?.Key===r.Key?"active":""}" data-key="${esc(r.Key)}"><div class="article-meta"><span>${esc(r.Cluster||"Sin clasificar")}</span><span>${esc(r.Year)}</span></div><h3>${esc(r.Title)}</h3><p>${esc(shortAuthor(r.Author))}</p><div class="tags"><span class="tag">${esc(r.Relevance||"Sin relevancia")}</span><span class="tag ${r.Abstract?"":"warning"}">${r.Abstract?"Con resumen":"Solo metadatos"}</span></div></article>`).join(""):`<div class="empty-results">No hay registros que cumplan los filtros.</div>`;
  document.querySelectorAll(".article").forEach(el=>el.addEventListener("click",()=>{state.selected=state.records.find(r=>r.Key===el.dataset.key);renderList();renderDetail()}));
  if(list.length&&!list.some(r=>r.Key===state.selected?.Key))state.selected=list[0];renderDetail();
}
function renderDetail(){const r=state.selected;if(!r){$("#article-detail").innerHTML="<p>Selecciona un artículo.</p>";return}const link=r.DOI?`https://doi.org/${encodeURI(r.DOI)}`:r.URL;$("#article-detail").innerHTML=`<p class="kicker">${esc(r.Cluster||"SIN CLASIFICAR")}</p><h3>${esc(r.Title)}</h3><p class="citation">${esc(shortAuthor(r.Author))} · ${esc(r.Year)}</p><dl><dt>Exposición</dt><dd>${esc(r.Exposure||"No codificada")}</dd><dt>Recursos</dt><dd>${esc(r.Resources||"No codificados")}</dd><dt>Mecanismo</dt><dd>${esc(r.Mechanism||"No codificado")}</dd><dt>Resultado</dt><dd>${esc(r.Outcome||"No codificado")}</dd><dt>Diseño</dt><dd>${esc(r.Design||"No codificado")}</dd><dt>Función</dt><dd>${esc(r["Paper function"]||"No codificada")}</dd></dl>${link?`<a href="${esc(link)}" target="_blank" rel="noreferrer">Abrir fuente ↗</a>`:""}<div class="caution">${r.Abstract?"La codificación puede apoyarse en el resumen, pero debe contrastarse con el texto completo.":"Este registro no contiene resumen: cualquier codificación sustantiva requiere revisión prioritaria."}</div>`}
function renderQuality(){const s=summarize(state.records);const uncoded=s.n-s.coded;const noAbstract=s.n-s.abstracts;const noDoi=s.n-s.doi;$("#quality-cards").innerHTML=[[noAbstract,"Sin resumen","Requieren lectura antes de inferir mecanismos."],[uncoded,"Sin núcleo","Aún no participan del mapa sustantivo."],[noDoi,"Sin DOI","Conviene revisar enlaces y metadatos."],[s.coded,"Codificadas","La clasificación sigue siendo una decisión analítica."]].map(x=>`<article class="quality-card"><b>${x[0]}</b><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join("")}
function render(){if(!state.records.length)return;$("#empty-state").hidden=true;$("#workspace").hidden=false;renderOverview();populateFilters();renderList();renderQuality()}

$("#zotero-file").addEventListener("change",e=>e.target.files[0]&&loadZotero(e.target.files[0]));$("#coding-file").addEventListener("change",e=>e.target.files[0]&&loadCoding(e.target.files[0]));$("#load-example").addEventListener("click",loadExample);$("#download-template").addEventListener("click",()=>downloadCSV("coding-template.csv",codingTemplate(state.records),codingHeaders));
[["#search","q","input"],["#cluster-filter","cluster","change"],["#relevance-filter","relevance","change"],["#basis-filter","basis","change"]].forEach(([id,key,event])=>$(id).addEventListener(event,e=>{state.filters[key]=e.target.value;renderList()}));$("#clear-filters").addEventListener("click",()=>{state.filters={q:"",cluster:"",relevance:"",basis:""};["#search","#cluster-filter","#relevance-filter","#basis-filter"].forEach(id=>$(id).value="");renderList()});

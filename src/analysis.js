const STOPWORDS=new Set(`a about al algo an and are as at be been between both but by con como contra cual cuando de del desde donde durante e el ella en entre era es esta este for from fue ha hasta hay how i if in into is it la las lo los más me mi muy no not o of on or para pero por que se sin so sobre su than that the their them then there these they this those to un una uno unos upon was were what when where which while who will with y ya`.split(/\s+/));

const clean=text=>String(text||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export function tokenize(text){
  return clean(text).match(/[a-z][a-z0-9-]{2,}/g)?.filter(t=>!STOPWORDS.has(t)&&!/^\d+$/.test(t))||[];
}

function documentText(record){return [record.Title,record.Abstract,record.Tags].filter(Boolean).join(" ")}

export function tfidf(records){
  const docs=records.map(r=>tokenize(documentText(r)));const df=new Map();
  docs.forEach(tokens=>new Set(tokens).forEach(t=>df.set(t,(df.get(t)||0)+1)));
  return docs.map(tokens=>{
    const counts=new Map();tokens.forEach(t=>counts.set(t,(counts.get(t)||0)+1));
    const vector=new Map();const total=Math.max(tokens.length,1);
    counts.forEach((count,t)=>vector.set(t,count/total*(Math.log((records.length+1)/((df.get(t)||0)+1))+1)));
    const norm=Math.sqrt([...vector.values()].reduce((s,v)=>s+v*v,0))||1;
    vector.forEach((v,t)=>vector.set(t,v/norm));return vector;
  });
}

export function cosine(a,b){let sum=0;const [small,large]=a.size<b.size?[a,b]:[b,a];small.forEach((v,k)=>sum+=v*(large.get(k)||0));return sum}
function mean(vectors,indices){const out=new Map();indices.forEach(i=>vectors[i].forEach((v,k)=>out.set(k,(out.get(k)||0)+v)));out.forEach((v,k)=>out.set(k,v/indices.length));const norm=Math.sqrt([...out.values()].reduce((s,v)=>s+v*v,0))||1;out.forEach((v,k)=>out.set(k,v/norm));return out}

function seeds(vectors,k){
  const chosen=[vectors.reduce((best,v,i)=>v.size>(vectors[best]?.size||-1)?i:best,0)];
  while(chosen.length<k){let next=0,best=-1;vectors.forEach((v,i)=>{if(chosen.includes(i))return;const distance=1-Math.max(...chosen.map(j=>cosine(v,vectors[j])));if(distance>best){best=distance;next=i}});chosen.push(next)}return chosen.map(i=>vectors[i]);
}

function kmeans(vectors,k){
  let centers=seeds(vectors,k),assignment=Array(vectors.length).fill(-1);
  for(let iteration=0;iteration<25;iteration++){
    const next=vectors.map(v=>centers.reduce((best,c,i)=>cosine(v,c)>cosine(v,centers[best])?i:best,0));
    if(next.every((x,i)=>x===assignment[i]))break;assignment=next;
    centers=centers.map((center,c)=>{const members=assignment.map((x,i)=>x===c?i:-1).filter(i=>i>=0);return members.length?mean(vectors,members):center});
  }
  return {assignment,centers};
}

function labelTerms(center,n=4){return [...center].sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0])}
export function suggestedClusterCount(n){return n<4?1:Math.max(2,Math.min(10,Math.round(Math.sqrt(n/2))))}

export function analyzeLocally(records,options={}){
  if(!records.length)return [];
  const vectors=tfidf(records);const k=Math.max(1,Math.min(options.clusters||suggestedClusterCount(records.length),records.length));
  if(k===1)return records.map(r=>({...r,TextCluster:"Tema 1",TextClusterId:"text-1",TextTerms:"",TextCentrality:1,AnalysisBasis:r.Abstract?"Title + abstract":"Title only"}));
  const {assignment,centers}=kmeans(vectors,k);const terms=centers.map(c=>labelTerms(c));
  const labels=terms.map((xs,i)=>xs.length?xs.map(x=>x[0].toUpperCase()+x.slice(1)).join(" · "):`Tema ${i+1}`);
  return records.map((r,i)=>({...r,TextCluster:labels[assignment[i]],TextClusterId:`text-${assignment[i]+1}`,TextTerms:terms[assignment[i]].join(", "),TextCentrality:Number(cosine(vectors[i],centers[assignment[i]]).toFixed(4)),AnalysisBasis:r.Abstract?"Title + abstract":"Title only"}));
}

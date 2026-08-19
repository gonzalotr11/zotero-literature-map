import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {parseCSV,toCSV} from "../src/csv.js";
import {normalizeZotero,mergeCoding,codingTemplate,summarize} from "../src/model.js";
import {analyzeLocally,suggestedClusterCount,tokenize} from "../src/analysis.js";

const zotero=parseCSV(fs.readFileSync(new URL("../data/zotero-example.csv",import.meta.url),"utf8")).map(normalizeZotero);
const coding=parseCSV(fs.readFileSync(new URL("../data/coding-example.csv",import.meta.url),"utf8"));

test("parses the example Zotero export",()=>{
  assert.equal(zotero.length,10);
  assert.equal(zotero[0].Key,"V8L23PUT");
  assert.match(zotero[0].Title,/family stress model/i);
});

test("joins coding by stable Zotero key",()=>{
  const joined=mergeCoding(zotero,coding);
  assert.equal(joined.length,10);
  assert.equal(joined[0].Cluster,"Estrés e inversión familiar");
  assert.equal(joined.find(x=>x.Key==="INFLJ3QV").Exposure,"Pobreza de patrimonio neto");
});

test("reports missing abstracts without dropping records",()=>{
  const s=summarize(mergeCoding(zotero,coding));
  assert.equal(s.n,10);
  assert.equal(s.abstracts,9);
  assert.equal(s.coded,10);
});

test("exports a round-trippable coding template",()=>{
  const template=codingTemplate(zotero);
  const csv=toCSV(template,Object.keys(template[0]));
  const parsed=parseCSV(csv);
  assert.equal(parsed.length,10);
  assert.equal(parsed[0].Key,"V8L23PUT");
});

test("handles quoted commas and escaped quotes",()=>{
  const parsed=parseCSV('"Title","Note"\n"A, B","Said ""yes"""\n');
  assert.deepEqual(parsed,[{Title:"A, B",Note:'Said "yes"'}]);
});

test("tokenizes bilingual bibliographic text without common stopwords",()=>{
  assert.deepEqual(tokenize("The stress and la inseguridad económica"),["stress","inseguridad","economica"]);
});

test("creates deterministic local clusters without dropping Zotero records",()=>{
  const analyzed=analyzeLocally(zotero,{clusters:3});
  assert.equal(analyzed.length,zotero.length);
  assert.equal(new Set(analyzed.map(r=>r.TextCluster)).size,3);
  assert.ok(analyzed.every(r=>r.TextCluster&&r.AnalysisBasis));
  assert.deepEqual(analyzeLocally(zotero,{clusters:3}).map(r=>r.TextCluster),analyzed.map(r=>r.TextCluster));
});

test("suggests a bounded cluster count",()=>{
  assert.equal(suggestedClusterCount(2),1);
  assert.ok(suggestedClusterCount(101)>=5&&suggestedClusterCount(101)<=10);
});

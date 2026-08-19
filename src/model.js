const codingFields=["Cluster","Theory","Exposure","Resources","Mechanism","Outcome","Design","Context","Temporality","Mechanism observation","Paper function","Relevance","Main finding","Limitation"];
export const codingHeaders=["Key","Title",...codingFields];

const first=(obj,names)=>names.map(n=>obj[n]).find(Boolean)||"";
export function normalizeZotero(row,index){
  const key=first(row,["Key","Item Key","key"])||`record-${index+1}`;
  return {
    Key:key,
    Type:first(row,["Item Type","Type"]),
    Year:first(row,["Publication Year","Year","Date"]).match(/\b(18|19|20)\d{2}\b/)?.[0]||"s/f",
    Author:first(row,["Author","Creators"]),
    Title:first(row,["Title"])||"Sin título",
    Publication:first(row,["Publication Title","Publisher","Conference Name"]),
    DOI:first(row,["DOI","Doi"]),
    URL:first(row,["Url","URL"]),
    Abstract:first(row,["Abstract Note","Abstract"]),
    Tags:first(row,["Manual Tags","Automatic Tags","Tags"]),
    Attachment:first(row,["File Attachments"]),
    Language:first(row,["Language"]),
    ...Object.fromEntries(codingFields.map(f=>[f,first(row,[f])]))
  };
}

export function mergeCoding(records,coding){
  const byKey=new Map(coding.map(r=>[r.Key,r]));
  const byTitle=new Map(coding.filter(r=>r.Title).map(r=>[r.Title.trim().toLowerCase(),r]));
  return records.map(r=>{
    const c=byKey.get(r.Key)||byTitle.get(r.Title.trim().toLowerCase())||{};
    return {...r,...Object.fromEntries(codingFields.map(f=>[f,c[f]||r[f]||""]))};
  });
}

export function codingTemplate(records){
  return records.map(r=>({Key:r.Key,Title:r.Title,...Object.fromEntries(codingFields.map(f=>[f,r[f]||""]))}));
}

export function shortAuthor(author){
  if(!author)return "Autoría no registrada";const parts=author.split(";").filter(Boolean);const surname=parts[0].split(",")[0];return parts.length>2?`${surname} et al.`:parts.length===2?`${surname} y ${parts[1].split(",")[0].trim()}`:surname;
}

export function summarize(records){
  const n=records.length;const valid=x=>records.filter(x).length;
  return {n,abstracts:valid(r=>r.Abstract),doi:valid(r=>r.DOI),coded:valid(r=>r.Cluster),years:new Set(records.filter(r=>r.Year!=="s/f").map(r=>r.Year)).size,journals:new Set(records.filter(r=>r.Publication).map(r=>r.Publication)).size};
}

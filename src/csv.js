export function parseCSV(text){
  const rows=[];let row=[],field="",quoted=false;
  text=String(text).replace(/^\uFEFF/,"");
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(quoted){
      if(char==='"'&&text[i+1]==='"'){field+='"';i++;}
      else if(char==='"')quoted=false;
      else field+=char;
    }else if(char==='"')quoted=true;
    else if(char===','){row.push(field);field="";}
    else if(char==='\n'){row.push(field.replace(/\r$/,""));rows.push(row);row=[];field="";}
    else field+=char;
  }
  if(field||row.length){row.push(field);rows.push(row);}
  const headers=(rows.shift()||[]).map(x=>x.trim());
  return rows.filter(r=>r.some(v=>v.trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??""])));
}

export function toCSV(records,headers){
  const quote=value=>`"${String(value??"").replaceAll('"','""')}"`;
  return [headers.map(quote).join(','),...records.map(r=>headers.map(h=>quote(r[h])).join(','))].join('\r\n');
}

export function downloadCSV(filename,records,headers){
  const blob=new Blob(["\uFEFF"+toCSV(records,headers)],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}

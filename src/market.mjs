export function summary(rows){if(!rows.length)return null;const prices=rows.map(r=>r.price);return {mean:prices.reduce((a,b)=>a+b,0)/prices.length,min:Math.min(...prices),max:Math.max(...prices),start:rows[0].date,end:rows.at(-1).date,count:rows.length};}
export function parseHistory(text,today=new Date().toISOString().slice(0,10)){
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);if(!/^date\s*,\s*price$/i.test(lines.shift()?.trim()||''))throw Error('CSV 首行必须为 date,price，价格单位为人民币/克');
 const rows=[],seen=new Set(),now=Date.parse(today+'T00:00:00Z');
 for(const line of lines){if(!line.trim())continue;const [date,raw,...extra]=line.split(',').map(s=>s.trim()),timestamp=Date.parse(date+'T00:00:00Z'),price=Number(raw);
 if(extra.length||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(timestamp)||new Date(timestamp).toISOString().slice(0,10)!==date||!raw||!Number.isFinite(price)||price<=0)throw Error('CSV 含无效日期或单价，请检查');
 if(seen.has(date))throw Error('同一天只能有一个价格');seen.add(date);
 if(timestamp<=now&&timestamp>now-31*86400000)rows.push({date,price});
 }if(!rows.length)throw Error('没有近 31 天的有效价格');return rows.sort((a,b)=>a.date.localeCompare(b.date));
}

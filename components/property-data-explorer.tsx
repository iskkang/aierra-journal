"use client";
import Link from "next/link";
import {useMemo,useState} from "react";

export type CityRecord={
 slug:string;name:string;region:string;transactions:number;medianPrice:number;
 byQuarter:{quarter:string;medianPrice:number;transactions:number}[];
 byYear:{year:string;medianPrice:number;transactions:number}[];
};
const gbp=(v:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(v);
const pct=(a:number,b:number)=>b>0?(a-b)/b*100:null;
const signed=(n:number|null)=>n===null?"—":(n>0?"+":"")+n.toFixed(1)+"%";
function getComparable(row:CityRecord){
 const qs=[...row.byQuarter].sort((a,b)=>a.quarter.localeCompare(b.quarter));
 const current=qs.at(-1);
 const lastYear=current?qs.find(q=>q.quarter===String(Number(current.quarter.slice(0,4))-1)+current.quarter.slice(4)):undefined;
 const previous=qs.at(-2);
 return {last:current,previous,yoy:current&&lastYear?pct(current.medianPrice,lastYear.medianPrice):null,qoq:current&&previous?pct(current.medianPrice,previous.medianPrice):null,volume:current&&lastYear?pct(current.transactions,lastYear.transactions):null}
}
export function PropertyDataExplorer({records,coverageEnd}:{records:CityRecord[];coverageEnd:string}){
 const [metric,setMetric]=useState<"price"|"change"|"sales">("price");
 const [sort,setSort]=useState<"high"|"low">("high");
 const [focus,setFocus]=useState<string[]>(records.map(r=>r.slug));
 const [period,setPeriod]=useState<"quarter"|"year">("quarter");
 const enriched=useMemo(()=>records.map(r=>({...r,...getComparable(r)})),[records]);
 const rows=useMemo(()=>enriched.filter(r=>focus.includes(r.slug)).sort((a,b)=>{
  const val=(r:typeof a)=>metric==="price"?(r.last?.medianPrice??r.medianPrice):metric==="sales"?(r.last?.transactions??0):(r.yoy??-Infinity);
  return (sort==="high"?-1:1)*(val(a)-val(b));
 }),[enriched,focus,sort,metric]);
 const metricValue=(r:typeof enriched[number])=>metric==="price"?(r.last?.medianPrice??r.medianPrice):metric==="sales"?(r.last?.transactions??0):r.yoy;
 const absoluteMax=Math.max(1,...rows.map(r=>Math.abs(metricValue(r)??0)));
 const allQuarters=[...new Set(enriched.flatMap(r=>r.byQuarter.map(q=>q.quarter)))].sort();
 const years=[...new Set(enriched.flatMap(r=>r.byYear.map(y=>y.year)))].sort();
 const labels=period==="quarter"?allQuarters:years;
 const width=880,height=315,padLeft=72,padRight=24,padTop=31,padBottom=38;
 const allSeries=rows.map(r=>({slug:r.slug,name:r.name,values:labels.map(label=>(period==="quarter"?r.byQuarter.find(q=>q.quarter===label):r.byYear.find(y=>y.year===label))?.medianPrice??null)}));
 const flat=allSeries.flatMap(s=>s.values).filter((v):v is number=>v!==null);
 const min=flat.length?Math.floor(Math.min(...flat)*.90/50000)*50000:0;
 const max=flat.length?Math.ceil(Math.max(...flat)*1.07/50000)*50000:1;
 const colors=["#17608b","#a97748","#4d8d71","#956e97","#c15351","#688aa0"];
 const coordX=(i:number)=>padLeft+i*(width-padLeft-padRight)/Math.max(1,labels.length-1);
 const coordY=(v:number)=>padTop+(max-v)/(max-min||1)*(height-padTop-padBottom);
 const toggle=(slug:string)=>setFocus(prev=>prev.includes(slug)?prev.filter(s=>s!==slug):[...prev,slug]);
 return <div className="data-explorer">
 <div className="data-panel">
 <div className="explorer-title"><div><span className="dashboard-section-index">SIX MARKET COMPARISON</span><h2>Compare market performance</h2><p>Choose a metric and order the six city markets using the same observation quarter.</p></div><div className="explorer-selects"><label>Metric<select value={metric} onChange={e=>setMetric(e.target.value as typeof metric)}><option value="price">Latest quarterly median price</option><option value="change">Median price YoY change</option><option value="sales">Latest quarterly sales</option></select></label><label>Sort<select value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="high">Highest first</option><option value="low">Lowest first</option></select></label></div></div>
 <div className="city-toggle-row"><button type="button" onClick={()=>setFocus(records.map(r=>r.slug))}>All cities</button>{records.map(r=><button key={r.slug} type="button" className={focus.includes(r.slug)?"selected":""} onClick={()=>toggle(r.slug)} aria-pressed={focus.includes(r.slug)}>{r.name}</button>)}</div>
 {rows.length?<div className="comparison-bars">{rows.map(r=>{const val=metricValue(r);return <div key={r.slug} className="comparison-row"><div className="comparison-name"><Link href={"/markets/"+r.slug}>{r.name} <span>↗</span></Link><small>{r.region}</small></div><div className="comparison-track"><span className={typeof val==="number"&&val<0?"negative":""} style={{width:Math.max(0,Math.abs(val??0)/absoluteMax*100)+"%"}}/></div><strong>{val===null?"N/A":metric==="price"?gbp(val):metric==="sales"?val.toLocaleString("en-GB"):signed(val)}</strong></div>})}</div>:<p className="explorer-empty">Select at least one city to view the comparison.</p>}
 <p className="dashboard-caveat">YoY refers to the median recorded sale price for the latest quarter versus the same quarter one year earlier. It is not a repeat-sales index or a like-for-like appreciation measure.</p>
 </div>
 <div className="data-panel"><div className="explorer-title"><div><span className="dashboard-section-index">COMPARATIVE PRICE HISTORY</span><h2>How cities have moved</h2><p>Quarterly or annual registered median sale prices. Each market uses the same HM Land Registry source.</p></div><div className="chart-controls"><button type="button" className={period==="quarter"?"active":""} onClick={()=>setPeriod("quarter")}>Quarterly</button><button type="button" className={period==="year"?"active":""} onClick={()=>setPeriod("year")}>Annual</button></div></div>
 {allSeries.length&&flat.length?<div className="cross-city-chart-wrap"><svg className="cross-city-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Comparative registered median sale price trends for selected cities">{[0,.25,.5,.75,1].map(t=>{const value=min+(max-min)*t;const y=coordY(value);return <g key={t}><line x1={padLeft} x2={width-padRight} y1={y} y2={y} stroke="#e4e9e8" strokeDasharray="4 5"/><text x={padLeft-12} y={y+4} fontSize="11" textAnchor="end" fill="#6a7b85">£{Math.round(value/1000)}k</text></g>})}{allSeries.map(s=>{const color=colors[records.findIndex(r=>r.slug===s.slug)%colors.length];const chunks=s.values.map((v,i)=>v===null?null:`${i===0||s.values[i-1]===null?"M":"L"}${coordX(i).toFixed(2)} ${coordY(v).toFixed(2)}`).filter(Boolean).join(" ");return <g key={s.slug}><path d={chunks} fill="none" stroke={color} strokeWidth="2.7" strokeLinecap="round"/>{s.values.map((v,i)=>v===null?null:<circle key={i} cx={coordX(i)} cy={coordY(v)} r="3" fill="white" stroke={color} strokeWidth="2"><title>{s.name}, {labels[i]}: {gbp(v)}</title></circle>)}</g>})}{labels.map((label,i)=>(period==="year"||i%2===0||i===labels.length-1)?<text key={label} x={coordX(i)} y={height-10} textAnchor="middle" fontSize="11" fill="#627782">{period==="quarter"?label.slice(2).replace(" ","·"):label}</text>:null)}</svg></div>:<p className="explorer-empty">Select a city to show its price history.</p>}
 <div className="city-chart-legend">{rows.map(r=><span key={r.slug}><i style={{background:colors[records.findIndex(c=>c.slug===r.slug)%colors.length]}}/>{r.name}</span>)}</div>
 <p className="dashboard-caveat">Year {coverageEnd.slice(0,4)} is incomplete through {coverageEnd}. Annual medians should not be interpreted as year-end figures.</p></div>
 <div className="data-panel"><div className="explorer-title"><div><span className="dashboard-section-index">CITY SCORECARD</span><h2>Market comparison table</h2><p>Use the city links for district breakdowns, recent completed transactions and additional analysis.</p></div></div><div className="table-scroll"><table className="data-table comparison-table"><thead><tr><th>Market</th><th>Latest quarterly median</th><th>Median YoY</th><th>Median QoQ</th><th>Latest quarterly sales</th><th>Sales YoY</th></tr></thead><tbody>{enriched.map(r=><tr key={r.slug}><td><Link href={"/markets/"+r.slug}>{r.name} ↗</Link></td><td>{r.last?gbp(r.last.medianPrice):"—"}</td><td className={r.yoy!==null&&r.yoy<0?"negative-text":""}>{signed(r.yoy)}</td><td className={r.qoq!==null&&r.qoq<0?"negative-text":""}>{signed(r.qoq)}</td><td>{r.last?.transactions.toLocaleString("en-GB")??"—"}</td><td className={r.volume!==null&&r.volume<0?"negative-text":""}>{signed(r.volume)}</td></tr>)}</tbody></table></div><p className="dashboard-caveat">All price changes represent shifts in the transaction median, unadjusted for property mix. The latest quarter may be materially undercounted.</p></div>
 </div>
}

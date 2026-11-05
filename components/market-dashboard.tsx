"use client";
import {useMemo,useState} from "react";
type Point={quarter:string;transactions:number;medianPrice:number;meanPrice:number};
type Year={year:string;transactions:number;medianPrice:number;meanPrice:number};
type HomeType={type:string;transactions:number;medianPrice:number;meanPrice:number};
type District={district:string;transactions:number;medianPrice:number;meanPrice:number};
type Sold={date:string;price:number;type:string;postcode:string;street:string;town:string;district:string};
const money=(n:number)=>"£"+Math.round(n).toLocaleString("en-GB");
const compact=(n:number)=>"£"+(n/1000).toFixed(0)+"k";
const percent=(current:number,prev:number)=>prev?((current-prev)/prev*100):null;
const formatChange=(n:number|null)=>n===null?"N/A":(n>0?"+":"")+n.toFixed(1)+"%";
const changeClass=(n:number|null)=>n===null?"neutral":n>0?"up":n<0?"down":"neutral";
function SeriesChart({points,field}:{points:Point[];field:"medianPrice"|"transactions"}){
 const width=850,height=298,padX=56,padY=35,bottom=height-43;
 const values=points.map(p=>p[field]);const low=Math.min(...values);const high=Math.max(...values);
 const min=field==="transactions"?0:Math.floor(low*.93/10000)*10000;
 const max=Math.max(high*1.07,min+1);const x=(i:number)=>padX+i*(width-padX-25)/Math.max(1,points.length-1);
 const y=(v:number)=>padY+(max-v)/(max-min)*(bottom-padY);
 const line=points.map((p,i)=>(i?"L":"M")+x(i).toFixed(2)+" "+y(p[field]).toFixed(2)).join(" ");
 const area=line+" L"+x(points.length-1)+" "+bottom+" L"+x(0)+" "+bottom+" Z";
 const label=(v:number)=>field==="medianPrice"?compact(v):Math.round(v).toLocaleString("en-GB");
 return <div className="trend-frame"><svg className="trend-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={field==="medianPrice"?"Quarterly median registered sale price chart":"Quarterly registered sale volume chart"}>
 <defs><linearGradient id={"area-"+field} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#2c789f" stopOpacity=".19"/><stop offset="1" stopColor="#2c789f" stopOpacity="0"/></linearGradient></defs>
 {[0,.25,.5,.75,1].map(t=>{const v=min+(max-min)*t;const cy=y(v);return <g key={t}><line x1={padX} x2={width-22} y1={cy} y2={cy} stroke="#dee7e8" strokeDasharray="4 5"/><text x={padX-12} y={cy+4} textAnchor="end" fill="#7c8991" fontSize="11">{label(v)}</text></g>})}
 <path d={area} fill={"url(#area-"+field+")"}/><path d={line} fill="none" stroke="#1f668d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
 {points.map((p,i)=><g key={p.quarter}><circle cx={x(i)} cy={y(p[field])} r="4.5" fill="#fff" stroke="#1f668d" strokeWidth="2.5"/>{(i%2===0||i===points.length-1)&&<text x={x(i)} y={height-16} textAnchor="middle" fill="#647581" fontSize="11">{p.quarter.replace("20","").replace(" ","·")}</text>}<title>{p.quarter}: {field==="medianPrice"?money(p[field]):p[field].toLocaleString("en-GB")+" sales"}</title></g>)}
 </svg></div>
}
export function MarketDashboard({city,years,quarters,types,districts,sales,coverageEnd}:{city:string;years:Year[];quarters:Point[];types:HomeType[];districts:District[];sales:Sold[];coverageEnd:string}){
 const [metric,setMetric]=useState<"medianPrice"|"transactions">("medianPrice");
 const [range,setRange]=useState<"all"|"recent">("all");
 const ordered=useMemo(()=>[...quarters].sort((a,b)=>a.quarter.localeCompare(b.quarter)),[quarters]);
 const visible=range==="recent"?ordered.slice(-6):ordered;
 const last=ordered.at(-1),previous=ordered.at(-2),lastYear=last?ordered.find(q=>Number(q.quarter.slice(0,4))===Number(last.quarter.slice(0,4))-1&&q.quarter.slice(-2)===last.quarter.slice(-2)):undefined;
 const qoq=last&&previous?percent(last.medianPrice,previous.medianPrice):null;
 const yoy=last&&lastYear?percent(last.medianPrice,lastYear.medianPrice):null;
 const salesYoy=last&&lastYear?percent(last.transactions,lastYear.transactions):null;
 const maxType=Math.max(1,...types.map(t=>t.medianPrice));
 const [districtSort,setDistrictSort]=useState<"price"|"volume">("price");
 const [saleType,setSaleType]=useState("All");
 const shownDistricts=[...districts].sort((a,b)=>districtSort==="price"?b.medianPrice-a.medianPrice:b.transactions-a.transactions);
 const shownSales=sales.filter(s=>saleType==="All"||s.type===saleType).slice(0,9);
 return <div className="dashboard-stack">
 <div className="dashboard-snapshot"><div><span className="snapshot-label">LATEST OBSERVED QUARTER</span><strong>{last?.quarter??"Not available"}</strong><small>Registration-based · provisional</small></div>
 <div><span className="snapshot-label">MEDIAN PRICE · Q/Q</span><strong className={changeClass(qoq)}>{formatChange(qoq)}</strong><small>Versus previous quarter</small></div>
 <div><span className="snapshot-label">MEDIAN PRICE · Y/Y</span><strong className={changeClass(yoy)}>{formatChange(yoy)}</strong><small>Versus same quarter last year</small></div>
 <div><span className="snapshot-label">SALES VOLUME · Y/Y</span><strong className={changeClass(salesYoy)}>{formatChange(salesYoy)}</strong><small>Registration lag affects comparison</small></div></div>
 <section className="dashboard-panel"><div className="dashboard-panel-head"><div><span className="dashboard-section-index">MARKET PERFORMANCE</span><h2>Price and transaction trends</h2><p>Quarterly HM Land Registry records for {city}. Median sale prices are not mix-adjusted.</p></div><div className="chart-controls"><button type="button" className={metric==="medianPrice"?"active":""} onClick={()=>setMetric("medianPrice")}>Sale price</button><button type="button" className={metric==="transactions"?"active":""} onClick={()=>setMetric("transactions")}>Sales volume</button></div></div>
 {visible.length>=2?<><div className="chart-toolbar"><strong>{metric==="medianPrice"?"Median registered sale price":"Registered transactions"}</strong><div className="chart-controls range"><button type="button" className={range==="recent"?"active":""} onClick={()=>setRange("recent")}>Last 6 quarters</button><button type="button" className={range==="all"?"active":""} onClick={()=>setRange("all")}>Full period</button></div></div><SeriesChart points={visible} field={metric}/><div className="chart-summary"><span>FIRST: <b>{metric==="medianPrice"?money(visible[0][metric]):visible[0][metric].toLocaleString("en-GB")}</b></span><span>LATEST: <b>{metric==="medianPrice"?money(visible[visible.length-1][metric]):visible[visible.length-1][metric].toLocaleString("en-GB")}</b></span><span>OBSERVATIONS: <b>{visible.length} quarters</b></span></div></>:<p>Insufficient verified observations for the selected series.</p>}
 <p className="dashboard-caveat">Important: quarterly sales volume is provisional, particularly in the latest quarter. A shift in the composition of sold properties can change the median without an equivalent shift in like-for-like values.</p></section>
 <div className="dashboard-two"><section className="dashboard-panel"><div className="dashboard-panel-head"><div><span className="dashboard-section-index">PROPERTY MIX</span><h2>Prices by property type</h2><p>Median price across the full coverage period.</p></div></div><div className="type-bars">{types.map(t=><div className="type-bar-row" key={t.type}><div className="type-bar-info"><span>{t.type}</span><strong>{money(t.medianPrice)}</strong></div><div className="type-track"><span style={{width:(100*t.medianPrice/maxType)+"%"}}/></div><small>{t.transactions.toLocaleString("en-GB")} recorded sales</small></div>)}</div></section>
 <section className="dashboard-panel"><div className="dashboard-panel-head"><div><span className="dashboard-section-index">YEARLY COMPARISON</span><h2>Annual transaction data</h2><p>Recent years may not contain twelve complete months.</p></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Year</th><th>Median sale</th><th>Sales</th></tr></thead><tbody>{years.map(y=><tr key={y.year}><td>{y.year}{Number(y.year)===Number(coverageEnd.slice(0,4))?"*":""}</td><td>{money(y.medianPrice)}</td><td>{y.transactions.toLocaleString("en-GB")}</td></tr>)}</tbody></table></div><p className="dashboard-caveat">*Year to date, through {coverageEnd}. Yearly totals are not directly comparable until all periods are complete.</p></section></div>
 {districts.length>1?<section className="dashboard-panel region-panel"><div className="dashboard-panel-head"><div><span className="dashboard-section-index">LOCAL AREA COMPARISON</span><h2>Compare boroughs and districts</h2><p>Registered sales by administrative district across the full observation period. London boroughs can vary significantly.</p></div><div className="chart-controls"><button className={districtSort==="price"?"active":""} onClick={()=>setDistrictSort("price")}>Median price</button><button className={districtSort==="volume"?"active":""} onClick={()=>setDistrictSort("volume")}>Sales count</button></div></div><div className="region-list">{shownDistricts.map(d=><div className="region-row" key={d.district}><span>{d.district}</span><strong>{money(d.medianPrice)}</strong><small>{d.transactions.toLocaleString("en-GB")} sales</small></div>)}</div></section>:null}
 <section className="dashboard-panel sold-panel"><div className="dashboard-panel-head"><div><span className="dashboard-section-index">INDIVIDUAL REGISTERED TRANSACTIONS</span><h2>Recently completed sales</h2><p>Examples from the official register, ordered by recorded completion date. These are sold properties, not homes currently for sale.</p></div><div className="chart-controls"><button className={saleType==="All"?"active":""} onClick={()=>setSaleType("All")}>All</button><button className={saleType==="Flat/maisonette"?"active":""} onClick={()=>setSaleType("Flat/maisonette")}>Flats</button><button className={saleType==="Terraced"?"active":""} onClick={()=>setSaleType("Terraced")}>Terraced</button></div></div>{sales.length?<div className="sold-grid">{shownSales.map((s,i)=><article className="sold-card" key={s.date+"-"+s.postcode+"-"+i}><span className="dashboard-section-index">SOLD · {s.date}</span><h3>{money(s.price)}</h3><p>{s.street||s.town}, {s.district}</p><div><span>{s.type}</span><span>{s.postcode}</span></div></article>)}</div>:<div className="empty-state"><strong>Individual transactions are being prepared.</strong><p>The next verified data refresh will populate recent completed sales. No example addresses or asking prices are invented.</p></div>}</section>
 </div>
}

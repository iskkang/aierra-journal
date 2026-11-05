import {cities,type MarketSnapshot} from "./markets";

export type Signal={slug:string;name:string;region:string;quarter:string;median:number;sales:number;previousMedian:number|null;previousSales:number|null;yearAgoMedian:number|null;yearAgoSales:number|null;qoq:number|null;yoy:number|null;salesYoY:number|null};
export function percentage(current:number,previous:number|undefined|null):number|null{return previous&&previous>0?Math.round((current/previous-1)*1000)/10:null}
export function marketSignals(snapshot:MarketSnapshot|null):Signal[]{
 if(!snapshot?.coverageEnd)return [];
 return cities.flatMap(city=>{
 const v=snapshot.cities?.[city.slug];if(!v?.byQuarter?.length)return [];
 const entries=[...v.byQuarter].sort((a,b)=>a.quarter.localeCompare(b.quarter));
 const latest=entries.at(-1)!;const prior=entries.at(-2);
 const oneYear=entries.find(v=>v.quarter===String(Number(latest.quarter.slice(0,4))-1)+latest.quarter.slice(4));
 return [{slug:city.slug,name:city.name,region:city.region,quarter:latest.quarter,median:latest.medianPrice,sales:latest.transactions,previousMedian:prior?.medianPrice??null,previousSales:prior?.transactions??null,yearAgoMedian:oneYear?.medianPrice??null,yearAgoSales:oneYear?.transactions??null,qoq:percentage(latest.medianPrice,prior?.medianPrice),yoy:percentage(latest.medianPrice,oneYear?.medianPrice),salesYoY:percentage(latest.transactions,oneYear?.transactions)}]
 })
}
export function formatPct(v:number|null){return v===null?"N/A":`${v>0?"+":""}${v.toFixed(1)}%`}
export function signalSummary(signal:Signal):string{
 if(signal.yoy===null)return "No comparable year-on-year observation is available.";
 const trend=signal.yoy>0?"higher":signal.yoy<0?"lower":"unchanged";
 const activity=signal.salesYoY===null?"Registered transaction volume cannot yet be compared.":`Recorded transactions are ${Math.abs(signal.salesYoY).toFixed(1)}% ${signal.salesYoY<0?"lower":signal.salesYoY>0?"higher":"unchanged"} than the same quarter last year; recent periods may be under-registered.`;
 return `The median registered sale price in ${signal.name} is ${Math.abs(signal.yoy).toFixed(1)}% ${trend} than in the corresponding quarter last year. ${activity}`
}

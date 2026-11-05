"use client";
import {useEffect,useState} from "react";
type Filters={city:string;min:string;max:string;beds:string};
type Listing={id:string;title:string;city:string;askingPrice:number;bedrooms:number|null;bathrooms:number|null;propertyType:string;listingUrl:string;updatedAt:string;source:string};
type Result={status:string;properties?:Listing[];message?:string;returned?:number;hasMore?:boolean;scope?:string;retrievedAt?:string};
type AreaStats={status:string;activeListings:number|null;avgListingPrice:number|null;avgSoldPrice:number|null;deals:number|null;sourceUrl?:string;note?:string};
const CITIES=["London","Manchester","Birmingham","Liverpool","Leeds","Bristol"];
const KEY="aierra-free-uk-property-searches-v1";
const initial:Filters={city:"London",min:"",max:"",beds:""};
const money=(n:number)=>new Intl.NumberFormat("en-GB",{currency:"GBP",style:"currency",maximumFractionDigits:0}).format(n);
const eligible=(f:Filters)=>[f.min,f.max].every(v=>v===""||(/^\d+$/.test(v)&&Number(v)<=100000000))&&(!f.min||!f.max||Number(f.min)<=Number(f.max));
export function FreeListingsExplorer(){
 const [filters,setFilters]=useState<Filters>(initial);
 const [saved,setSaved]=useState<Filters[]>([]);
 const [ready,setReady]=useState(false);
 const [loading,setLoading]=useState(false);
 const [result,setResult]=useState<Result|null>(null);
 const [areaStats,setAreaStats]=useState<AreaStats|null>(null);
 const [searched,setSearched]=useState<Filters|null>(null);
 useEffect(()=>{try{const raw=JSON.parse(localStorage.getItem(KEY)||"[]") as unknown;if(Array.isArray(raw))setSaved(raw.filter((x):x is Filters=>Boolean(x)&&typeof x==="object"&&CITIES.includes(x.city)&&typeof x.min==="string"&&typeof x.max==="string"&&typeof x.beds==="string").slice(0,12))}catch{}setReady(true)},[]);
 function persist(items:Filters[]){setSaved(items);try{localStorage.setItem(KEY,JSON.stringify(items))}catch{}}
 function update(key:keyof Filters,value:string){setFilters(prev=>({...prev,[key]:value}));}
 function save(){
  if(!eligible(filters)){setResult({status:"invalid",message:"Check the budget range first."});return}
  const key=JSON.stringify(filters);
  persist([filters,...saved.filter(item=>JSON.stringify(item)!==key)].slice(0,12));
 }
 async function search(f:Filters=filters){
  if(!eligible(f)){setResult({status:"invalid",message:"Enter a valid budget range."});return}
  setFilters(f);setSearched(f);setLoading(true);setResult(null);setAreaStats(null);
  const qs=new URLSearchParams({city:f.city});
  if(f.min)qs.set("min",f.min);if(f.max)qs.set("max",f.max);if(f.beds)qs.set("beds",f.beds);
  try{
   const [listResponse,statsResponse]=await Promise.allSettled([
    fetch("/api/free-listings?"+qs.toString(),{cache:"no-store"}),
    fetch("/api/uk-area-stats?city="+encodeURIComponent(f.city),{cache:"no-store"})
   ]);
   if(listResponse.status==="fulfilled")setResult(await listResponse.value.json() as Result);
   else setResult({status:"unavailable",message:"The open listing directory could not be reached."});
   if(statsResponse.status==="fulfilled"&&statsResponse.value.ok){
    const stats=await statsResponse.value.json() as AreaStats;
    if(stats.status==="ok")setAreaStats(stats);
   }
  }catch{setResult({status:"unavailable",message:"The free source request could not be completed."})}
  finally{setLoading(false)}
 }
 const portalCity=searched?.city??filters.city;
 return <div className="open-listings-explorer">
 <div className="free-source-intro"><span className="dashboard-section-index">FREE OPEN LISTINGS / NO API KEY NEEDED</span><strong>Free-source property search</strong><p>Live, user-submitted listings from the Trellistate public API. They are not verified by Aierra’s Journal and may be sparse in UK cities. We never invent property cards or copy portal photographs.</p></div>
 <section className="data-panel"><div className="explorer-title"><div><span className="dashboard-section-index">SEARCH / UNITED KINGDOM</span><h2>Find advertised homes.</h2><p>Search free public inventory by city, asking price and bedrooms. Follow any result to its original listing page.</p></div></div>
 <div className="free-listings-controls"><label>City<select value={filters.city} onChange={e=>update("city",e.target.value)}>{CITIES.map(city=><option key={city} value={city}>{city}</option>)}</select></label><label>Min. asking price (£)<input inputMode="numeric" placeholder="Any" value={filters.min} onChange={e=>update("min",e.target.value)}/></label><label>Max. asking price (£)<input inputMode="numeric" placeholder="Any" value={filters.max} onChange={e=>update("max",e.target.value)}/></label><label>Bedrooms<select value={filters.beds} onChange={e=>update("beds",e.target.value)}><option value="">Any</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}+</option>)}</select></label></div>
 <div className="free-actions"><button type="button" className="primary-link" disabled={loading} onClick={()=>search()}>{loading?"Checking free source…":"Search current listings ↗"}</button><button type="button" className="property-save-button" onClick={save}>Save search +</button></div>
 </section>
 <section className="data-panel"><div className="explorer-title"><div><span className="dashboard-section-index">SAVED SEARCHES / THIS DEVICE</span><h2>Your property interests</h2><p>Revisit up to 12 saved search criteria. These are not server-side alerts and do not automatically monitor listing changes.</p></div></div>
 {!ready?<p>Loading saved searches…</p>:saved.length===0?<p className="explorer-empty">No searches saved. Set your criteria above and select Save search.</p>:<div className="property-saved-grid">{saved.map((s,i)=><article key={JSON.stringify(s)+i}><div><strong>{s.city}</strong><small>{s.min?money(Number(s.min)):"Any minimum"} – {s.max?money(Number(s.max)):"Any maximum"} · {s.beds?s.beds+"+ beds":"Any bedrooms"}</small></div><div><button type="button" onClick={()=>search(s)}>Search again ↗</button><button type="button" onClick={()=>persist(saved.filter((_,j)=>i!==j))}>Remove</button></div></article>)}</div>}
 </section>
 {areaStats?<section className="data-panel area-stats-panel"><div className="explorer-title"><div><span className="dashboard-section-index">LOCAL ASKING-PRICE CONTEXT / VIA BELOWMARKET</span><h2>{searched?.city} market snapshot</h2><p>Aggregated indicators from another free UK data source. Figures may be incomplete, delayed or based on different coverage from the individual listings below.</p></div></div><div className="area-stat-tiles"><div><span>ADVERTISED PROPERTIES TRACKED</span><strong>{areaStats.activeListings===null?"Not reported":areaStats.activeListings.toLocaleString("en-GB")}</strong></div><div><span>AVERAGE TRACKED ASKING PRICE</span><strong>{areaStats.avgListingPrice===null?"Not reported":money(areaStats.avgListingPrice)}</strong></div><div><span>REFERENCE AVERAGE SOLD PRICE</span><strong>{areaStats.avgSoldPrice===null?"Not reported":money(areaStats.avgSoldPrice)}</strong></div></div><p className="dashboard-caveat">Data via <a href={areaStats.sourceUrl||"https://belowmarket.uk/api-docs"} target="_blank" rel="noopener noreferrer">BelowMarket ↗</a>. Not all listings in the market, and not equivalent to a valuation or price index.</p></section>:null}
 <section className="data-panel" aria-live="polite"><div className="explorer-title"><div><span className="dashboard-section-index">RESULTS / LIVE SOURCE</span><h2>Listings returned</h2><p>All advertised figures below are asking prices supplied by posters, not Land Registry transaction prices.</p></div></div>
 {loading?<p className="explorer-empty">Requesting current published listings…</p>:!result?<div className="watch-empty"><strong>Choose a city to start.</strong><p>We will check the free listings provider and show only results actually returned by it.</p></div>:result.status!=="ok"?<div className="watch-empty"><strong>Search could not be completed.</strong><p>{result.message||"The source is unavailable."}</p></div>:result.properties?.length?<><div className="property-results-grid">{result.properties.map(p=><article className="property-result-card" key={p.id}><div className="property-illustration"><span>PUBLIC LISTING</span><small>Photos not republished</small></div><div className="property-result-copy"><span className="dashboard-section-index">{p.propertyType||"Residential property"} · {p.source}</span><h3>{money(p.askingPrice)}</h3><p>{p.title} · {p.city}</p><small>{p.bedrooms!==null?p.bedrooms+" bedrooms":"Bedrooms unspecified"}{p.updatedAt?" · Updated "+p.updatedAt.slice(0,10):""}</small><a href={p.listingUrl} target="_blank" rel="noopener noreferrer">Open original listing ↗</a></div></article>)}</div><p className="dashboard-caveat">Public inventory from Trellistate. Up to 30 matching listings shown. This is not an exhaustive UK market search. Check availability with the poster.</p></>:<div className="watch-empty"><strong>No verified UK listings returned for {searched?.city}.</strong><p>The free directory currently has no qualifying records for these criteria. It is not evidence that this city's market has no properties for sale. For broader current inventory, browse the original property portals below.</p></div>}
 </section>
 <aside className="free-directory-fallback"><div><span className="dashboard-section-index">FULLER MARKET / ORIGINAL SITES</span><h2>Search the primary portals directly.</h2><p>Free open APIs may have little UK inventory. These links open the providers' own live search; their photos, asking prices and descriptions are not copied into Aierra.</p></div><div><a href={"https://www.rightmove.co.uk/property-for-sale/"+encodeURIComponent(portalCity)+".html"} target="_blank" rel="noopener noreferrer">Rightmove — {portalCity} ↗</a><a href="https://www.zoopla.co.uk/for-sale/" target="_blank" rel="noopener noreferrer">Zoopla — UK listings ↗</a><a href="https://www.onthemarket.com/for-sale/" target="_blank" rel="noopener noreferrer">OnTheMarket — UK listings ↗</a></div></aside>
 </div>
}

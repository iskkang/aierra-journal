"use client";
import {useEffect,useState} from "react";
import Link from "next/link";

type Strategy="reduced-properties"|"unmodernised-properties"|"slow-to-sell-properties"|"back-on-market"|"auction-properties"|"properties-with-no-chain";
type Search={id:string;city:string;postcode:string;min:string;max:string;bedrooms:string;strategy:Strategy};
type Listing={id:string;askingPrice:number;address:string;postcode:string;type:string;bedrooms:number|null;listingUrl:string;reducedBy:number|null;retrievedAt:string};
type Result={status:string;message?:string;scope?:string;count?:number;properties?:Listing[]};
const STORAGE="aierra-property-searches-v1";
const cities=["London","Manchester","Birmingham","Liverpool","Leeds","Bristol"];
const strategies:{id:Strategy;label:string}[]=[
 {id:"reduced-properties",label:"Reduced asking prices"},
 {id:"back-on-market",label:"Returned to market"},
 {id:"slow-to-sell-properties",label:"Longer on market"},
 {id:"unmodernised-properties",label:"Needs modernisation"},
 {id:"properties-with-no-chain",label:"No onward chain"},
 {id:"auction-properties",label:"Auction opportunities"},
];
const defaultSearch:Search={id:"",city:"London",postcode:"",min:"",max:"",bedrooms:"",strategy:"reduced-properties"};
const money=(value:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(value);
const portalLink=(city:string)=>"https://www.rightmove.co.uk/property-for-sale/"+encodeURIComponent(city)+".html";
const goodPostcode=(v:string)=>/^[A-Z]{1,2}[0-9][0-9A-Z]?(?:\s?[0-9][A-Z]{2})?$/i.test(v.trim());
const validMoney=(s:string)=>s===""||(/^\d+$/.test(s)&&Number(s)<=100000000);
export function PropertySearchClient(){
 const [form,setForm]=useState<Search>(defaultSearch);
 const [saved,setSaved]=useState<Search[]>([]);
 const [loaded,setLoaded]=useState(false);
 const [result,setResult]=useState<Result|null>(null);
 const [loading,setLoading]=useState(false);
 useEffect(()=>{try{const data=JSON.parse(localStorage.getItem(STORAGE)||"[]");if(Array.isArray(data))setSaved(data.filter(v=>v&&cities.includes(v.city)&&typeof v.id==="string").slice(0,12))}catch{}setLoaded(true)},[]);
 function persist(next:Search[]){setSaved(next);try{localStorage.setItem(STORAGE,JSON.stringify(next))}catch{}}
 function save(){if(!goodPostcode(form.postcode)){setResult({status:"invalid_request",message:"Enter a postcode district (such as SW1 or M1) before saving a targeted search."});return}
 if(!validMoney(form.min)||!validMoney(form.max)||(form.min!==""&&form.max!==""&&Number(form.min)>Number(form.max))){setResult({status:"invalid_request",message:"Check your budget limits."});return}
 const record={...form,id:[form.city,form.postcode.toUpperCase().replace(/\s/g,""),form.min,form.max,form.bedrooms,form.strategy].join(":")};
 persist([record,...saved.filter(s=>s.id!==record.id)].slice(0,12));setResult({status:"saved",message:"Search saved on this device. You can re-run it from your watchlist."})}
 async function search(criteria:Search=form){
  setForm(criteria);
  if(!goodPostcode(criteria.postcode)){setResult({status:"invalid_request",message:"Enter a valid UK postcode district (e.g. SW1, E1 or M1) to search specialist property opportunities."});return}
  if(!validMoney(criteria.min)||!validMoney(criteria.max)||(criteria.min!==""&&criteria.max!==""&&Number(criteria.min)>Number(criteria.max))){setResult({status:"invalid_request",message:"The price range is invalid."});return}
  setLoading(true);setResult(null);
  try{
   const params=new URLSearchParams({postcode:criteria.postcode.trim(),strategy:criteria.strategy});
   if(criteria.min)params.set("min",criteria.min);if(criteria.max)params.set("max",criteria.max);
   const response=await fetch("/api/property-opportunities?"+params.toString(),{cache:"no-store"});
   const data=await response.json() as Result;
   if(data.status==="ok"&&data.properties&&criteria.bedrooms){
    data.properties=data.properties.filter(p=>p.bedrooms!==null&&p.bedrooms>=Number(criteria.bedrooms));
    data.count=data.properties.length;
   }
   setResult(data);
  }catch{setResult({status:"provider_unavailable",message:"The specialist listings service could not be reached."})}finally{setLoading(false)}
 }
 const field=(key:keyof Search,value:string)=>setForm(p=>({...p,[key]:value}));
 return <div className="properties-ui">
 <div className="property-search-layout"><section className="data-panel property-search-form"><span className="dashboard-section-index">01 / SEARCH ACTIVE LISTINGS</span><h2>Find property opportunities.</h2><p className="property-intro">Use a UK postcode district to search a licensed provider’s specialist listings, including asking-price reductions. This is not a complete Rightmove feed.</p>
 <div className="property-fields"><label>Market<select value={form.city} onChange={e=>field("city",e.target.value)}>{cities.map(c=><option key={c}>{c}</option>)}</select></label>
 <label>Postcode district <small>(required for live sourcing)</small><input type="text" maxLength={9} placeholder="e.g. SW1, E1, M1" value={form.postcode} onChange={e=>field("postcode",e.target.value.toUpperCase())}/></label>
 <label>Minimum asking price (£)<input inputMode="numeric" placeholder="No minimum" value={form.min} onChange={e=>field("min",e.target.value)}/></label>
 <label>Maximum asking price (£)<input inputMode="numeric" placeholder="No maximum" value={form.max} onChange={e=>field("max",e.target.value)}/></label>
 <label>Bedrooms (min.)<select value={form.bedrooms} onChange={e=>field("bedrooms",e.target.value)}><option value="">Any</option>{[1,2,3,4,5].map(n=><option value={n} key={n}>{n}+</option>)}</select></label>
 <label>Opportunity type<select value={form.strategy} onChange={e=>field("strategy",e.target.value)}>{strategies.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label></div>
 <div className="property-form-actions"><button className="primary-link" type="button" disabled={loading} onClick={()=>search()}>{loading?"Checking provider…":"Find opportunities ↗"}</button><button className="property-save-button" type="button" onClick={save}>Save this search +</button></div>
 <p className="dashboard-caveat">The selected city is your search label. The postcode determines the API location. Verify that the postcode is within the intended market. Listings are retrieved only on request, not in the background.</p></section>
 <aside className="property-external"><span className="dashboard-section-index">FULL LIVE MARKET / EXTERNAL SOURCE</span><h3>Browse all current advertised properties.</h3><p>The specialist data API does not cover the whole market. For comprehensive live advertisements, use Rightmove’s search and apply your budget, bedrooms and newest/reduced filters on the provider site.</p><a href={portalLink(form.city)} rel="noopener noreferrer" target="_blank" className="primary-link">Open {form.city} listings ↗</a><p className="property-license-note">Rightmove listings, photos, descriptions and asking prices remain on Rightmove. We do not copy their listings without permission.</p></aside></div>
 <section className="data-panel saved-property-searches"><div className="explorer-title"><div><span className="dashboard-section-index">02 / SAVED SEARCHES</span><h2>Your property search shortlist</h2><p>Save up to 12 location-and-budget combinations for repeat searches in this browser.</p></div></div>
 {!loaded?<p>Loading…</p>:saved.length?<div className="property-saved-grid">{saved.map(s=><article key={s.id}><div><strong>{s.city} · {s.postcode}</strong><small>{s.min?money(Number(s.min)):"Any minimum"} — {s.max?money(Number(s.max)):"Any maximum"} · {strategies.find(x=>x.id===s.strategy)?.label}</small></div><div><button type="button" onClick={()=>search(s)}>Run search ↗</button><button type="button" onClick={()=>persist(saved.filter(x=>x.id!==s.id))} aria-label={"Remove "+s.city+" search"}>Remove</button></div></article>)}</div>:<div className="watch-empty"><strong>No saved property searches yet.</strong><p>Define a postcode and your budget, then save it to revisit this location.</p></div>}
 </section>
 <section className="data-panel property-results" aria-live="polite"><div className="explorer-title"><div><span className="dashboard-section-index">03 / LIVE PROVIDER RESULTS</span><h2>Available property opportunities</h2><p>Only verified supplier responses appear here. Asking prices are not sold prices or valuation estimates.</p></div></div>
 {loading?<p className="explorer-empty">Requesting the selected listings…</p>:result?.status==="ok"?<>{result.properties?.length?<div className="property-results-grid">{result.properties.map((p,i)=><article key={p.id+"-"+i} className="property-result-card"><div className="property-illustration"><span>PROPERTY LISTING</span><small>Image omitted — rights not licensed</small></div><div className="property-result-copy"><span className="dashboard-section-index">{p.type||"Listed property"}</span><h3>{money(p.askingPrice)}</h3><p>{p.address||p.postcode||"See source listing for address"}</p><small>{p.bedrooms!==null?p.bedrooms+" bedrooms":"Bedrooms not supplied"}{p.reducedBy!==null?" · Supplier-reported reduction: "+money(p.reducedBy):""}</small><a href={p.listingUrl} rel="noopener noreferrer" target="_blank">View original listing ↗</a></div></article>)}</div>:<div className="watch-empty"><strong>No matching specialist properties returned.</strong><p>Try a broader budget or location, or browse the complete local market on Rightmove.</p></div>}<p className="property-license-note">Source: PropertyData specialist sourcing subset, retrieved on demand. Results do not represent all homes for sale. Photographs are not republished.</p></>:result?<div className="watch-empty"><strong>{result.status==="not_configured"?"Live supplier connection is not enabled.":result.status==="saved"?"Search saved.":"Search unavailable."}</strong><p>{result.message}</p>{result.status==="not_configured"?<p>Search the original listings provider above while the commercial API connection is being configured.</p>:null}</div>:<div className="watch-empty"><strong>Ready to search.</strong><p>Choose a postcode district, price range and strategy above to request current specialist listings.</p></div>}
 </section>
 </div>
}

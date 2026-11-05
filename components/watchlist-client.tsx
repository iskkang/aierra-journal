"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {type Signal,formatPct,signalSummary} from "../lib/market-signals";
type Saved={slugs:string[];lastSeen:Record<string,string>;threshold:number};
const KEY="aierra-watchlist-v1";
const empty:Saved={slugs:[],lastSeen:{},threshold:3};
const price=(v:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(v);
function badgeValue(v:number|null){return v===null?"Not available":formatPct(v)}
export function WatchlistClient({signals,coverageEnd}:{signals:Signal[];coverageEnd:string}){
 const [saved,setSaved]=useState<Saved>(empty);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const o=JSON.parse(raw) as Partial<Saved>;setSaved({slugs:Array.isArray(o.slugs)?o.slugs.filter(v=>signals.some(s=>s.slug===v)):[],lastSeen:o.lastSeen&&typeof o.lastSeen==="object"?o.lastSeen:{},threshold:typeof o.threshold==="number"&&Number.isFinite(o.threshold)?o.threshold:3})}}catch{}setLoaded(true)},[signals]);
 function update(next:Saved){setSaved(next);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}}
 function toggle(slug:string){update({...saved,slugs:saved.slugs.includes(slug)?saved.slugs.filter(s=>s!==slug):[...saved.slugs,slug]})}
 function mark(slug:string){update({...saved,lastSeen:{...saved.lastSeen,[slug]:coverageEnd}})}
 const watched=signals.filter(s=>saved.slugs.includes(s.slug));
 const alerts=watched.filter(s=>s.yoy!==null&&Math.abs(s.yoy)>=saved.threshold);
 const fresh=watched.filter(s=>saved.lastSeen[s.slug]!==coverageEnd);
 return <div className="watchlist-app">
 <div className="watch-summary"><div><span>FOLLOWED MARKETS</span><strong>{loaded?watched.length:"—"}</strong></div><div><span>ABOVE YOUR CHANGE THRESHOLD</span><strong>{loaded?alerts.length:"—"}</strong></div><div><span>NEW SINCE LAST REVIEW</span><strong>{loaded?fresh.length:"—"}</strong></div><div><span>RECORDED DATA THROUGH</span><strong className="watch-date">{coverageEnd}</strong></div></div>
 <section className="data-panel"><div className="explorer-title"><div><span className="dashboard-section-index">01 / PERSONALISE YOUR DATA DESK</span><h2>Follow markets that matter.</h2><p>Select the cities you want to track. Your choices stay in this browser, without an account.</p></div></div><div className="watch-picks">{signals.map(s=><button key={s.slug} type="button" aria-pressed={saved.slugs.includes(s.slug)} className={saved.slugs.includes(s.slug)?"chosen":""} onClick={()=>toggle(s.slug)}><span>{saved.slugs.includes(s.slug)?"✓":"+"}</span><b>{s.name}</b><small>{s.region}</small></button>)}</div>
 <div className="threshold-line"><label htmlFor="change-threshold">Highlight annual median shifts of at least</label><select id="change-threshold" value={saved.threshold} onChange={e=>update({...saved,threshold:Number(e.target.value)})}><option value={1}>1%</option><option value={3}>3%</option><option value={5}>5%</option><option value={10}>10%</option></select><span>Magnitude only, not a recommendation to buy or sell.</span></div>
 </section>
 <section className="data-panel"><div className="explorer-title"><div><span className="dashboard-section-index">02 / YOUR WATCHLIST</span><h2>What changed in your markets?</h2><p>Observed price shifts and transaction volumes, with explicit data limitations.</p></div><Link className="text-link" href="/briefing">Read the briefing ↗</Link></div>
 {!loaded?<p className="explorer-empty">Loading saved selections…</p>:watched.length===0?<div className="watch-empty"><strong>No markets followed yet.</strong><p>Choose a city above to create your personalised dashboard. Its signals will appear here after every official data refresh.</p></div>:<div className="watch-signal-grid">{watched.map(s=>{const flagged=s.yoy!==null&&Math.abs(s.yoy)>=saved.threshold;const isNew=saved.lastSeen[s.slug]!==coverageEnd;return <article key={s.slug} className="watch-signal"><div className="watch-card-top"><span>{s.quarter} · REGISTERED SALES</span>{isNew?<span className="watch-new">UNREVIEWED</span>:<span>REVIEWED</span>}</div><h3>{s.name}</h3><strong>{price(s.median)}</strong><div className="watch-change"><span>MEDIAN Y/Y <b className={s.yoy!==null&&s.yoy<0?"negative-text":""}>{badgeValue(s.yoy)}</b></span><span>SALES Y/Y <b>{badgeValue(s.salesYoY)}</b></span></div>{flagged?<p className="watch-flag">Price change exceeds your {saved.threshold}% threshold</p>:null}<p className="watch-explanation">{signalSummary(s)}</p><div className="watch-card-actions"><Link href={"/markets/"+s.slug}>Full city report ↗</Link><button type="button" onClick={()=>mark(s.slug)} disabled={!isNew}>{isNew?"Mark as reviewed":"Up to date"}</button></div></article>})}</div>}
 </section>
 <p className="watch-privacy">Saved markets and review states use this device’s browser storage. They do not sync across devices and do not send emails or notifications. A new snapshot can be marked as unread after a data update. Change thresholds flag observations, not investment opportunities.</p>
 </div>
}

import Link from "next/link";
import {notFound} from "next/navigation";
import {cities,readMarketSnapshot,gbp} from "../../../lib/markets";
import {SiteHeader,SiteFooter} from "../../../components/site-chrome";
export function generateStaticParams(){return cities.map(city=>({slug:city.slug}))}
const covers:Record<string,string>={
 london:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=85",
 manchester:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
 birmingham:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
 liverpool:"https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=85",
 leeds:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
 bristol:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85"
};
export default async function CityPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const city=cities.find(c=>c.slug===slug);if(!city)notFound();
 const data=await readMarketSnapshot();const stats=data?.cities[slug];
 return <div className="site-wrap"><SiteHeader/><main className="shell market-page">
 <div className="market-top"><Link className="market-back" href="/markets">← All UK markets</Link><span>UK / CITY INTELLIGENCE</span></div>
 <div className="market-hero"><img src={covers[slug]} alt={"Architectural illustration for "+city.name+"; not a verified local photograph"}/></div>
 <div className="market-eyebrow">UNITED KINGDOM / {city.region.toUpperCase()}</div><h1>{city.name} property market.</h1><p className="market-intro">A clearer view of registered residential transactions, prices and market composition. Observations below reflect the complete coverage period, not a live valuation.</p>
 {stats&&data?.coverageEnd?<><div className="market-stats"><div className="stat"><span className="stat-label">MEDIAN RECORDED PRICE</span><strong className="stat-value">{gbp(stats.medianPrice)}</strong></div><div className="stat"><span className="stat-label">RECORDED SALES</span><strong className="stat-value">{stats.transactions.toLocaleString("en-GB")}</strong></div><div className="stat"><span className="stat-label">MEAN RECORDED PRICE</span><strong className="stat-value">{gbp(stats.meanPrice)}</strong></div></div>
 <p className="source-note">Observation period: <strong>{data.coverageStart}–{data.coverageEnd}</strong>. Updated: {data.updatedAt.slice(0,10)}. Source: <a href={data.sourceUrl} target="_blank" rel="noreferrer"><u>HM Land Registry Price Paid Data</u></a>. Unadjusted sale prices; property mix may change between periods.</p>
 <section className="data-section"><h2>Annual market overview</h2><p className="section-note">Recorded residential sales in the administrative districts covered by this city report.</p><div className="table-scroll"><table className="data-table"><thead><tr><th>Year</th><th>Registered sales</th><th>Median price</th></tr></thead><tbody>{stats.byYear.map(v=><tr key={v.year}><td>{v.year}</td><td>{v.transactions.toLocaleString("en-GB")}</td><td>{gbp(v.medianPrice)}</td></tr>)}</tbody></table></div></section>
 {stats.byQuarter?.length?<section className="data-section"><h2>Quarterly price and sales trend</h2><p className="section-note">Recent quarters can be substantially incomplete because registrations lag completion dates.</p><div className="table-scroll"><table className="data-table"><thead><tr><th>Quarter</th><th>Transactions</th><th>Median price</th><th>Mean price</th></tr></thead><tbody>{stats.byQuarter.map(v=><tr key={v.quarter}><td>{v.quarter}</td><td>{v.transactions.toLocaleString("en-GB")}</td><td>{gbp(v.medianPrice)}</td><td>{gbp(v.meanPrice)}</td></tr>)}</tbody></table></div></section>:null}
 {stats.byType?.length?<section className="data-section"><h2>By property type</h2><p className="section-note">Prices represent the whole observation period, with no adjustment for location or floor area.</p><div className="table-scroll"><table className="data-table"><thead><tr><th>Property type</th><th>Transactions</th><th>Median price</th></tr></thead><tbody>{stats.byType.map(v=><tr key={v.type}><td>{v.type}</td><td>{v.transactions.toLocaleString("en-GB")}</td><td>{gbp(v.medianPrice)}</td></tr>)}</tbody></table></div></section>:null}
 </>:<div className="empty-state"><strong>Verified market figures are not yet available.</strong><p>The report will publish prices and transaction volumes after the official records have been collected and validated. We do not display sample values as market facts.</p></div>}
 <section className="methodology"><div className="market-eyebrow">DATA / RESEARCH NOTES</div><h2>Methodology &amp; limitations</h2><p>Prices derive from HM Land Registry Price Paid Data, standard category A transactions, residential property types detached, semi-detached, terraced and flat/maisonette. City boundaries use the administrative districts defined in this project, not entire travel-to-work areas. Median prices are unadjusted for the mix of homes sold.</p><p>The transaction register has a publication lag and recent reporting periods may be revised. Figures are not asking prices, valuations, repeat-sales indices or affordability estimates.</p><p>Contains HM Land Registry data © Crown copyright and database right 2026. Licensed under the Open Government Licence v3.0.</p></section>
 </main><SiteFooter/></div>
}

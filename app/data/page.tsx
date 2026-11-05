import Link from "next/link";
import {cities,readMarketSnapshot} from "../../lib/markets";
import {SiteHeader,SiteFooter} from "../../components/site-chrome";
import {PropertyDataExplorer} from "../../components/property-data-explorer";
export const metadata={title:"UK Property Data Dashboard | Aierra’s Journal",description:"Compare six UK property markets with interactive historical price charts, recorded transaction volumes and quarterly growth rates."};
export default async function PropertyData(){
 const snapshot=await readMarketSnapshot();
 const records=cities.flatMap(c=>{const s=snapshot?.cities[c.slug];return s? [{slug:c.slug,name:c.name,region:c.region,medianPrice:s.medianPrice,transactions:s.transactions,byYear:s.byYear,byQuarter:s.byQuarter??[]}]:[]});
 const complete=records.length===cities.length&&Boolean(snapshot?.coverageEnd);
 const lastQ=records[0]?.byQuarter?.at(-1)?.quarter;
 return <div className="site-wrap"><SiteHeader/><main className="shell market-page property-data-page">
 <div className="market-top"><Link href="/" className="market-back">← Back to the journal</Link><span>UK / PROPERTY DATA</span></div>
 <div className="market-eyebrow">PROPERTY INTELLIGENCE / DATA DESK</div>
 <h1>UK property data.</h1>
 <p className="market-intro">Compare prices, sales activity and changes across six major city markets. Explore official recorded transactions through interactive charts, then open a city report for deeper local analysis.</p>
 <div className="data-overview-band"><div><span>CITY MARKETS</span><strong>06</strong></div><div><span>DATA PROVIDER</span><strong>HM Land Registry</strong></div><div><span>OBSERVATION PERIOD</span><strong>{snapshot?.coverageStart&&snapshot?.coverageEnd?snapshot.coverageStart+" — "+snapshot.coverageEnd:"Verifying source"}</strong></div><div><span>LAST RECORDED QUARTER</span><strong>{lastQ??"Pending"}</strong></div></div>
 {complete?<PropertyDataExplorer records={records} coverageEnd={snapshot!.coverageEnd}/>:<div className="empty-state"><strong>Verified data is currently unavailable.</strong><p>Comparison charts will appear when all six city datasets have been validated. No sample numbers are shown.</p></div>}
 <div className="data-method-note"><div><span className="dashboard-section-index">READING THE DATA</span><h2>What these numbers mean</h2><p>These statistics use completed sales registered with HM Land Registry, not current property advertisements or asking prices. They cover defined administrative districts, with standard category A residential transactions. Market-to-market medians do not account for differences in the size, quality or types of homes sold.</p><p>Registration lag makes recent transaction volumes provisional. A year-on-year change in median price is not the same as a like-for-like price index. Always review the period and category before drawing a conclusion.</p><p>Source: <a href={snapshot?.sourceUrl??"https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads"} target="_blank" rel="noopener noreferrer">HM Land Registry Price Paid Data ↗</a></p></div><div className="data-next-step"><span className="dashboard-section-index">LOCAL INTELLIGENCE</span><h3>Need local detail?</h3><p>See boroughs, property types and individual registered sale records on the city market pages.</p><Link className="primary-link" href="/markets">Browse city markets ↗</Link></div></div>
 </main><SiteFooter/></div>
}
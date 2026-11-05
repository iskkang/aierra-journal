import Link from "next/link";
import {cities,readMarketSnapshot,gbp} from "../lib/markets";
import {SiteHeader,SiteFooter} from "../components/site-chrome";

const images={
 london:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85",
 manchester:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
 birmingham:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
 liverpool:"https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=80",
 leeds:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
 bristol:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
 feature:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=85",
 policy:"https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=900&q=80"
};
export default async function Home(){
 const snapshot=await readMarketSnapshot();
 const live=Boolean(snapshot?.coverageEnd&&Object.keys(snapshot.cities).length===6);
 return <div className="site-wrap"><SiteHeader/><main>
 <section className="hero shell">
 <div className="hero-copy">
 <div className="eyebrow-line"><span className="eyebrow">UNITED KINGDOM / PROPERTY INTELLIGENCE</span><span className="edition-index">VOL. 01 — UK</span></div>
 <h1>Property markets,<br/><em>made clearer.</em></h1>
 <p className="hero-lede">Explore the cities, recorded sale prices and policies shaping the UK housing market—with context beyond the headline numbers.</p>
 <div className="hero-actions"><Link className="primary-link" href="/data">Explore market data <span aria-hidden="true">↗</span></Link><Link className="text-link" href="#journal">Read the journal <span aria-hidden="true">↗</span></Link></div>
 <div className="hero-footnote"><span className="footnote-rule"/>TRANSACTIONS · CITIES · POLICY · INSIGHT</div>
 </div>
 <div className="hero-visual"><img src={images.london} alt="London cityscape featuring the River Thames and central neighbourhoods"/><span className="photo-caption">LONDON, UNITED KINGDOM <span>01 / 06</span></span></div>
 </section>
 <section className="market-strip"><div className="shell market-strip-inner"><div className="strip-heading"><span className="eyebrow">THE DATA DESK</span><strong>UK market coverage</strong></div><div className="strip-stat"><span>MARKETS COVERED</span><strong>06 <small>cities</small></strong></div><div className="strip-stat"><span>DATA SOURCE</span><strong>HM Land Registry</strong></div><div className="strip-stat"><span>LATEST DATA</span><strong>{live?snapshot!.coverageEnd:"Validating"}</strong></div><Link href="/data" className="strip-arrow" aria-label="Explore market data">↗</Link></div></section>
 <section className="section shell" id="markets"><div className="section-head"><div><span className="eyebrow">01 / THE MARKET ATLAS</span><h2>Explore the cities.</h2><p>Six urban markets. One consistent way to read the numbers.</p></div><Link href="/markets" className="text-link">All markets <span>↗</span></Link></div>
 <div className="city-editorial-grid">{cities.map((city,index)=><Link key={city.slug} className={"city-tile city-tile-"+index} href={"/markets/"+city.slug}><div className="tile-image"><img src={images[city.slug as keyof typeof images]} alt={"Architectural illustration for "+city.name+" market; not a verified local photograph"}/><span className="tile-index">0{index+1}</span></div><div className="tile-content"><div><h3>{city.name}</h3><p>{city.region}</p></div><span className="tile-link">Explore ↗</span></div></Link>)}</div>
 </section>
 <section className="journal-section" id="journal"><div className="shell section"><div className="section-head"><div><span className="eyebrow">02 / THE JOURNAL</span><h2>Perspective, not prediction.</h2><p>Property research with clearly stated sources and limits.</p></div><span className="section-aside">INDEPENDENT ANALYSIS</span></div>
 <div className="journal-layout"><Link href="/journal/reading-london-flat-prices" className="lead-story"><div className="lead-image"><img src={images.feature} alt="London residential and urban architecture"/></div><div className="story-meta">MARKET ANALYSIS <span>·</span> LONDON</div><h3>What can London’s recorded flat sales really tell us?</h3><p>A change in the median does not necessarily mean the same home has become cheaper. Understanding the transaction mix matters.</p><span className="story-read">Read analysis ↗</span></Link><div className="side-journal"><article><span className="story-number">01</span><div className="story-meta">DATA NOTES / METHODOLOGY</div><h3>Why recent transaction figures need a second look</h3><p>Registration delays and changing sales composition can alter the apparent direction of a market.</p><Link href="/markets">Explore the methodology ↗</Link></article><article><span className="story-number">02</span><div className="story-meta">POLICY / REFERENCE</div><h3>Start with the rule, not the headline.</h3><p>For property tax and regulatory changes, the effective date and jurisdiction should come before interpretation.</p><a href="https://www.gov.uk/stamp-duty-land-tax" target="_blank" rel="noreferrer">Official UK guidance ↗</a></article></div></div>
 </div></section>
 <section className="closing shell" id="about"><span className="eyebrow">03 / OUR APPROACH</span><div><h2>Data makes the story.<br/><em>Context gives it meaning.</em></h2><p>Aierra’s Journal separates observed transactions from commentary, names its sources, and explains what the figures cannot tell you. We do not publish unverified market statistics or present speculation as fact.</p><Link href="/data" className="primary-link">Explore the data <span>↗</span></Link></div></section>
 </main><SiteFooter/></div>
}

import Link from "next/link";
import {SiteHeader,SiteFooter} from "../../components/site-chrome";
import {FreeListingsExplorer} from "../../components/free-listings-explorer";
export const metadata={title:"Free UK Property Listings | Aierra’s Journal",description:"Search open UK property listings free by city, asking price and bedrooms, save search criteria and follow links to original publishers."};
export default function PropertiesPage(){return <div className="site-wrap"><SiteHeader/><main className="shell market-page properties-page">
<div className="market-top"><Link href="/watchlist" className="market-back">← Your watchlist</Link><span>PROPERTY SEARCH / FREE OPEN DATA</span></div>
<div className="market-eyebrow">ACTIVE ADVERTISEMENTS / ORIGINAL SOURCES</div><h1>Find properties for sale.</h1>
<p className="market-intro">Search available open listings, save location and budget criteria, and open the publisher’s original advertisement. We distinguish current asking prices from recorded sale transactions and show no fabricated property data.</p>
<FreeListingsExplorer/>
<section className="methodology"><span className="dashboard-section-index">SOURCE, COVERAGE & RIGHTS</span><h2>What we can publish for free.</h2><p>The current open feed is Trellistate, whose public read API permits attributed redisplay of listing details. Coverage depends on what property owners and agents choose to submit. It is not a national inventory and availability is not independently verified. Listing images are intentionally not copied. Comprehensive feeds and licensed imagery will require a direct data-sharing arrangement with UK agents or portals.</p><p>The original listings are maintained by their publishers. Asking prices are not verified valuations and are not the same as completed prices in HM Land Registry data.</p></section>
</main><SiteFooter/></div>}

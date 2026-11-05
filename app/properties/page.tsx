import Link from "next/link";
import {SiteHeader,SiteFooter} from "../../components/site-chrome";
import {PropertySearchClient} from "../../components/property-search-client";
export const metadata={title:"Live Properties & Saved Searches | Aierra’s Journal",description:"Search property opportunities in UK postcode districts with saved budget and location filters, and visit original listing providers for all homes currently for sale."};
export default function PropertiesPage(){return <div className="site-wrap"><SiteHeader/><main className="shell market-page properties-page">
<div className="market-top"><Link href="/watchlist" className="market-back">← Your watchlist</Link><span>PROPERTY SEARCH / UNITED KINGDOM</span></div>
<div className="market-eyebrow">ACTIVE LISTINGS / YOUR CRITERIA</div><h1>Discover properties for sale.</h1>
<p className="market-intro">Build a shortlist around your location, budget and property preferences. See licensed investment-sourcing results when the provider connection is active, or browse all live advertisements at the original property portal.</p>
<PropertySearchClient/>
<section className="methodology"><span className="dashboard-section-index">ABOUT LISTINGS</span><h2>Asking price is not transaction value.</h2><p>Current advertisements and HM Land Registry completed sales come from different sources. A price cut does not establish a property’s fair value. Compare condition, size, tenure and location before evaluating an opportunity. This service does not reproduce portal photographs or imply that a limited sourcing feed includes all homes on the market.</p></section>
</main><SiteFooter/></div>}

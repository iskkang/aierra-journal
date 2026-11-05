# Live property listings: licensed source integration

## Current product behaviour

- `/properties` is the primary property-search page, with local saved search criteria.
- Buyers can select a city label, input a UK postcode district, set an asking-price range, minimum bedrooms and a specialist sourcing strategy.
- If the live feed is not enabled, the page explicitly says so; the user can open the original Rightmove city listing search.
- If enabled, `/api/property-opportunities` proxies the PropertyData `/sourced-properties` endpoint using a server-only API key. It limits requests to one sourcing list, a five-mile radius and ten results per user action. Results link to the source listing; the site does not reproduce third-party photographs.
- PropertyData sourcing covers *selected investment strategies* only, **not all homes currently on the market**.
- No background listing polling, deduplication history, price-change history, email alerts, map pins or comprehensive listing feed has been implemented.

## Source and licensing

Source documents:
- https://propertydata.co.uk/api/documentation/sourced-properties
- https://propertydata.co.uk/api/documentation/property-lists
- https://propertydata.co.uk/api/documentation/licensing

The provider authorises displaying sourced data in a value-added app but restricts raw resale/feed clones and current-result caching to 60 days. It does **not** license third-party listing photographs. We intentionally omit photographs until rights are obtained. Licensed listing links point to the provider's forwarding links. Never scrape Rightmove/Zoopla or reconstruct their source listing URLs.

## Activation (not enabled by default)

1. Sign up with PropertyData and verify the plan's API credits and relevant endpoint access.
2. In Vercel project settings, add a **server-side** environment secret named `PROPERTYDATA_API_KEY`. Never put the key in GitHub or a `NEXT_PUBLIC_` variable.
3. **Before setting `PROPERTYDATA_LIVE_ENABLED=true` for public traffic, add persistent request quotas, per-IP/user rate limiting and spend alerts.** A public search endpoint can otherwise exhaust paid credits. Test provider response field mapping, list support, postcode district handling, external listing links and errors on a protected preview.
4. Once controls and integration tests pass, enable the flag and redeploy. The data must be clearly marked as a specialist subset with retrieval date and original listing link.
5. If the service is disabled or unavailable, retain the original-portal browsing option and show no fabricated properties.

## Follow-on work

- Supplier contract covering a comprehensive live residential feed, licensed photos, redistribution and permissible retention.
- Durable, budget-controlled polling and event history (first seen / asking-price changed / removed) per saved search.
- User accounts, database-backed watchlists and notifications only after privacy, consent and user authentication are in place.
- Quality filters for location / tenure / EPC / bed counts, and credible sold-price comparisons for genuinely similar homes.

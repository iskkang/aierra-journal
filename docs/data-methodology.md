# UK property data methodology

## Source
HM Land Registry Price Paid Data (England and Wales), licensed under the Open Government Licence v3.0.

Contains HM Land Registry data © Crown copyright and database right 2021. This data is licensed under the Open Government Licence v3.0.

Official documentation: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads

## Import
1. Locate a verified yearly CSV download on the official site.
2. In GitHub Actions, run **Import UK Price Paid Data** and paste its official `publicdata.landregistry.gov.uk` URL.
3. The workflow downloads the CSV, validates records and writes `data/market-snapshot.json`. A commit triggers Vercel deployment when Git integration is active.

The workflow is deliberately manual until source URLs and a robust incremental refresh procedure are verified. Do not treat a single yearly import as a complete market history.

## Calculation
Standard category A; property types D/S/T/F; price greater than zero; grouping by HMLR district. Median and arithmetic mean are transaction-weighted, unadjusted nominal prices. Coverage dates refer to deed/sale dates. Transaction count is not the number of unique homes. London uses a specified list of London boroughs; other city pages use their corresponding local authority district. Greater metro areas are excluded.

## Known limitations
- Registration delays and retrospective corrections; latest months incomplete.
- Geographic coverage excludes Scotland and Northern Ireland.
- Unadjusted medians change with property mix.
- Category B transactions excluded.
- Yearly file is not all-years history.
- Future refresh must account for deletions/amendments using corrected annual snapshots or explicit status handling.

Never publish placeholder statistics as facts. Do not claim live automated ingestion until a workflow run succeeds.

#!/usr/bin/env python3
"""Aggregate HM Land Registry yearly Price Paid Data CSV into public city summaries.
Usage: python scripts/build-market-data.py --csv path/to/pp-2025.csv --source-url https://...
Never silently publish partial downloads or synthetic statistics.
"""
import argparse,csv,json,statistics,datetime,pathlib,collections,sys
DISTRICTS={
"london":set("CITY OF WESTMINSTER|CAMDEN|ISLINGTON|HACKNEY|TOWER HAMLETS|SOUTHWARK|LAMBETH|WANDSWORTH|KENSINGTON AND CHELSEA|HAMMERSMITH AND FULHAM|GREENWICH|LEWISHAM|NEWHAM|BRENT|EALING|BARNET|ENFIELD|HARINGEY|HOUNSLOW|RICHMOND UPON THAMES|KINGSTON UPON THAMES|MERTON|SUTTON|CROYDON|BROMLEY|BEXLEY|HAVERING|REDBRIDGE|WALTHAM FOREST|HILLINGDON|HARROW|BARKING AND DAGENHAM|CITY OF LONDON".split("|")),
"manchester":{"MANCHESTER"},"birmingham":{"BIRMINGHAM"},"liverpool":{"LIVERPOOL"},"leeds":{"LEEDS"},"bristol":{"CITY OF BRISTOL","BRISTOL"}}
def main():
 p=argparse.ArgumentParser();p.add_argument("--csv",required=True);p.add_argument("--source-url",required=True);p.add_argument("--output",default="data/market-snapshot.json");args=p.parse_args()
 if not args.source_url.startswith("https://"):p.error("source URL must be https")
 data={c:collections.defaultdict(list) for c in DISTRICTS};seen=set();min_date=None;max_date=None;total=0
 with open(args.csv,newline="",encoding="utf-8-sig") as f:
  for row in csv.reader(f):
   if len(row)<16:continue
   ident,price,date,postcode,kind,old,tenure,paon,saon,street,locality,town,district,county,category,status=row[:16]
   if ident in seen:raise ValueError("Duplicate transaction ID: "+ident)
   seen.add(ident)
   if category.upper()!="A" or kind.upper() not in ("D","S","T","F"):continue
   try:
    amount=int(price);day=datetime.date.fromisoformat(date[:10])
   except ValueError:continue
   if amount<=0:continue
   for city,districts in DISTRICTS.items():
    if district.upper().strip() in districts:
     data[city][str(day.year)].append(amount);total+=1
     min_date=min(min_date,day) if min_date else day;max_date=max(max_date,day) if max_date else day
 if total<100:raise ValueError("Insufficient matching records; refusing to overwrite output")
 result={"source":"HM Land Registry Price Paid Data","sourceUrl":args.source_url,"updatedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"coverageStart":min_date.isoformat(),"coverageEnd":max_date.isoformat(),"scope":"England and Wales; standard category A; residential D/S/T/F; administrative district grouping","cities":{}}
 for city,years in data.items():
  all_prices=[p for prices in years.values() for p in prices]
  if not all_prices:continue
  result["cities"][city]={"transactions":len(all_prices),"medianPrice":round(statistics.median(all_prices)),"meanPrice":round(statistics.mean(all_prices)),"byYear":[{"year":y,"transactions":len(prices),"medianPrice":round(statistics.median(prices))} for y,prices in sorted(years.items())]}
 out=pathlib.Path(args.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("Wrote",out,"with",total,"matching transactions")
if __name__=="__main__":main()

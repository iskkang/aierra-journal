#!/usr/bin/env python3
"""Build verifiable city-level UK market statistics from official annual HMLR Price Paid CSVs."""
import argparse
import collections
import csv
import datetime as dt
import json
import pathlib
import statistics

DISTRICTS = {
 "london": set("CITY OF WESTMINSTER|CAMDEN|ISLINGTON|HACKNEY|TOWER HAMLETS|SOUTHWARK|LAMBETH|WANDSWORTH|KENSINGTON AND CHELSEA|HAMMERSMITH AND FULHAM|GREENWICH|LEWISHAM|NEWHAM|BRENT|EALING|BARNET|ENFIELD|HARINGEY|HOUNSLOW|RICHMOND UPON THAMES|KINGSTON UPON THAMES|MERTON|SUTTON|CROYDON|BROMLEY|BEXLEY|HAVERING|REDBRIDGE|WALTHAM FOREST|HILLINGDON|HARROW|BARKING AND DAGENHAM|CITY OF LONDON".split("|")),
 "manchester": {"MANCHESTER"},
 "birmingham": {"BIRMINGHAM"},
 "liverpool": {"LIVERPOOL"},
 "leeds": {"LEEDS"},
 "bristol": {"CITY OF BRISTOL", "BRISTOL"},
}
DISTRICT_TO_CITY = {district:city for city, districts in DISTRICTS.items() for district in districts}
TYPES = {"D":"Detached","S":"Semi-detached","T":"Terraced","F":"Flat/maisonette"}

def summarise(prices):
 return {"transactions":len(prices),"medianPrice":round(statistics.median(prices)),"meanPrice":round(statistics.mean(prices))}

def main():
 parser=argparse.ArgumentParser()
 parser.add_argument("--csv",required=True,nargs="+")
 parser.add_argument("--source-url",required=True)
 parser.add_argument("--output",default="data/market-snapshot.json")
 args=parser.parse_args()
 if not args.source_url.startswith("https://"):parser.error("Official source must be HTTPS")
 annual=collections.defaultdict(lambda:collections.defaultdict(list))
 quarterly=collections.defaultdict(lambda:collections.defaultdict(list))
 kinds=collections.defaultdict(lambda:collections.defaultdict(list))
 all_prices=collections.defaultdict(list)
 districts=collections.defaultdict(lambda:collections.defaultdict(list))
 recent=collections.defaultdict(list)
 seen=set()
 date_min=date_max=None
 rows=0
 for filename in args.csv:
  file_rows=0
  with open(filename,encoding="utf-8-sig",newline="") as fh:
   for row in csv.reader(fh):
    if len(row)!=16:continue
    identifier,price,date,postcode,kind,old,tenure,paon,saon,street,locality,town,district,county,category,status=row
    if category.upper()!="A" or kind.upper() not in TYPES:continue
    city=DISTRICT_TO_CITY.get(district.upper().strip())
    if city is None:continue
    if identifier in seen:raise ValueError("Duplicate transaction ID: "+identifier)
    seen.add(identifier)
    try:
     amount=int(price)
     day=dt.date.fromisoformat(date[:10])
    except ValueError:continue
    if amount<=0:continue
    year=str(day.year)
    quarter=f"{day.year} Q{(day.month-1)//3+1}"
    annual[city][year].append(amount)
    quarterly[city][quarter].append(amount)
    kinds[city][kind.upper()].append(amount)
    all_prices[city].append(amount)
    districts[city][district.upper().strip()].append(amount)
    recent[city].append((day.isoformat(),identifier,amount,kind.upper(),postcode,street,town,district))
    date_min=min(date_min,day) if date_min else day
    date_max=max(date_max,day) if date_max else day
    file_rows+=1
    rows+=1
  if file_rows<100:raise ValueError(f"Unexpectedly few eligible city transactions in {filename}: {file_rows}")
 if rows<10000 or len(all_prices)!=len(DISTRICTS):raise ValueError("Incomplete input: expected all six cities and at least 10,000 transactions")
 now=dt.datetime.now(dt.timezone.utc)
 result={
  "source":"HM Land Registry Price Paid Data",
  "sourceUrl":args.source_url,
  "updatedAt":now.isoformat(),
  "coverageStart":date_min.isoformat(),
  "coverageEnd":date_max.isoformat(),
  "scope":"England and Wales; standard category A; property types D/S/T/F; administrative districts; nominal, unadjusted prices",
  "cities":{}
 }
 for city in DISTRICTS:
  years=annual[city]
  if not years:raise ValueError("No transactions for "+city)
  result["cities"][city]={
   **summarise(all_prices[city]),
   "byYear":[{"year":y,**summarise(v)} for y,v in sorted(years.items())],
   "byQuarter":[{"quarter":q,**summarise(v)} for q,v in sorted(quarterly[city].items())],
   "byType":[{"type":TYPES[k],**summarise(v)} for k,v in sorted(kinds[city].items())],
   "byDistrict":[{"district":d.title(),**summarise(v)} for d,v in sorted(districts[city].items()) if len(v)>=30],
   "recentSales":[{"date":d,"price":price,"type":TYPES[kind],"postcode":pc,"street":street.title(),"town":town.title(),"district":district.title()} for d,uid,price,kind,pc,street,town,district in sorted(recent[city],reverse=True)[:18]]
  }
 output=pathlib.Path(args.output)
 output.parent.mkdir(parents=True,exist_ok=True)
 output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print(f"Validated {rows:,} eligible sales across {len(all_prices)} cities; wrote {output}")
if __name__=="__main__":main()

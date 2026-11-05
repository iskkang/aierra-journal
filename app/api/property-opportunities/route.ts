import {NextRequest,NextResponse} from "next/server";

export const runtime="nodejs";
export const dynamic="force-dynamic";
type Raw=Record<string,unknown>;
const allowedLists=new Set(["reduced-properties","unmodernised-properties","slow-to-sell-properties","back-on-market","auction-properties","properties-with-no-chain"]);
const asText=(v:unknown)=>typeof v==="string"?v:"";
const asNumber=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v:typeof v==="string"&&v.trim()!==""&&Number.isFinite(Number(v))?Number(v):null;
const isHttps=(v:string)=>{try{return new URL(v).protocol==="https:"}catch{return false}};
export async function GET(request:NextRequest){
 // Opt-in prevents the public endpoint from consuming paid credits before a budget/rate limit is configured.
 const key=process.env.PROPERTYDATA_API_KEY;
 if(!key||process.env.PROPERTYDATA_LIVE_ENABLED!=="true"){
  return NextResponse.json({status:"not_configured",message:"Live property sourcing has not been activated. Open a licensed provider's website to inspect current listings.",properties:[]},{headers:{"Cache-Control":"no-store"}});
 }
 const params=request.nextUrl.searchParams;
 const postcode=asText(params.get("postcode")).trim().toUpperCase();
 if(!/^[A-Z]{1,2}[0-9][0-9A-Z]?(?:\s?[0-9][A-Z]{2})?$/.test(postcode))return NextResponse.json({status:"invalid_request",message:"Enter a valid UK postcode or postcode district."},{status:400});
 const list=asText(params.get("strategy"))||"reduced-properties";
 if(!allowedLists.has(list))return NextResponse.json({status:"invalid_request",message:"Unknown sourcing strategy"},{status:400});
 const min=asNumber(params.get("min"));const max=asNumber(params.get("max"));
 if((min!==null&&(min<0||min>100000000))||(max!==null&&(max<0||max>100000000))||(min!==null&&max!==null&&min>max))return NextResponse.json({status:"invalid_request",message:"Invalid price range"},{status:400});
 // One credit per request; explicit user action only; fixed 10 results and a small radius.
 const upstream=new URL("https://api.propertydata.co.uk/sourced-properties");
 upstream.searchParams.set("postcode",postcode);
 upstream.searchParams.set("list",list);
 upstream.searchParams.set("radius","5");
 upstream.searchParams.set("results","10");
 upstream.searchParams.set("exclude_sstc","1");
 if(min!==null)upstream.searchParams.set("min_price",String(min));
 if(max!==null)upstream.searchParams.set("max_price",String(max));
 try{
  const response=await fetch(upstream.toString(),{headers:{"X-API-Key":key,"Accept":"application/json"},signal:AbortSignal.timeout(12000),cache:"no-store"});
  if(!response.ok)return NextResponse.json({status:"provider_unavailable",message:"The listings provider is temporarily unavailable."},{status:502});
  const body=await response.json() as Raw;
  const items=Array.isArray(body.properties)?body.properties:[];
  const properties=items.slice(0,10).filter((x):x is Raw=>!!x&&typeof x==="object"&&!Array.isArray(x)).map((item,index)=>{
   const listingLink=[item.url,item.listing_url,item.link].map(asText).find(isHttps)??"";
   return {id:asText(item.id)||asText(item.property_id)||String(index),askingPrice:asNumber(item.price)??asNumber(item.asking_price),address:asText(item.address)||asText(item.summary),postcode:asText(item.postcode),type:asText(item.type_standardised)||asText(item.type),bedrooms:asNumber(item.bedrooms),listingUrl:listingLink,reducedBy:asNumber(item.reduced_by),source:"PropertyData",retrievedAt:new Date().toISOString()};
  }).filter(p=>p.askingPrice!==null&&p.listingUrl!=="");
  return NextResponse.json({status:"ok",scope:"Specialist investment sourcing subset — not all properties currently for sale",count:properties.length,properties},{headers:{"Cache-Control":"private, no-store"}});
 }catch{
  return NextResponse.json({status:"provider_unavailable",message:"The property feed could not be reached."},{status:502});
 }
}

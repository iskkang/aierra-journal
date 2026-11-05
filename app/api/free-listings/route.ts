import {NextRequest,NextResponse} from "next/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";

const cities=new Set(["London","Manchester","Birmingham","Liverpool","Leeds","Bristol"]);
type Entry=Record<string,unknown>;
const str=(v:unknown)=>typeof v==="string"?v:"";
const num=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v:null;
function safeListingLink(value:string){
 try{const u=new URL(value);return u.protocol==="https:"&&u.hostname==="trellistate.com"?"https://trellistate.com"+u.pathname:""}catch{return ""}
}
export async function GET(req:NextRequest){
 const p=req.nextUrl.searchParams;
 const city=p.get("city")||"London";
 if(!cities.has(city))return NextResponse.json({status:"invalid",message:"Unsupported UK city"},{status:400});
 const min=p.get("min")||"",max=p.get("max")||"",beds=p.get("beds")||"";
 for(const input of [min,max])if(input!==""&&(!/^\d{1,9}$/.test(input)||Number(input)>100000000))return NextResponse.json({status:"invalid",message:"Invalid asking price"},{status:400});
 if(min&&max&&Number(min)>Number(max))return NextResponse.json({status:"invalid",message:"Minimum price exceeds maximum price"},{status:400});
 if(beds&&!/^[1-5]$/.test(beds))return NextResponse.json({status:"invalid",message:"Invalid bedrooms filter"},{status:400});
 const url=new URL("https://trellistate.com/api/v1/listings");
 url.searchParams.set("city",city);
 url.searchParams.set("listing_type","sale");
 url.searchParams.set("status","active");
 url.searchParams.set("sort","newest");
 url.searchParams.set("limit","100");
 if(min)url.searchParams.set("min_price",min);
 if(max)url.searchParams.set("max_price",max);
 if(beds)url.searchParams.set("beds",beds);
 try{
  const upstream=await fetch(url,{headers:{"Accept":"application/json","User-Agent":"AierraJournal/1.0 (public listings discovery)"},next:{revalidate:600},signal:AbortSignal.timeout(8000)});
  if(!upstream.ok)return NextResponse.json({status:"unavailable",message:"The free listings directory is temporarily unavailable.",properties:[]},{status:502});
  const body=await upstream.json() as {data?:unknown;next_cursor?:unknown};
  const items=Array.isArray(body.data)?body.data:[];
  const filtered=items.filter((x):x is Entry=>!!x&&typeof x==="object"&&!Array.isArray(x)).filter(x=>{
   const sourceCity=str(x.city).toLowerCase();
   const country=str(x.country).toUpperCase();
   const currency=str(x.currency).toUpperCase();
   const listingType=str(x.listing_type);
   const status=str(x.status);
   return sourceCity===city.toLowerCase()&&(country===""||["GB","GBR","UNITED KINGDOM","UK"].includes(country))&&currency==="GBP"&&listingType==="sale"&&status==="active";
  });
  const properties=filtered.map(x=>{
   const link=safeListingLink(str(x.url));
   const amount=num(x.price);
   return {
    id:str(x.id),title:str(x.title),address:str(x.title),city:str(x.city),
    askingPrice:amount,bedrooms:num(x.beds),bathrooms:num(x.baths),propertyType:str(x.property_type),
    listingUrl:link,updatedAt:str(x.updated_at),source:"Trellistate"
   };
  }).filter(x=>x.id&&x.listingUrl&&x.askingPrice!==null&&x.askingPrice>0).slice(0,30);
  return NextResponse.json({status:properties.length?"ok":"empty",provider:"Trellistate",properties,returned:properties.length,hasMore:Boolean(body.next_cursor),message:properties.length?"":"No qualifying current UK listings were returned from Trellistate. Use the direct market search links below.",scope:"User-submitted open listings. Availability and accuracy are supplied by individual posters; not the whole UK market.",retrievedAt:new Date().toISOString()},{headers:{"Cache-Control":"public, s-maxage=600, stale-while-revalidate=120"}});
 }catch{return NextResponse.json({status:"unavailable",message:"The free listings directory did not respond.",properties:[]},{status:502})}
}

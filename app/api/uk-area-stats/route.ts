import {NextRequest,NextResponse} from "next/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const cities=new Set(["London","Manchester","Birmingham","Liverpool","Leeds","Bristol"]);
function count(v:unknown){return typeof v==="number"&&Number.isFinite(v)&&v>=0?v:null}
export async function GET(req:NextRequest){
 const area=req.nextUrl.searchParams.get("city")||"London";
 if(!cities.has(area))return NextResponse.json({status:"invalid"},{status:400});
 const target=new URL("https://belowmarket.uk/api/area-stats");
 target.searchParams.set("area",area.toLowerCase());
 try{
  const response=await fetch(target,{next:{revalidate:3600},signal:AbortSignal.timeout(7000),headers:{"Accept":"application/json"}});
  if(!response.ok)return NextResponse.json({status:"unavailable",source:"BelowMarket",message:"Area statistics are temporarily unavailable."},{status:502});
  const data=await response.json() as Record<string,unknown>;
  return NextResponse.json({
   status:"ok",source:"BelowMarket",area,
   activeListings:count(data.activeListings),
   avgListingPrice:count(data.avgListingPrice),
   deals:count(data.deals),
   avgSoldPrice:count(data.avgSoldPrice),
   sourceUrl:"https://belowmarket.uk/api-docs",
   note:"Approximate third-party area aggregate, not a complete listing feed; source coverage and freshness vary."
  },{headers:{"Cache-Control":"public, s-maxage=3600, stale-while-revalidate=600"}});
 }catch{return NextResponse.json({status:"unavailable",source:"BelowMarket",message:"Free area statistics could not be retrieved."},{status:502})}
}

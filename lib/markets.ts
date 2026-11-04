export const cities = [
{slug:"london",name:"London",region:"Greater London",towns:[],districts:["CITY OF WESTMINSTER","CAMDEN","ISLINGTON","HACKNEY","TOWER HAMLETS","SOUTHWARK","LAMBETH","WANDSWORTH","KENSINGTON AND CHELSEA","HAMMERSMITH AND FULHAM","GREENWICH","LEWISHAM","NEWHAM","BRENT","EALING","BARNET","ENFIELD","HARINGEY","HOUNSLOW","RICHMOND UPON THAMES","KINGSTON UPON THAMES","MERTON","SUTTON","CROYDON","BROMLEY","BEXLEY","HAVERING","REDBRIDGE","WALTHAM FOREST","HILLINGDON","HARROW","BARKING AND DAGENHAM","CITY OF LONDON"]},
{slug:"manchester",name:"Manchester",region:"Greater Manchester",towns:[],districts:["MANCHESTER"]},
{slug:"birmingham",name:"Birmingham",region:"West Midlands",towns:[],districts:["BIRMINGHAM"]},
{slug:"liverpool",name:"Liverpool",region:"Merseyside",towns:[],districts:["LIVERPOOL"]},
{slug:"leeds",name:"Leeds",region:"West Yorkshire",towns:[],districts:["LEEDS"]},
{slug:"bristol",name:"Bristol",region:"South West England",towns:[],districts:["CITY OF BRISTOL","BRISTOL"]},
] as const;
export type MarketSnapshot={source:string;sourceUrl:string;updatedAt:string;coverageStart:string;coverageEnd:string;scope:string;cities:Record<string,{transactions:number;medianPrice:number;meanPrice:number;byYear:{year:string;transactions:number;medianPrice:number;meanPrice:number}[];byQuarter?:{quarter:string;transactions:number;medianPrice:number;meanPrice:number}[];byType?:{type:string;transactions:number;medianPrice:number;meanPrice:number}[]}>};
export async function readMarketSnapshot():Promise<MarketSnapshot|null>{try{const data=await import("../data/market-snapshot.json");return data.default as MarketSnapshot}catch{return null}}
export function gbp(n:number){return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(n)}

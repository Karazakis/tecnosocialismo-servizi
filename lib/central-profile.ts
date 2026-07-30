import type { ServiceCategory } from "./catalog";
import type { ServiceDemand, ServiceProfile } from "./model";

const AUTH_ORIGIN=process.env.AUTH_ORIGIN??"https://login.tecnosocialismo.com";
type Preference={id:string;domain:"goods"|"services"|"work"|"leisure"|"education";category:string;item:string;priority:string;enabled:boolean};
type CentralProfile={city:string;postalCode:string;radiusKm:number;basket:Preference[];work:{skills:string[]};contribution:{availability:string;productiveActivities:string[];resources:string[]};updatedAt:string};

export async function getCentralServiceProfile(headers:Headers):Promise<ServiceProfile|null>{
  const cookie=headers.get("cookie");if(!cookie)return null;
  try{const response=await fetch(`${AUTH_ORIGIN}/api/economic-profile`,{headers:{cookie},cache:"no-store"});if(!response.ok)return null;const payload=await response.json() as {profile?:CentralProfile|null};const profile=payload.profile;if(!profile)return null;return{city:profile.city,postalCode:profile.postalCode,radiusKm:profile.radiusKm,needs:profile.basket.filter((item)=>item.enabled&&(item.domain==="services"||item.domain==="education")&&item.category!=="salute").map((item)=>({id:item.id,category:portalCategory(item),item:item.item,priority:item.priority})),skills:[...(profile.work.skills??[]),...(profile.contribution.productiveActivities??[])],availability:profile.contribution.availability??"",resources:profile.contribution.resources??[],updatedAt:profile.updatedAt}}catch{return null}
}
export async function getCentralServiceDemand():Promise<ServiceDemand[]>{try{const response=await fetch(`${AUTH_ORIGIN}/api/economic-profile/service-demand`,{cache:"no-store"});if(!response.ok)return[];const payload=await response.json() as {demand?:ServiceDemand[]};return(payload.demand??[]).filter((item)=>item.people>0&&(item as {category:string}).category!=="salute")}catch{return[]}}
function portalCategory(item:Preference):ServiceCategory{if(item.domain==="education"||item.category==="didattica"||item.category==="formazione")return"didattica";if(item.category==="salute")return"salute";if(item.category==="cura")return"cura";return"tecnico"}

import type { ServiceCategory } from "./catalog";
export type ServiceMode="online"|"domicilio"|"luogo"|"ibrido";
export type PriceUnit="ora"|"sessione"|"intervento"|"gratuito";
export type ServicePlace={name:string;address:string;city:string;accessibility:string};
export type ServiceProfile={city:string;postalCode:string;radiusKm:number;needs:{id:string;category:ServiceCategory;item:string;priority:string}[];skills:string[];availability:string;resources:string[];updatedAt:string};
export type ServiceDemand={key:string;category:ServiceCategory;item:string;people:number;totalHours:number;cadence:string;essentialCount:number};
export type ProviderOrganization={id:string;name:string;model:"capitalista"|"tecnosocialista";city:string};
export type ServiceOffer={
  id:string;providerId:string;providerName:string;providerType:"persona"|"organizzazione";organizationId?:string;organizationModel?:"capitalista"|"tecnosocialista";
  category:ServiceCategory;subcategory:string;title:string;description:string;tags:string[];mode:ServiceMode;city:string;radiusKm:number;
  place?:ServicePlace;availability:string;durationMinutes:number;marketPrice:number;askingPrice:number;priceUnit:PriceUnit;
  languages:string[];qualification?:string;registerReference?:string;verification:"non-richiesta"|"in-verifica"|"verificata";
  rating:number;ratingCount:number;completedCount:number;status:"pubblicato"|"in-verifica"|"sospeso";createdAt:string;
};
export type ServiceRequest={id:string;serviceId:string;serviceTitle:string;providerId:string;requesterId:string;requesterName:string;mode:ServiceMode;preferredDate:string;city:string;message:string;status:"richiesta"|"confermata"|"completata"|"annullata";createdAt:string};
export type ServiceReview={id:string;serviceId:string;requestId:string;authorId:string;rating:number;comment:string;createdAt:string};
export type ServicesDashboard={configured:boolean;viewerId:string|null;profile:ServiceProfile|null;demand:ServiceDemand[];organizations:ProviderOrganization[];offers:ServiceOffer[];requests:ServiceRequest[];reviews:ServiceReview[]};
export function safeText(value:unknown,max=240){return typeof value==="string"?value.trim().replace(/\0/g,"").slice(0,max):""}
export function safeNumber(value:unknown,min:number,max:number,fallback=min){const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
export function safeList(value:unknown,max=20){if(Array.isArray(value))return value.flatMap((item)=>safeText(item,100)?[safeText(item,100)]:[]).slice(0,max);return safeText(value,1200).split(",").map((item)=>item.trim()).filter(Boolean).slice(0,max)}

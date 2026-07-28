import { getSuiteUser } from "@/lib/auth";
import { serviceCategories, type ServiceCategory } from "@/lib/catalog";
import { getCentralServiceProfile } from "@/lib/central-profile";
import type { PriceUnit, ServiceMode, ServiceOffer, ServiceRequest, ServiceReview } from "@/lib/model";
import { safeList, safeNumber, safeText } from "@/lib/model";
import { findRequest, findService, hasReview, loadServices, saveOffer, saveRequest, saveReview, updateRequest } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getSuiteUser(request.headers);
  if (!user) return fail("Accedi con il tuo account Tecnosocialismo.", 401);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return fail("Archivio non configurato.", 503);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = safeText(body?.action, 50);

  if (action === "create-offer") {
    const profile = await getCentralServiceProfile(request.headers);
    if (!profile) return fail("Completa prima le preferenze del tuo profilo centrale.", 409);
    const category = categoryValue(body?.category), title = safeText(body?.title, 140), description = safeText(body?.description, 1200);
    const subcategory = safeText(body?.subcategory, 100), city = safeText(body?.city, 80), availability = safeText(body?.availability, 180);
    const mode = modeValue(body?.mode), priceUnit = unitValue(body?.priceUnit);
    if (!title || !description || !subcategory || !availability || (!city && mode !== "online")) return fail("Completa titolo, descrizione, ambito, disponibilità e città.");
    const providerType = body?.providerType === "organizzazione" ? "organizzazione" : "persona";
    const network = await loadServices(user);
    const organization = providerType === "organizzazione" ? network.organizations.find((item) => item.id === safeText(body?.organizationId, 90)) : undefined;
    if (providerType === "organizzazione" && !organization) return fail("Non puoi pubblicare per questa organizzazione.", 403);
    const place = mode === "luogo" || mode === "ibrido" ? {
      name: safeText(body?.placeName, 140), address: safeText(body?.placeAddress, 180), city: safeText(body?.placeCity, 80) || city,
      accessibility: safeText(body?.accessibility, 240) || "Informazioni da chiedere al fornitore",
    } : undefined;
    if (place && (!place.name || !place.address || !place.city)) return fail("Indica nome, indirizzo e città del luogo.");
    const qualification = safeText(body?.qualification, 160), registerReference = safeText(body?.registerReference, 180);
    if (category === "salute" && (!qualification || !registerReference)) return fail("Per i servizi di salute indica qualifica e riferimento professionale.");
    const offer: ServiceOffer = {
      id: crypto.randomUUID(), providerId: user.id, providerName: organization?.name ?? user.name,
      providerType, organizationId: organization?.id, organizationModel: organization?.model,
      category, subcategory, title, description, tags: safeList(body?.tags, 12), mode, city: mode === "online" ? "Online" : city,
      radiusKm: safeNumber(body?.radiusKm, 0, 250, profile.radiusKm || 15), place, availability,
      durationMinutes: safeNumber(body?.durationMinutes, 15, 480, 60), marketPrice: safeNumber(body?.marketPrice, 0.01, 100000, 1),
      askingPrice: priceUnit === "gratuito" ? 0 : safeNumber(body?.askingPrice, 0, 100000, 0), priceUnit,
      languages: safeList(body?.languages, 8), qualification: qualification || undefined, registerReference: registerReference || undefined,
      verification: category === "salute" ? "in-verifica" : "non-richiesta", rating: 0, ratingCount: 0, completedCount: 0,
      status: category === "salute" ? "in-verifica" : "pubblicato", createdAt: new Date().toISOString(),
    };
    await saveOffer(offer);
    return Response.json({ offer, message: category === "salute" ? "Servizio inviato alla verifica delle qualifiche." : "Servizio pubblicato." }, { status: 201 });
  }

  if (action === "request-service") {
    const profile = await getCentralServiceProfile(request.headers);
    if (!profile) return fail("Completa prima le preferenze del tuo profilo centrale.", 409);
    const service = await findService(safeText(body?.serviceId, 90));
    if (!service || service.status !== "pubblicato") return fail("Servizio non disponibile.", 404);
    if (service.providerId === user.id) return fail("Non puoi richiedere un tuo servizio.", 409);
    const selectedMode = modeValue(body?.mode);
    if (!allowedModes(service.mode).includes(selectedMode)) return fail("Modalità non disponibile per questo servizio.");
    const preferredDate = safeText(body?.preferredDate, 40), message = safeText(body?.message, 800), city = safeText(body?.city, 80) || profile.city;
    if (!preferredDate || !message || (selectedMode !== "online" && !city)) return fail("Indica data, luogo e cosa ti serve.");
    const serviceRequest: ServiceRequest = {
      id: crypto.randomUUID(), serviceId: service.id, serviceTitle: service.title, providerId: service.providerId,
      requesterId: user.id, requesterName: user.name, mode: selectedMode, preferredDate, city, message,
      status: "richiesta", createdAt: new Date().toISOString(),
    };
    await saveRequest(serviceRequest); return Response.json({ request: serviceRequest }, { status: 201 });
  }

  if (action === "update-request") {
    const serviceRequest = await findRequest(safeText(body?.id, 90));
    if (!serviceRequest) return fail("Richiesta non trovata.", 404);
    const next = safeText(body?.status, 40) as ServiceRequest["status"];
    if (next === "annullata" && serviceRequest.requesterId === user.id && serviceRequest.status !== "completata") {
      await updateRequest({ ...serviceRequest, status: next }); return Response.json({ ok: true });
    }
    if (serviceRequest.providerId !== user.id) return fail("Non puoi aggiornare questa richiesta.", 403);
    if (next === "confermata" && serviceRequest.status === "richiesta" || next === "completata" && serviceRequest.status === "confermata") {
      await updateRequest({ ...serviceRequest, status: next }); return Response.json({ ok: true });
    }
    return fail("Passaggio di stato non valido.", 409);
  }

  if (action === "create-review") {
    const serviceRequest = await findRequest(safeText(body?.requestId, 90));
    if (!serviceRequest || serviceRequest.requesterId !== user.id || serviceRequest.status !== "completata") return fail("Puoi valutare solo un servizio completato.", 403);
    if (await hasReview(serviceRequest.id, user.id)) return fail("Hai già valutato questo servizio.", 409);
    const review: ServiceReview = { id: crypto.randomUUID(), serviceId: serviceRequest.serviceId, requestId: serviceRequest.id, authorId: user.id, rating: safeNumber(body?.rating, 1, 5, 5), comment: safeText(body?.comment, 600), createdAt: new Date().toISOString() };
    await saveReview(review); return Response.json({ review }, { status: 201 });
  }
  return fail("Azione non riconosciuta.");
}

function categoryValue(value: unknown): ServiceCategory { const id = safeText(value, 30); return serviceCategories.some((item) => item.id === id) ? id as ServiceCategory : "tecnico"; }
function modeValue(value: unknown): ServiceMode { return value === "online" || value === "domicilio" || value === "luogo" || value === "ibrido" ? value : "online"; }
function unitValue(value: unknown): PriceUnit { return value === "sessione" || value === "intervento" || value === "gratuito" ? value : "ora"; }
function allowedModes(mode: ServiceMode): ServiceMode[] { return mode === "ibrido" ? ["online", "domicilio", "luogo"] : [mode]; }
function fail(message: string, status = 400) { return Response.json({ error: message }, { status }); }

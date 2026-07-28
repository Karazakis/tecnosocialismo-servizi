import { getSuiteUser } from "@/lib/auth";
import { getCentralServiceDemand, getCentralServiceProfile } from "@/lib/central-profile";
import type { ServicesDashboard } from "@/lib/model";
import { loadServices } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSuiteUser(request.headers);
  const [profile, demand, network] = await Promise.all([
    user ? getCentralServiceProfile(request.headers) : Promise.resolve(null),
    getCentralServiceDemand(),
    loadServices(user),
  ]);
  const dashboard: ServicesDashboard = {
    configured: Boolean(profile), viewerId: user?.id ?? null, profile, demand,
    organizations: network.organizations, offers: network.offers,
    requests: network.requests, reviews: network.reviews,
  };
  return Response.json(dashboard, { headers: { "Cache-Control": "private, no-store" } });
}

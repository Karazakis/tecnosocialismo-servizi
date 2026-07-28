import { getSuiteUser } from "@/lib/auth";
import ServicesApp from "./services-app";

export const dynamic = "force-dynamic";
export default async function Home() { const user = await getSuiteUser(); return <ServicesApp initialUser={user} />; }

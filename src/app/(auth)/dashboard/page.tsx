import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const members = await prisma.member.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const organizations = members.map((member) => member.organization);
  const currentOrgId = session.session?.activeOrganizationId || organizations[0]?.id || null;
  
  const currentOrg = organizations.find((org) => org.id === currentOrgId) || organizations[0];
  
  if (currentOrg) {
    redirect(`/${currentOrg.slug}/dashboard`);
  } else {
    redirect("/login");
  }
}

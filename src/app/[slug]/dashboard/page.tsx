import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard-ui/dashboard-content";

export default async function SlugDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user's organizations
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
  
  // Find organization by slug (user is already filtered by membership)
  const currentOrg = organizations.find((org) => org.slug === slug);
  
  if (!currentOrg) {
    notFound();
  }

  return (
    <DashboardContent
      user={session.user}
      organizations={organizations}
      currentOrgId={currentOrg.id}
      currentSlug={slug}
    />
  );
}


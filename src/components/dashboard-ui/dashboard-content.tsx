"use client";

import { useQueryState, parseAsString } from "nuqs";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Upload, Settings as SettingsIcon } from "lucide-react";
import { DocumentUpload } from "./document-upload";
import { Settings } from "./settings";
import { OrgSwitcher } from "@/components/org-switcher";
import { UserNav } from "@/components/user-nav";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  emailVerified?: boolean;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  acceptedSenders?: string[];
};

interface DashboardContentProps {
  user: User;
  organizations: Organization[];
  currentOrgId?: string | null;
  currentSlug?: string;
}

export function DashboardContent({
  user,
  organizations,
  currentOrgId,
  currentSlug,
}: DashboardContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("documents")
  );

  const currentOrg = organizations.find((org) => org.id === currentOrgId) || organizations[0];

  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-4 md:px-6">
        <OrgSwitcher
          organizations={organizations}
          currentOrgId={currentOrgId}
        />
        <div className="flex-1" />
        <UserNav user={user} />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList>
            <TabsTab value="documents">
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </TabsTab>
            <TabsTab value="settings">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </TabsTab>
          </TabsList>
          <TabsPanel value="documents" className="mt-4">
            <DocumentUpload slug={currentSlug || currentOrg?.slug || ""} />
          </TabsPanel>
          <TabsPanel value="settings" className="mt-4">
            {currentOrg && (
              <Settings organization={currentOrg} onUpdate={handleUpdate} />
            )}
          </TabsPanel>
        </Tabs>
      </main>
    </div>
  );
}

"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Envelope, Upload } from "@phosphor-icons/react";
import { DocumentUpload } from "./document-upload";
import { EmailsTable } from "./emails-table";
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
};

interface DashboardContentProps {
  user: User;
  organizations: Organization[];
  currentOrgId?: string | null;
}

export function DashboardContent({
  user,
  organizations,
  currentOrgId,
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("documents")
  );

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
            <TabsTab value="emails">
              <Envelope className="mr-2 h-4 w-4" />
              Sent Emails
            </TabsTab>
          </TabsList>
          <TabsPanel value="documents" className="mt-4">
            <DocumentUpload />
          </TabsPanel>
          <TabsPanel value="emails" className="mt-4">
            <EmailsTable />
          </TabsPanel>
        </Tabs>
      </main>
    </div>
  );
}

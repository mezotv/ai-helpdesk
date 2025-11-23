"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Buildings, CaretDown, Check } from "@phosphor-icons/react";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
};

interface OrgSwitcherProps {
  organizations: Organization[];
  currentOrgId?: string | null;
}

export function OrgSwitcher({ organizations, currentOrgId }: OrgSwitcherProps) {
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (currentOrgId) {
      const org = organizations.find((o) => o.id === currentOrgId);
      if (org) {
        setSelectedOrg(org);
      } else if (organizations.length > 0) {
        setSelectedOrg(organizations[0]);
      }
    } else if (organizations.length > 0) {
      setSelectedOrg(organizations[0]);
    }
  }, [organizations, currentOrgId]);

  const handleOrgChange = async (orgId: string) => {
    // TODO: Update session's activeOrganizationId via API
    // For now, just update local state
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setSelectedOrg(org);
      router.refresh();
    }
  };

  if (!selectedOrg) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Buildings className="h-4 w-4" />
            <span className="truncate">{selectedOrg.name}</span>
          </div>
          <CaretDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleOrgChange(org.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Buildings className="h-4 w-4" />
              <span>{org.name}</span>
            </div>
            {selectedOrg.id === org.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ChevronDown, Check, Plus, Loader2, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useCheckSlug } from "@/hooks/use-check-slug";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Use the reusable slug check hook
  const { data: slugCheckData, isLoading: isCheckingSlug } = useCheckSlug({
    slug: workspaceSlug,
    enabled: isCreateModalOpen,
  });

  const slugAvailable = slugCheckData?.isAvailable;

  // Derive selected org from props - no useEffect needed!
  const selectedOrg = useMemo(() => {
    if (currentOrgId) {
      const org = organizations.find((o) => o.id === currentOrgId);
      return org || (organizations.length > 0 ? organizations[0] : null);
    }
    return organizations.length > 0 ? organizations[0] : null;
  }, [organizations, currentOrgId]);

  const handleOrgChange = async (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      // Navigate to slug-based dashboard
      router.push(`/${org.slug}/dashboard`);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (value: string) => {
    setWorkspaceName(value);
    if (!workspaceSlug || workspaceSlug === generateSlug(workspaceName)) {
      setWorkspaceSlug(generateSlug(value));
    }
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim() || !workspaceSlug.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (slugAvailable === false) {
      toast.error("This slug is not available");
      return;
    }

    setIsCreating(true);
    try {
      await authClient.organization.create({
        name: workspaceName,
        slug: workspaceSlug,
      });

      toast.success("Workspace created successfully");
      const createdSlug = workspaceSlug;
      setWorkspaceName("");
      setWorkspaceSlug("");
      setIsCreateModalOpen(false);
      // Navigate to the new workspace dashboard
      router.push(`/${createdSlug}/dashboard`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  if (!selectedOrg) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="truncate">{selectedOrg.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
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
                <Building2 className="h-4 w-4" />
                <span>{org.name}</span>
              </div>
              {selectedOrg.id === org.id && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace with a unique slug for your helpdesk email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={workspaceName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="My Company"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspace-slug">Slug</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="workspace-slug"
                  value={workspaceSlug}
                  onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="my-company"
                  className="font-mono"
                />
                {isCheckingSlug && <Loader2 className="h-4 w-4 animate-spin" />}
                {slugAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                {slugAvailable === false && <X className="h-4 w-4 text-red-500" />}
              </div>
              <p className="text-sm text-muted-foreground">
                Your helpdesk email will be:{" "}
                <span className="font-mono">
                  {workspaceSlug || "slug"}@ai-helpdesk.aiinbx.app
                </span>
              </p>
              {slugAvailable === false && (
                <p className="text-sm text-destructive">This slug is already taken</p>
              )}
              {slugAvailable === true && (
                <p className="text-sm text-green-600">This slug is available</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={isCreating || slugAvailable === false || !workspaceSlug.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardPanel, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Check, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useCheckSlug } from "@/hooks/use-check-slug";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  acceptedSenders?: string[];
};

interface SettingsProps {
  organization: Organization;
  onUpdate?: () => void;
}

export function Settings({ organization, onUpdate }: SettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [website, setWebsite] = useState(organization.website || "");
  const [acceptedSenders, setAcceptedSenders] = useState<string[]>(
    organization.acceptedSenders || []
  );
  const [newSender, setNewSender] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Use the reusable slug check hook
  const { data: slugCheckData, isLoading: isCheckingSlug } = useCheckSlug({
    slug,
    currentSlug: organization.slug,
  });

  const slugAvailable = slugCheckData?.isAvailable;

  const handleSave = async () => {
    if (slug !== organization.slug && slugAvailable === false) {
      toast.error("This slug is not available");
      return;
    }

    setIsSaving(true);
    try {
      // Update organization via better-auth (includes custom fields)
      await authClient.organization.update({
        organizationId: organization.id,
        data: {
          name,
          slug: slug !== organization.slug ? slug : undefined,
          website: website || undefined,
          acceptedSenders,
        },
      });

      toast.success("Settings saved successfully");
      
      // If slug changed, redirect to new slug URL
      if (slug !== organization.slug) {
        router.push(`/${slug}/dashboard`);
      } else {
        onUpdate?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSender = () => {
    if (newSender.trim() && !acceptedSenders.includes(newSender.trim())) {
      setAcceptedSenders([...acceptedSenders, newSender.trim()]);
      setNewSender("");
    }
  };

  const handleRemoveSender = (email: string) => {
    setAcceptedSenders(acceptedSenders.filter((e) => e !== email));
  };

  const helpdeskEmail = `${organization.slug}@ai-helpdesk.aiinbx.app`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            Manage your organization settings and helpdesk configuration
          </CardDescription>
        </CardHeader>
        <CardPanel className="space-y-6">
          {/* Helpdesk Email Display */}
          <div className="space-y-2">
            <Label>Helpdesk Email</Label>
            <div className="flex items-center gap-2">
              <Input value={helpdeskEmail} readOnly className="font-mono" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(helpdeskEmail);
                  toast.success("Email copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This is your unique helpdesk email address. Forward emails to this address to process them.
            </p>
          </div>

          <Separator />

          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex items-center gap-2">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-organization"
                className="font-mono"
              />
              {isCheckingSlug && <Loader2 className="h-4 w-4 animate-spin" />}
              {slug !== organization.slug && slugAvailable === true && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {slug !== organization.slug && slugAvailable === false && (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Your helpdesk email will be:{" "}
              <span className="font-mono">{slug}@ai-helpdesk.aiinbx.app</span>
            </p>
            {slug !== organization.slug && slugAvailable === false && (
              <p className="text-sm text-destructive">This slug is already taken</p>
            )}
            {slug !== organization.slug && slugAvailable === true && (
              <p className="text-sm text-green-600">This slug is available</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          {/* Accepted Senders */}
          <div className="space-y-2">
            <Label>Accepted Senders</Label>
            <p className="text-sm text-muted-foreground">
              Email addresses that are allowed to send emails to your helpdesk
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                value={newSender}
                onChange={(e) => setNewSender(e.target.value)}
                placeholder="email@example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSender();
                  }
                }}
              />
              <Button onClick={handleAddSender} variant="outline">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            {acceptedSenders.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {acceptedSenders.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-sm"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSender(email)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardPanel>
        <CardFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving || (slug !== organization.slug && slugAvailable === false)}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}



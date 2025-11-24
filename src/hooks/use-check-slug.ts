import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { authClient } from "@/lib/auth-client";

interface UseCheckSlugOptions {
  slug: string;
  enabled?: boolean;
  currentSlug?: string;
  debounceMs?: number;
}

interface CheckSlugResponse {
  isAvailable: boolean | null;
}

export function useCheckSlug({ 
  slug, 
  enabled = true, 
  currentSlug,
  debounceMs = 500 
}: UseCheckSlugOptions) {
  const [debouncedSlug] = useDebounce(slug, debounceMs);

  return useQuery<CheckSlugResponse>({
    queryKey: ["check-slug", debouncedSlug],
    queryFn: async () => {
      if (!debouncedSlug.trim() || debouncedSlug === currentSlug) {
        return { isAvailable: null };
      }

      const { error } = await authClient.organization.checkSlug({
        slug: debouncedSlug,
      });

      if (error && typeof error === "object" && "code" in error && error.code === "SLUG_IS_TAKEN") {
        return { isAvailable: false };
      }

      if (error) {
        return { isAvailable: null };
      }

      return { isAvailable: true };
    },
    enabled: enabled && !!debouncedSlug.trim() && debouncedSlug !== currentSlug,
    staleTime: 30000,
    retry: false,
  });
}


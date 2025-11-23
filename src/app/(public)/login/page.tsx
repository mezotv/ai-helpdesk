"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Google } from "@/components/ui/svgs/google";
import { authClient } from "@/lib/auth-client";
import { toastManager } from "@/components/ui/toast";


export default function Login() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSocialSignIn = async (provider: "google") => {
    setIsGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (_error) {
      toastManager.add({
        title: "Sign in failed",
        description: "Your sign in request failed. Please try again.",
        type: "error",
      });
      return;
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full min-w-80 max-w-md bg-background/10 backdrop-blur-xl border-border/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-base mt-1 text-center">
            Login to your account to get started
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <Button
            className="w-full"
            size="lg"
            onClick={() => handleSocialSignIn("google")}
            disabled={isGoogleLoading}
          >
            <Google className="size-5" />
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </Button>
        </CardPanel>
      </Card>
    </div>
  );
}

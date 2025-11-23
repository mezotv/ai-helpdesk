import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "AI Helpdesk - AI-Powered Email Agent for Your Business",
  description: "AI Helpdesk is an intelligent email agent that learns from your documents. Upload your knowledge base and let your employees ask questions via email - AI Helpdesk responds automatically based on your uploaded content.",
  keywords: [
    "AI email agent",
    "AI helpdesk",
    "automated email responses",
    "document-based AI",
    "knowledge base AI",
    "email automation",
    "AI customer service",
    "intelligent email assistant",
  ],
  openGraph: {
    title: "AI Helpdesk - AI-Powered Email Agent",
    description: "Upload your documents and let AI Helpdesk automatically respond to employee emails based on your knowledge base.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Helpdesk - AI-Powered Email Agent",
    description: "Upload your documents and let AI Helpdesk automatically respond to employee emails based on your knowledge base.",
  },
};

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full min-w-80 max-w-2xl bg-background/10 backdrop-blur-xl border-border/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl text-center">
            AI Helpdesk
          </CardTitle>
          <CardDescription className="text-lg md:text-xl mt-2 text-center">
            Your intelligent email agent powered by AI
          </CardDescription>
        </CardHeader>
        <CardPanel className="space-y-6">
          <p className="text-base md:text-lg leading-relaxed text-foreground/90">
            AI Helpdesk is an AI-powered email agent that transforms how your business handles internal communications. 
            Simply upload your documents and knowledge base, and your employees can ask questions via email. 
            AI Helpdesk automatically responds with accurate answers based on your uploaded content.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">How it works</h2>
            <ol className="space-y-3 list-decimal list-inside text-foreground/80">
              <li>Upload your documents, manuals, and knowledge base</li>
              <li>Your employees send questions via email</li>
              <li>AI Helpdesk analyzes your documents and responds automatically</li>
              <li>Get accurate, context-aware answers based on your content</li>
            </ol>
          </div>

          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}


"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
import { FileDropzone } from "@/components/file-dropzone"
import { EmailsTable } from "@/components/emails-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState("documents")

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash === "documents" || hash === "emails") {
        setActiveTab(hash)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTab value="documents">Documents</TabsTab>
        <TabsTab value="emails">Emails</TabsTab>
      </TabsList>
      <TabsPanel value="documents" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Upload your documents to get started. Supported formats: PDF, DOCX, TXT, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileDropzone
              onFilesSelected={(files) => {
                console.log("Files selected:", files)
              }}
              maxFiles={10}
              accept=".pdf,.doc,.docx,.txt,.md"
            />
          </CardContent>
        </Card>
      </TabsPanel>
      <TabsPanel value="emails" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Sent Emails</CardTitle>
            <CardDescription>
              View all emails that have been sent through the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailsTable />
          </CardContent>
        </Card>
      </TabsPanel>
    </Tabs>
  )
}


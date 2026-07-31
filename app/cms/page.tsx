"use client";

import { useState } from "react";
import { CmsShell, type TabId } from "@/components/cms/Shell";
import { Toaster } from "@/components/cms/Toaster";
import {
  OverviewTab,
  ProjectsTab,
  MediaTab,
  ProfileTab,
  CvTab,
  SettingsTab,
} from "@/components/cms/tabs";
import { JourneyTab } from "@/components/cms/JourneyTab";
import { CertificateTab } from "@/components/cms/CertificateTab";

export default function CmsPage() {
  const [tab, setTab] = useState<TabId>("overview");
  return (
    <>
      <CmsShell tab={tab} setTab={setTab}>
        {tab === "overview" && <OverviewTab go={(t) => setTab(t as TabId)} />}
        {tab === "projects" && <ProjectsTab />}
        {tab === "media" && <MediaTab />}
        {tab === "profile" && <ProfileTab />}
        {tab === "journey" && <JourneyTab />}
        {tab === "certificate" && <CertificateTab />}
        {tab === "cv" && <CvTab />}
        {tab === "settings" && <SettingsTab />}
      </CmsShell>
      <Toaster />
    </>
  );
}

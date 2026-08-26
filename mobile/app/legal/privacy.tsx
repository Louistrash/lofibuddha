import React from "react";
import { LegalScreen } from "@/src/components/legal/LegalScreen";
import { privacy } from "@/src/lib/legal-content";

export default function PrivacyScreen() {
  return <LegalScreen doc={privacy} />;
}

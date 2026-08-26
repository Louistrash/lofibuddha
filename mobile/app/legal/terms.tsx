import React from "react";
import { LegalScreen } from "@/src/components/legal/LegalScreen";
import { terms } from "@/src/lib/legal-content";

export default function TermsScreen() {
  return <LegalScreen doc={terms} />;
}

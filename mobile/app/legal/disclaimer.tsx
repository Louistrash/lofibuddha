import React from "react";
import { LegalScreen } from "@/src/components/legal/LegalScreen";
import { disclaimer } from "@/src/lib/legal-content";

export default function DisclaimerScreen() {
  return <LegalScreen doc={disclaimer} />;
}

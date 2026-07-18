import type { Metadata } from "next";
import { OfflineView } from "@/app/_components/OfflineView";

export const metadata: Metadata = {
  title: "Offline | Fat Fitness Community",
};

export default function OfflinePage() {
  return <OfflineView />;
}

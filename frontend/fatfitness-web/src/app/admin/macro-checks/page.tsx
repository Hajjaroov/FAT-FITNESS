import type { Metadata } from "next";
import { AdminMacroChecksView } from "@/app/_components/AdminMacroChecksView";

export const metadata: Metadata = {
  title: "Macro checks | Admin | Fat Fitness Community",
  description: "Moderator review queue for shared food macro proposals and corrections.",
};

export default function AdminMacroChecksPage() {
  return <AdminMacroChecksView />;
}

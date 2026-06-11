import type { Metadata } from "next";
import { AuthAccountView } from "@/app/_components/AuthAccountView";

export const metadata: Metadata = {
  title: "Register | Fat Fitness Community",
  description:
    "Create a Fat Fitness Community account with minimal registration details.",
};

export default function RegisterPage() {
  return <AuthAccountView mode="register" />;
}

import type { Metadata } from "next";
import { AuthAccountView } from "@/app/_components/AuthAccountView";

export const metadata: Metadata = {
  title: "Login | Fat Fitness Community",
  description:
    "Sign in to a Fat Fitness Community account for local account-flow testing.",
};

export default function LoginPage() {
  return <AuthAccountView mode="login" />;
}

import type { Metadata } from "next";
import { AuthPlaceholderView } from "@/app/_components/AuthPlaceholderView";

export const metadata: Metadata = {
  title: "Login | Fat Fitness Community",
  description:
    "Static account access placeholder for the future Fat Fitness Community forum.",
};

export default function LoginPage() {
  return <AuthPlaceholderView mode="login" />;
}

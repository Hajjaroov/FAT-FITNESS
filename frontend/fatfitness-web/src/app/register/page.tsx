import type { Metadata } from "next";
import { AuthPlaceholderView } from "@/app/_components/AuthPlaceholderView";

export const metadata: Metadata = {
  title: "Register | Fat Fitness Community",
  description:
    "Static registration placeholder for the future Fat Fitness Community forum.",
};

export default function RegisterPage() {
  return <AuthPlaceholderView mode="register" />;
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordView } from "@/app/_components/ForgotPasswordView";

export const metadata: Metadata = {
  title: "Forgot Password | Fat Fitness Community",
  description: "Reset your Fat Fitness Community account password.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordView />
    </Suspense>
  );
}

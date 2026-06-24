import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordView } from "@/app/_components/ResetPasswordView";

export const metadata: Metadata = {
  title: "Reset Password | Fat Fitness Community",
  description: "Set a new password for your Fat Fitness Community account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordView />
    </Suspense>
  );
}

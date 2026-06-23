import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailView } from "@/app/_components/VerifyEmailView";

export const metadata: Metadata = {
  title: "Verify Email | Fat Fitness Community",
  description: "Verify your Fat Fitness Community email address.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailView />
    </Suspense>
  );
}

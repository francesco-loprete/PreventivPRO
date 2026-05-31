import { Suspense } from "react";
import {
  ResetPasswordPageContent,
  ResetPasswordPageFallback,
} from "@/components/auth/reset-password-page-content";

export const metadata = {
  title: "Nuova password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordPageFallback />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

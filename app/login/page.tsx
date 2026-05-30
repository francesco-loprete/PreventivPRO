import { Suspense } from "react";
import {
  LoginPageContent,
  LoginPageFallback,
} from "@/components/auth/login-page-content";

export const metadata = {
  title: "Accedi",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

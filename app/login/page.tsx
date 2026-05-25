import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Accedi",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Accedi"
      subtitle="Inserisci le credenziali per gestire i tuoi preventivi."
    >
      <Suspense fallback={<p className="text-gray-400 text-sm">Caricamento...</p>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Registrati",
};

export default function RegistrazionePage() {
  return (
    <AuthCard
      title="Crea account"
      subtitle="Registrati per salvare e gestire i preventivi su PreventivPRO."
    >
      <RegisterForm />
    </AuthCard>
  );
}

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="block mb-8 hover:opacity-90 transition-opacity">
          <BrandLogo />
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-muted text-sm mb-8">{subtitle}</p>
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </main>
  );
}

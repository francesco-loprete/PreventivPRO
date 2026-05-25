import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="text-3xl font-bold text-green-500 block mb-8 hover:text-green-400"
        >
          PreventivPRO
        </Link>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-400 text-sm mb-8">{subtitle}</p>
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-gray-400">{footer}</div>}
      </div>
    </main>
  );
}

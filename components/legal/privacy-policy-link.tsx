import Link from "next/link";

export function PrivacyPolicyLink() {
  return (
    <Link
      href="/privacy"
      className="text-accent hover:text-sky-400 font-medium underline underline-offset-2"
    >
      Informativa sulla privacy
    </Link>
  );
}

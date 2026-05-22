import { AccountNav } from "@/components/account/account-nav";

export const metadata = {
  title: "Account",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-stone-900">Your account</h1>
      <p className="mt-2 text-sm text-stone-600">
        Manage your profile, shipping details, and account preferences.
      </p>
      <div className="mt-8">
        <AccountNav />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

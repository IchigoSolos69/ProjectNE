"use client";

import { useAuthStore } from "@/stores/auth-store";
import {
  EditProfileDialog,
  type ProfileFormData,
} from "@/components/account/edit-profile-dialog";
import { Button } from "@/components/ui/button";

export default function AccountProfilePage() {
  const { user, logout } = useAuthStore();

  if (!user) return null; // Guarded by AuthGuard

  const profile: ProfileFormData = {
    fullName: user.fullName || "",
    phone: user.phone || "",
    shippingAddress: user.shippingAddress || "",
  };

  async function handleSave(data: ProfileFormData) {
    // Update store state
    useAuthStore.setState((s) => {
      if (s.user) {
        return {
          user: {
            ...s.user,
            fullName: data.fullName,
            phone: data.phone,
            shippingAddress: data.shippingAddress,
          },
        };
      }
      return s;
    });
    console.info("[account] Profile saved:", data);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-stone-900">Profile</h2>
          <p className="mt-1 text-sm text-stone-600">
            Default details used for checkout and Delhivery delivery.
          </p>
        </div>
        <div className="flex gap-2">
          <EditProfileDialog
            from="bottom"
            showCloseButton
            initialData={profile}
            onSave={handleSave}
          />
          <Button variant="ghost" onClick={logout} className="text-stone-500 hover:text-stone-900 hover:bg-stone-50">
            Sign out
          </Button>
        </div>
      </div>

      <dl className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        <div className="grid gap-1 px-6 py-4 sm:grid-cols-3">
          <dt className="text-sm font-medium text-stone-500">Email address</dt>
          <dd className="text-sm text-stone-900 sm:col-span-2">{user.email}</dd>
        </div>
        <div className="grid gap-1 px-6 py-4 sm:grid-cols-3">
          <dt className="text-sm font-medium text-stone-500">Full name</dt>
          <dd className="text-sm text-stone-900 sm:col-span-2">
            {profile.fullName || <span className="text-stone-400 italic">Not set</span>}
          </dd>
        </div>
        <div className="grid gap-1 px-6 py-4 sm:grid-cols-3">
          <dt className="text-sm font-medium text-stone-500">Phone number</dt>
          <dd className="text-sm text-stone-900 sm:col-span-2">
            {profile.phone || <span className="text-stone-400 italic">Not set</span>}
          </dd>
        </div>
        <div className="grid gap-1 px-6 py-4 sm:grid-cols-3">
          <dt className="text-sm font-medium text-stone-500">Shipping address</dt>
          <dd className="whitespace-pre-line text-sm text-stone-900 sm:col-span-2">
            {profile.shippingAddress || <span className="text-stone-400 italic">Not set</span>}
          </dd>
        </div>
      </dl>
    </div>
  );
}

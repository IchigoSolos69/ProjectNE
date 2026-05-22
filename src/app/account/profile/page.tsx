"use client";

import { useState } from "react";
import {
  EditProfileDialog,
  type ProfileFormData,
} from "@/components/account/edit-profile-dialog";

const MOCK_PROFILE: ProfileFormData = {
  fullName: "Aditi Sharma",
  phone: "+91 98765 43210",
  shippingAddress:
    "Flat 4B, 12 Residency Road\nBengaluru, Karnataka 560025\nIndia",
};

export default function AccountProfilePage() {
  const [profile, setProfile] = useState<ProfileFormData>(MOCK_PROFILE);

  async function handleSave(data: ProfileFormData) {
    setProfile(data);
    // TODO: persist to Supabase profiles table
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
        <EditProfileDialog
          from="bottom"
          showCloseButton
          initialData={profile}
          onSave={handleSave}
        />
      </div>

      <dl className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        <div className="grid gap-1 px-6 py-4 sm:grid-cols-3">
          <dt className="text-sm font-medium text-stone-500">Full name</dt>
          <dd className="text-sm text-stone-900 sm:col-span-2">{profile.fullName}</dd>
        </div>
        <div className="grid gap-1 px-6 py-4 sm:grid-cols-3">
          <dt className="text-sm font-medium text-stone-500">Phone number</dt>
          <dd className="text-sm text-stone-900 sm:col-span-2">{profile.phone}</dd>
        </div>
        <div className="grid gap-1 px-6 py-4 sm:grid-cols-3">
          <dt className="text-sm font-medium text-stone-500">Shipping address</dt>
          <dd className="whitespace-pre-line text-sm text-stone-900 sm:col-span-2">
            {profile.shippingAddress}
          </dd>
        </div>
      </dl>
    </div>
  );
}

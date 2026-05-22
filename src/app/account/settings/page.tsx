"use client";

import { Separator } from "@/components/ui/separator";
import {
  DeleteAccountDialog,
  handleDeleteAccount,
} from "@/components/account/delete-account-dialog";

export default function AccountSettingsPage() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-medium text-foreground">Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Email notifications and marketing preferences (coming soon).
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted px-6 py-8 text-center text-sm text-muted-foreground">
          Notification settings will appear here once auth is connected.
        </div>
      </section>

      <Separator />

      <section className="rounded-lg border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-lg font-medium text-red-900">Danger zone</h2>
        <p className="mt-2 max-w-lg text-sm text-red-800/90">
          Permanently delete your account and all associated data. This cannot be
          undone.
        </p>
        <div className="mt-6">
          <DeleteAccountDialog from="bottom" onDelete={handleDeleteAccount} />
        </div>
      </section>
    </div>
  );
}

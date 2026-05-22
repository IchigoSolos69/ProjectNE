"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  type DialogContentProps,
} from "@/components/animate-ui/components/radix/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface ProfileFormData {
  fullName: string;
  phone: string;
  shippingAddress: string;
}

interface EditProfileDialogProps {
  from?: DialogContentProps["from"];
  showCloseButton?: boolean;
  initialData?: ProfileFormData;
  onSave?: (data: ProfileFormData) => void | Promise<void>;
}

const DEFAULT_PROFILE: ProfileFormData = {
  fullName: "",
  phone: "",
  shippingAddress: "",
};

export function EditProfileDialog({
  from = "bottom",
  showCloseButton = true,
  initialData = DEFAULT_PROFILE,
  onSave,
}: EditProfileDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<ProfileFormData>(initialData);

  React.useEffect(() => {
    if (open) setForm(initialData);
  }, [open, initialData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave?.(form);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        from={from}
        showCloseButton={showCloseButton}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update your contact and default shipping details. Changes apply to
              future orders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-full-name">Full name</Label>
              <Input
                id="profile-full-name"
                name="fullName"
                required
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                placeholder="Aditi Sharma"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-phone">Phone number</Label>
              <Input
                id="profile-phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-address">Shipping address</Label>
              <textarea
                id="profile-address"
                name="shippingAddress"
                required
                rows={3}
                value={form.shippingAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shippingAddress: e.target.value }))
                }
                placeholder="Flat 4B, 12 Residency Road, Bengaluru, Karnataka 560025"
                className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

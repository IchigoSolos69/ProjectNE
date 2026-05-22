"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  type AlertDialogContentProps,
} from "@/components/animate-ui/components/radix/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteAccountDialogProps {
  from?: AlertDialogContentProps["from"];
  onDelete?: () => void | Promise<void>;
}

export function handleDeleteAccount() {
  // Placeholder — wire to Supabase auth.admin.deleteUser or user self-delete RPC
  console.info("[account] Delete account requested — connect Supabase auth here.");
}

export function DeleteAccountDialog({
  from = "bottom",
  onDelete = handleDeleteAccount,
}: DeleteAccountDialogProps) {
  async function onConfirm() {
    await onDelete();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
          Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]" from={from}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account, order history, and saved addresses from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete my account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

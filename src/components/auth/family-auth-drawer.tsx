"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { FamilyAuthPanel } from "@/components/auth/family-auth-panel";

interface FamilyAuthDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function FamilyAuthDrawer({
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: FamilyAuthDrawerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleSuccess = () => {
    onSuccess?.();
    setTimeout(() => setOpen(false), 1200);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={setOpen}>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[92vh] flex-col rounded-t-[1.75rem] bg-white outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-stone-300" />
          <div className="overflow-y-auto px-6 pb-8 pt-4">
            {isOpen && (
              <FamilyAuthPanel key="drawer-auth" onSuccess={handleSuccess} showCharacters />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

"use client";

import { useState, useTransition } from "react";
import { adminLogin } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await adminLogin(email, password);
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || "Login failed");
      }
    });
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-stone-200/80 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-serif text-3xl text-stone-900">Admin Portal</CardTitle>
          <CardDescription className="text-stone-500">
            Sign in to manage inventory and view customer orders.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-stone-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@projectne.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-stone-300 focus-visible:ring-stone-400"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-stone-700">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-stone-300 focus-visible:ring-stone-400"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium h-11"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

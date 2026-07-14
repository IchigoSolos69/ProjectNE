export const runtime = "edge";

import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function getAuthOptions(): Promise<any> {
  const prisma = await getPrisma();
  
  // Dynamic imports prevent Next.js build sandbox from evaluating Node.js imports
  const { default: CredentialsProvider } = await import("next-auth/providers/credentials");
  const { default: GoogleProvider } = await import("next-auth/providers/google");
  const { PrismaAdapter } = await import("@next-auth/prisma-adapter");

  return {
    adapter: PrismaAdapter(prisma as any),
    session: {
      strategy: "jwt",
    },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing email or password.");
          }

          const prisma = await getPrisma();
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials.");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid credentials.");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }: { token: any; user: any }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }: { session: any; token: any }) {
        if (session.user) {
          (session.user as any).id = token.id;
        }
        return session;
      },
    },
    pages: {
      signIn: "/auth",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
  };
}

async function authHandler(req: any, res: any) {
  const { default: NextAuth } = await import("next-auth");
  const options = await getAuthOptions();
  return NextAuth(req, res, options);
}

export { authHandler as GET, authHandler as POST };

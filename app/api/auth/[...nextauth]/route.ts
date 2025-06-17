import NextAuth, { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../config/db";
import { compare } from "bcryptjs";
import { ObjectId } from "mongodb";

export const authOptions: AuthOptions = {
  debug: true,
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },       // stateless, cookies only
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Incoming creds", credentials);

        const client = await clientPromise;
        const user = await client
          .db()
          .collection("users")
          .findOne({ email: credentials.email });

        console.log("DB user", user);

        if (!user || !user.hashedPassword) return null;

        const match = await compare(
          credentials.password,
          user.hashedPassword
        );
        console.log("Password match?", match);

        if (!match) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
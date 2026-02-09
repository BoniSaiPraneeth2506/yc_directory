import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "@/sanityio/lib/queries";
import { client } from "@/sanityio/lib/client";
import { writeClient } from "@/sanityio/lib/write-client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: {
    signIn: "/",
  },
  trustHost: true, // Required for production deployment
  callbacks: {
    async signIn({
      user: { name, email, image },
      profile: { id, login, bio } = {} as any,
    }) {
      console.log("🔐 Sign in attempt:", { name, email, image: image?.substring(0, 50) });
      
      const existingUser = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
          id,
        });

      if (!existingUser) {
        console.log("✨ Creating new user");
        await writeClient.create({
          _type: "author",
          id,
          name,
          username: login,
          email,
          image,
          bio: bio || "",
        });
      } else {
        console.log("🔄 Updating existing user:", existingUser._id);
        console.log("📸 New image URL:", image);
        // Update existing user with latest GitHub data
        await writeClient
          .patch(existingUser._id)
          .set({
            name,
            email,
            image,
            bio: bio || existingUser?.bio || "",
          })
          .commit();
        console.log("✅ User updated successfully");
      }

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
            id: profile?.id,
          });

        token.id = user?._id;
      }

      return token;
    },
    async session({ session, token }) {
      Object.assign(session, { id: token.id });
      return session;
    },
  },
});
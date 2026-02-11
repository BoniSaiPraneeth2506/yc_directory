import NavBar from "@/components/NavBar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { auth } from "@/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  return (
    <>
      <Suspense fallback={<Skeleton className="w-full h-16 bg-white shadow-sm" />}>
        <NavBar />
      </Suspense>
      <ClientLayoutWrapper userId={session?.id}>
        {children}
      </ClientLayoutWrapper>
    </>
  );
}
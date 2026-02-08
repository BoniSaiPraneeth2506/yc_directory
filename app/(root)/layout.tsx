import NavBar from "@/components/NavBar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
  <>
  <Suspense fallback={<Skeleton className="w-full h-16 bg-white shadow-sm" />}>
    <NavBar/>
  </Suspense>
  {children}
  </>
  )
}
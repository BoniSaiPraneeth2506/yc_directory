import { SocketProvider } from "@/components/providers/SocketProvider";
import { auth } from "@/auth";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <SocketProvider userId={session?.id || null}>
      {children}
    </SocketProvider>
  );
}

"use client";

import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { UploadModal } from "./UploadModal";
import { SocketProvider } from "./providers/SocketProvider";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  userId?: string;
}

export const ClientLayoutWrapper = ({
  children,
  userId,
}: ClientLayoutWrapperProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <SocketProvider>
      <div className="pb-20">{children}</div>
      <BottomNav
        userId={userId}
        onCreateClick={() => setIsUploadModalOpen(true)}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </SocketProvider>
  );
};

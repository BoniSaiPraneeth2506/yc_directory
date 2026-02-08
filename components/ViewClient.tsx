"use client";

import { useEffect, useRef } from "react";

const ViewClient = ({ id }: { id: string }) => {
  const hasReported = useRef(false);

  useEffect(() => {
    if (hasReported.current) return;
    hasReported.current = true;

    fetch(`/api/startup/${id}/views`, {
      method: "POST",
    });
  }, [id]);

  return null;
};

export default ViewClient;

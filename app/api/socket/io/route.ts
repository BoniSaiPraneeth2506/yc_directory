import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return new Response(
    JSON.stringify({ success: true, message: "Socket.io endpoint" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(req: NextRequest) {
  return new Response(
    JSON.stringify({ success: true, message: "Socket.io endpoint" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}


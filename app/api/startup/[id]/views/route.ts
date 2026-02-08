import { NextResponse } from "next/server";
import { writeClient } from "@/sanityio/lib/write-client";

export async function POST(
	_request: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = await params;

	if (!id) {
		return NextResponse.json({ error: "Missing startup id" }, { status: 400 });
	}

	const updated = await writeClient
		.patch(id)
		.setIfMissing({ views: 0 })
		.inc({ views: 1 })
		.commit();

	return NextResponse.json({ views: updated?.views ?? null });
}

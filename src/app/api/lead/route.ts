import { NextResponse } from 'next/server';

type LeadPayload = {
  serviceTag: string;
  selection: Record<string, string | string[]>;
  estimatedRange: [number, number];
  lead: { name: string; whatsapp: string; email: string; notes?: string };
};

export async function POST(req: Request) {
  let body: LeadPayload;
  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body?.lead?.email || !body?.lead?.whatsapp || !body?.lead?.name) {
    return NextResponse.json({ error: 'missing required fields' }, { status: 400 });
  }

  // MVP: just log on the server. Email integration (Resend) plugs in here later.
  // eslint-disable-next-line no-console
  console.log('[lead]', JSON.stringify(body));

  return NextResponse.json({ ok: true });
}

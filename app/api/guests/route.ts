import { NextResponse } from 'next/server';
import { Client, ID, TablesDB, AppwriteException } from 'node-appwrite';
import type { Side } from '@/app/config/types';

// The Appwrite API key is a server secret — this route must never run on the edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SIDES: Side[] = ['groom', 'bride'];
const MAX_NAME_LENGTH = 60;

interface GuestPayload {
  name: string;
  side: Side;
}

/** Trim, collapse whitespace and strip markup characters. */
function cleanName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

function parse(body: unknown): GuestPayload | null {
  if (typeof body !== 'object' || body === null) return null;
  const { name, side } = body as Record<string, unknown>;

  const cleaned = cleanName(name);
  if (cleaned.length < 2) return null;
  if (typeof side !== 'string' || !SIDES.includes(side as Side)) return null;

  return { name: cleaned, side: side as Side };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const guest = parse(body);
  if (!guest) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  const endpoint = process.env.APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const tableId = process.env.APPWRITE_GUESTS_TABLE_ID;

  if (!endpoint || !projectId || !apiKey || !databaseId || !tableId) {
    // Missing config must not break the invitation — the guest still travels.
    console.error('[guests] Appwrite env vars are not configured; skipping save.');
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const tablesDB = new TablesDB(client);

  try {
    const row = await tablesDB.createRow({
      databaseId,
      tableId,
      rowId: ID.unique(),
      data: {
        name: guest.name,
        side: guest.side,
        submittedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ok: true, id: row.$id }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof AppwriteException ? `${error.code} ${error.message}` : String(error);
    console.error('[guests] Failed to save guest:', message);
    return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 502 });
  }
}

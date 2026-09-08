import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true, version: '1.0', status: 'healthy' });
}

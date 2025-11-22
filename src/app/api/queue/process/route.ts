import { NextResponse } from 'next/server';
import { processQueueJobs } from '@/lib/queue/processor';

export async function POST() {
  await processQueueJobs();
  return NextResponse.json({ success: true });
}

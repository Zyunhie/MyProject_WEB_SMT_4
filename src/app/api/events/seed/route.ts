// src/app/api/events/seed/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Event from '@/models/event';

export async function GET() {
  await dbConnect();

  const dummyEvent = {
    title: 'Bakti Sosial Mahasiswa',
    description: 'Penggalangan dana untuk kegiatan bakti sosial di desa binaan.',
    createdBy: 'user_abc123', // ganti sesuai user ID dummy (bebas dulu)
    targetAmount: 2000000,
    collectedAmount: 0,
  };

  try {
    const created = await Event.create(dummyEvent);
    return NextResponse.json({ success: true, event: created });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}

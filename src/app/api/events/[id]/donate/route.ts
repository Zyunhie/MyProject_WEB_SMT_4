// src/app/api/events/[id]/donate/route.ts
import { NextResponse, NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import Event from "@/models/event";

interface Donation {
  _id: string;
  userId: string;
  donorName: string;
  amount: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const { id } = params;
  const { userId, donorName, amount } = (await request.json()) as Donation;

  // Validasi ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  // Validasi input dasar
  if (!userId || !donorName || amount <= 0) {
    return NextResponse.json({ error: "Data donasi tidak valid" }, { status: 400 });
  }

  // Update event: tambahkan donasi dan naikkan total
  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    {
      $push: {
        donations: {
          userId,
          donorName,
          amount,
          date: new Date(),
        },
      },
      $inc: { collectedAmount: amount },
    },
    { new: true }
  );

  if (!updatedEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    collectedAmount: updatedEvent.collectedAmount,
  });
}

"Use Client"

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import Event from "@/models/event";

// PUT: Update donation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; donationId: string } }
) {
  await dbConnect();
  const { id, donationId } = params;
  const { donorName, amount } = await request.json();

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(donationId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  if (!donorName || amount <= 0) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const event = await Event.findById(id);
  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  const donation = event.donations.id(donationId);
  if (!donation) {
    return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
  }

  // Update total donasi yang dikumpulkan
  const oldAmount = donation.amount;
  donation.donorName = donorName;
  donation.amount = amount;
  event.collectedAmount += amount - oldAmount;

  await event.save();

  return NextResponse.json({ success: true });
}

// DELETE: Hapus donasi
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; donationId: string } }
) {
  await dbConnect();
  const { id, donationId } = params;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(donationId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const event = await Event.findById(id);
  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  const donation = event.donations.id(donationId);
  if (!donation) {
    return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
  }

  event.collectedAmount -= donation.amount;
  donation.deleteOne();
  await event.save();

  return NextResponse.json({ success: true });
}

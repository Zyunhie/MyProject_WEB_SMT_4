import { NextResponse } from "next/server";
import Event from "@/models/event";  // pastikan kecil semua
import dbConnect from "@/utils/db"; // import dbConnect untuk koneksi ke MongoDB

export async function POST(req: Request) {
  await dbConnect();  // Pastikan koneksi ke database
  const body = await req.json();

  const newEvent = new Event({
    title: body.title,
    description: body.description,
    targetAmount: body.targetAmount,
    createdBy: body.userId,  // Ambil userId dari sesi atau Clerk
  });

  const savedEvent = await newEvent.save();
  return NextResponse.json(savedEvent);  // Kirim data event yang sudah disimpan
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";

// Define the expected params type for the dynamic route
interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const body = await req.json();

  // Validate input
  const name = body?.name?.trim();
  const email = body?.email?.trim() || null;
  const amount = Number(body?.amount);

  if (!id || !name || !amount || isNaN(amount) || amount < 1000) {
    return NextResponse.json(
      { error: "Jumlah donasi minimal Rp1.000." },
      { status: 400 }
    );
  }

  // Fetch current event data
  const { data: currentEvent, error: fetchError } = await supabase
    .from("events")
    .select("collectedamount")
    .eq("id", id)
    .single();

  if (fetchError || !currentEvent) {
    return NextResponse.json(
      { error: "Event tidak ditemukan." },
      { status: 404 }
    );
  }

  // Update event's collected amount
  const updatedamount = currentEvent.collectedamount + amount;

  const { error: updateError } = await supabase
    .from("events")
    .update({ collectedamount: updatedamount })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "Gagal update jumlah donasi." },
      { status: 500 }
    );
  }

  // Insert donation record
  const { error: insertError } = await supabase.from("donations").insert([
    {
      name,
      email,
      amount,
      event_id: id,
    },
  ]);

  if (insertError) {
    return NextResponse.json(
      { error: "Gagal menyimpan data donatur." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Donasi berhasil disimpan!" },
    { status: 200 }
  );
}
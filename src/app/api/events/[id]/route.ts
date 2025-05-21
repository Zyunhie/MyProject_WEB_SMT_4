// FILE: app/api/events/[id]/donate/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const name = body?.name?.trim();
  const email = body?.email?.trim() || null;
  const amount = Number(body?.amount);

  // Validasi input
  if (!id || !name || !amount || isNaN(amount) || amount < 1000) {
  return NextResponse.json({ error: "Jumlah donasi minimal Rp1.000." }, { status: 400 });
}

  // Ambil jumlah donasi saat ini
  const { data: currentEvent, error: fetchError } = await supabase
    .from("events")
    .select("collectedamount")
    .eq("id", id)
    .single();

  if (fetchError || !currentEvent) {
    console.error("Fetch event error:", fetchError?.message);
    return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
  }

  const updatedamount = currentEvent.collectedamount + amount;

  // Update jumlah total donasi pada event
  const { error: updateError } = await supabase
    .from("events")
    .update({ collectedamount: updatedamount })
    .eq("id", id);

  if (updateError) {
    console.error("Update event error:", updateError?.message);
    return NextResponse.json({ error: "Gagal update jumlah donasi." }, { status: 500 });
  }

  // Simpan data ke tabel donations
  const { error: insertError } = await supabase.from("donations").insert([
    {
      name,
      email,
      amount,
      event_id: id,
    },
  ]);

  if (insertError) {
    console.error("Insert donation error:", insertError?.message);
    return NextResponse.json({ error: "Gagal menyimpan data donatur." }, { status: 500 });
  }

  return NextResponse.json({ message: "Donasi berhasil disimpan!" }, { status: 200 });
}

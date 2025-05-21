"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { toast } from "react-toastify";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  targetamount: number;
  collectedamount: number;
}

export default function EventDetailPage() {
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [donateLoading, setDonateLoading] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Gagal ambil data event:", error.message);
      } else {
        setEvent(data);
      }

      setLoading(false);
    }

    if (id) fetchEvent();
  }, [id]);

  const handleDonate = async () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong yaa 🥺");
      return;
    }
    if (!email.trim()) {
      toast.error("Email jangan dikosongin dong 😣");
      return;
    }
    if (amount < 1000 || isNaN(amount)) {
      toast.error("Jumlah donasi harus minimal 1000 💸");
      return;
    }

    setDonateLoading(true);

    const res = await fetch(`/api/events/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, amount }),
    });

    setDonateLoading(false);

    if (res.ok) {
      toast.success("🎉 Donasi berhasil, terima kasih yaa 💖");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      const error = await res.json();
      toast.error("Gagal donasi: " + error.error);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!event) return <p className="text-center mt-10">Event tidak ditemukan.</p>;

  const progress = (event.collectedamount / event.targetamount) * 100;

  return (
    <div className="flex justify-center mt-10 ">
      <div className="bg-gradient-to-br from-green-300 to-white-100 rounded-xl p-10 shadow-xl w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center">{event.title}</h1>
        <p className="text-center text-gray-600 mb-5">{event.description}</p>

        <div className="flex justify-between text-sm font-semibold mb-1">
          <span>
            Terkumpul: Rp {event.collectedamount.toLocaleString("id-ID")}
          </span>
          <span>
            Target: Rp {event.targetamount.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mb-5">
          <div
  className="h-4 bg-green-500 transition-all duration-700 ease-in-out"
  style={{ width: `${Math.min(progress, 100)}%` }}
></div>

        </div>

        <input
          type="text"
          placeholder="Nama"
          className="w-full p-3 mb-3 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="number"
          min="1000"
          placeholder="Jumlah donasi minimal 1000 yaa 🥺"
          className="w-full p-3 mb-5 border rounded"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
        />

        <button
          onClick={handleDonate}
          disabled={donateLoading}
          className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          {donateLoading ? "Mengirim donasi..." : "🐣 Donasi Sekarang"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Loader2, Printer, X } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import { Search } from "lucide-react";

interface Donation {
  id: string;
  name: string;
  email: string;
  amount: number;
  event_id: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 5;

export default function AdminDonationPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Donation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal ambil data donasi:", error.message);
    } else {
      setDonations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const deleteDonasi = async (id: string) => {
    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus ini?");
    if (!confirmed) return;

    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (!error) {
      toast.success("Donasi berhasil dihapus!");
      fetchDonations();
    } else {
      toast.error("Gagal menghapus donasi.");
    }
  };

  const startEdit = (donation: Donation) => {
    setEditData(donation);
    setIsEditing(true);
  };

  const handleEditSubmit = async () => {
    if (!editData) return;

    const { error } = await supabase
      .from("donations")
      .update({
        name: editData.name,
        email: editData.email,
        amount: editData.amount,
      })
      .eq("id", editData.id);

    if (!error) {
      toast.success("Donasi berhasil diupdate!");
      setIsEditing(false);
      fetchDonations();
    } else {
      toast.error("Gagal mengupdate donasi");
    }
  };

  const filteredDonations = donations.filter((donation) =>
    donation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);
  const currentDonations = filteredDonations.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Fungsi print yang baru pakai html2canvas + jsPDF
  const handlePrint = async () => {
    const element = document.getElementById("table-container");
    if (!element) {
      toast.error("Elemen tabel tidak ditemukan");
      return;
    }
    try {
      // Tambahkan padding ekstra di container untuk margin saat print
      element.style.padding = "20px";

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Hitung ukuran gambar supaya masuk halaman dan proporsional
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20; // kasih margin 10mm kiri kanan
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = 10; // margin atas 10mm

      // Jika gambarnya lebih tinggi dari halaman PDF, scale down
      if (imgHeight > pdfHeight) {
        position = 0;
      }

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      pdf.save("donasi-lengkap.pdf");

      // Reset padding setelah print
      element.style.padding = "";

      toast.success("PDF berhasil dibuat!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat PDF");
    }
  };

  return (
    <>
      <style>
        {`
          /* Style khusus untuk print */
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 15px;
              box-sizing: border-box;
              background: white;
            }
            /* Biar judul dan icon hadiah tidak terpotong */
            #print-area h1 {
              margin-bottom: 20px;
              font-size: 2rem;
            }
            #print-area table {
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div
        id="print-area"
        className="bg-white shadow-md rounded-lg p-6 print:shadow-none print:rounded-none print:p-2 min-h-screen"
      >
        <div className="p-6 md:p-10 bg-gradient-to-br from-lime-100 to-green-300 rounded-xl shadow-xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-4xl font-bold text-blue-700">
              🎁 Daftar Donasi Masuk
            </h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <Printer className="mr-2 w-5 h-5" />
                Cetak PDF
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center mt-20 text-blue-500">
              <Loader2 className="animate-spin w-8 h-8 mr-2" />
              Memuat data donasi...
            </div>
          ) : (
            // Wrapper tabel dengan id untuk screenshot
            <div
              id="table-container"
              className="overflow-x-auto bg-white p-4 rounded-lg shadow-md"
              style={{ paddingBottom: "2rem" }} // padding bawah ekstra biar gak mepet bawah
            >
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-sm text-gray-600 bg-blue-300 rounded-md">
                    <th className="px-4 py-3">📌 Event ID</th>
                    <th className="px-4 py-3">👤 Nama Donatur</th>
                    <th className="px-4 py-3">📧 Email Donatur</th>
                    <th className="px-4 py-3">💰 Jumlah</th>
                    <th className="px-4 py-3">⏰ Waktu</th>
                    <th className="px-4 py-3">⚙️ Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDonations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-gray-500 italic"
                      >
                        Belum ada donasi yang masuk 🥺
                      </td>
                    </tr>
                  ) : (
                    currentDonations.map((donation) => (
                      <tr
                        key={donation.id}
                        className="bg-white hover:bg-blue-50 transition-all shadow-sm rounded-md"
                      >
                        <td className="px-4 py-3 text-gray-700">
                          {donation.event_id}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {donation.name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {donation.email}
                        </td>
                        <td className="px-4 py-3 text-green-600 font-semibold">
                          Rp {donation.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-sm">
                          {new Date(donation.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => startEdit(donation)}
                            className="px-3 py-1 text-sm bg-yellow-400 text-white rounded hover:bg-yellow-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDonasi(donation.id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    page === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Edit */}
        {isEditing && editData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setIsEditing(false)}
          >
            <div
              className="bg-white p-6 rounded-lg w-80 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                <X />
              </button>
              <h2 className="text-xl font-bold mb-4">Edit Donasi</h2>
              <label className="block mb-2 font-semibold">
                Nama Donatur
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </label>
              <label className="block mb-2 font-semibold">
                Email Donatur
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </label>
              <label className="block mb-4 font-semibold">
                Jumlah Donasi (Rp)
                <input
                  type="number"
                  value={editData.amount}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </label>
              <button
                onClick={handleEditSubmit}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

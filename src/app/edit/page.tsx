'use client'

import { useState } from "react";

type Donor = {
  id: number;
  name: string;
  email: string;
  amount: number;
  donationDate: string;
};

export default function LaporanDonasi() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/donors?start=${startDate}&end=${endDate}`);
      const data = await response.json();
      setDonors(data);
      setShowReport(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    setShowReport(false);
    setDonors([]);
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {!showReport ? (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Pilih Rentang Tanggal</h1>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Dari Tanggal</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-gray-700">Sampai Tanggal</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <button onClick={fetchDonations} disabled={!startDate || !endDate} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
            Tampilkan
          </button>
        </div>
      ) : (
        <div className="printable max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Laporan Donasi</h1>
          <p className="text-sm text-gray-500 mb-4 text-center">Periode: {startDate} sampai {endDate}</p>

          {loading ? (
            <p>Loading data...</p>
          ) : donors.length === 0 ? (
            <p className="text-center text-gray-500">Tidak ada donasi dalam rentang waktu ini.</p>
          ) : (
            <table className="min-w-full table-auto mb-6">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">Nama</th>
                  <th className="px-4 py-2 text-left text-sm">Email</th>
                  <th className="px-4 py-2 text-left text-sm">Jumlah Donasi</th>
                  <th className="px-4 py-2 text-left text-sm">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="px-4 py-2">{d.name}</td>
                    <td className="px-4 py-2">{d.email}</td>
                    <td className="px-4 py-2">Rp{d.amount.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2">{d.donationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex justify-end gap-4">
            <button onClick={handleCancel} className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded">
              Batal
            </button>
            <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
              Cetak Laporan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

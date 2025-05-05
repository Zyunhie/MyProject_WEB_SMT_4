'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Donation {
  _id: string;
  userId: string;
  amount: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  donations: Donation[];
}

interface Props {
  event?: Event; // <- optional untuk cegah error saat undefined
}

const AdminDonationPage = ({ event }: Props): JSX.Element => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    if (event?.donations) {
      setDonations(event.donations);
    }
  }, [event]);

  const handleEditDonation = async (donationId: string) => {
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('Jumlah donasi harus berupa angka bulat positif');
      return;
    }

    try {
      const response = await fetch(`/api/events/${event?._id}/donations/${donationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setDonations(donations.map(donation =>
          donation._id === donationId ? { ...donation, amount } : donation
        ));
        setAmount(0);
        setError('');
        setSelectedDonation(null);

        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.7 },
        });

        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error updating donation:', error);
      setError('Terjadi kesalahan jaringan');
    }
  };

  const handleDeleteDonation = async (donationId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus donasi ini?')) {
      try {
        const response = await fetch(`/api/events/${event?._id}/donations/${donationId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          setDonations(donations.filter(donation => donation._id !== donationId));
          setSuccess(true);
          setError('');
          setTimeout(() => setSuccess(false), 3000);
        } else {
          setError(data.error || 'Gagal menghapus donasi');
        }
      } catch (error) {
        console.error('Error deleting donation:', error);
        setError('Terjadi kesalahan jaringan');
      }
    }
  };

  if (!event) {
    return <p className="text-center mt-12 text-gray-500">Memuat data event...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto mt-12 p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-center mb-3 text-gray-800"
      >
        {event.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center text-gray-600 mb-8"
      >
        {event.description}
      </motion.p>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
          <span>Terkumpul: Rp {event.collectedAmount.toLocaleString()}</span>
          <span>Target: Rp {event.targetAmount.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(event.collectedAmount / event.targetAmount) * 100}%` }}
            className="h-full bg-gradient-to-r from-green-400 to-green-600"
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {donations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Daftar Donasi:</h3>
          <ul className="space-y-4">
            {donations.map((donation: Donation) => (
              <li key={donation._id} className="flex justify-between items-center border-b pb-2 mb-2">
                <span className="text-gray-600">
                  User ID: {donation.userId} - Rp {donation.amount.toLocaleString()}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDonation(donation);
                      setAmount(donation.amount);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDonation(donation._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedDonation && (
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-700">Edit Donasi:</h3>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none transition mb-4"
            placeholder="Contoh: 100000"
          />
          <button
            onClick={() => handleEditDonation(selectedDonation._id)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-xl font-semibold"
          >
            Update Donasi
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-3 font-medium">🎉 Operasi berhasil!</p>}
    </motion.div>
  );
};

export default AdminDonationPage;

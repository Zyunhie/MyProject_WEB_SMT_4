'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface EventProps {
  event: {
    _id: string;
    title: string;
    description: string;
    targetAmount: number;
    collectedAmount: number;
  };
}

const EventPage = ({ event }: { event: EventProps["event"] }) => {
  const [amount, setAmount] = useState(0);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(event.collectedAmount);

  const handleDonate = async () => {
    if (!name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }

    if (amount <= 0) {
      setError('Jumlah donasi tidak valid');
      return;
    }

    const confirmDonate = window.confirm(`Apakah Anda yakin ingin berdonasi sebesar Rp ${amount.toLocaleString()}?`);
    if (!confirmDonate) return;

    try {
      const response = await fetch(`/api/events/${event._id}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_dummy', name, amount }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setProgress(progress + amount);
        setAmount(0);
        setName('');
        setError('');

        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.7 },
        });

        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Terjadi kesalahan saat mengirim donasi.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan saat mengirim donasi.');
    }
  };

  const percentage = Math.min((progress / event.targetAmount) * 100, 100);

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
          <span>Terkumpul: Rp {progress.toLocaleString()}</span>
          <span>Target: Rp {event.targetAmount.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full bg-gradient-to-r from-green-400 to-green-600"
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
          Nama Anda
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none transition"
          placeholder="Contoh: Kelvin"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="donationAmount" className="block text-sm font-semibold text-gray-700 mb-1">
          Jumlah Donasi
        </label>
        <input
          type="number"
          id="donationAmount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none transition"
          placeholder="Contoh: 50000"
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-600 text-sm mb-3 font-medium"
        >
          🎉 Donasi berhasil! Terima kasih banyak ya!
        </motion.p>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleDonate}
        className="w-full bg-green-600 hover:bg-green-700 transition text-white py-2.5 px-4 rounded-xl font-semibold shadow-md"
      >
        💸 Donasi Sekarang
      </motion.button>
    </motion.div>
  );
};

export default EventPage;

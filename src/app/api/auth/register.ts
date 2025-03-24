import { NextApiRequest, NextApiResponse } from 'next';
import { users } from "@clerk/clerk-sdk-node"; // Clerk SDK untuk mengelola pengguna
import User from "@/utils/model/user"; // Model User yang sudah kita buat sebelumnya

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      // 1. Buat pengguna di Clerk
      const newClerkUser = await users.createUser({
        emailAddress: email,
        password: password,
        publicMetadata: { role: 'guest' }, // Set role "guest" sebagai default di Clerk
      });

      // 2. Simpan pengguna di MongoDB
      const newUser = new User({
        username: email.split('@')[0], // Buat username dari bagian depan email
        email: email,
        password: password, // Password ini perlu di-hash di produksi!
        role: 'guest', // Default role ke "guest"
      });

      // Simpan pengguna ke database MongoDB
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully', newClerkUser });

    } catch (error: any) {
        res.status(400).json({ error: (error as Error).message });
      }      
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

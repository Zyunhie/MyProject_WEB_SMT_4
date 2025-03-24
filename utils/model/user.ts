import mongoose, { Schema, Document } from 'mongoose';

// Interface untuk User
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string; // Role bisa 'guest', 'user', 'developer'
}

// Skema untuk User
const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'user', 'developer'], default: 'guest' }, // Default role 'guest'
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;

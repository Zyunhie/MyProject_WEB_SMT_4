import mongoose, { Schema, Document } from "mongoose";

interface Donation {
  userId: string;
  donorName: string;
  amount: number;
  date: Date;
}

export interface EventDocument extends Document {
  title: string;
  description: string;
  collectedAmount: number;
  donations: Donation[];
}

const DonationSchema = new Schema<Donation>({
  userId: { type: String, required: true },
  donorName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
});

const EventSchema = new Schema<EventDocument>({
  title: { type: String, required: true },
  description: { type: String },
  collectedAmount: { type: Number, default: 0 },
  donations: [DonationSchema],
});

export default mongoose.models.Event ||
  mongoose.model<EventDocument>("Event", EventSchema);

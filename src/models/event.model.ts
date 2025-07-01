import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  name: string;
  dateTime: Date;
  location: string;
  description: string;
  attendeeCount: number;
  createdBy: string; // user id from token
  joinedUsers: mongoose.Types.ObjectId[];
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    dateTime: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    attendeeCount: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
    joinedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }], // ✅ correct position
  },
  { timestamps: true }
);

const Event = mongoose.model<IEvent>("Event", eventSchema);

export default Event;

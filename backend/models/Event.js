import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    category: { type: String, required: true },
    venue: { type: String, required: true },
    image: { type: String, default: "" }, // 🖼️ Add this line
    createdBy: { type: String, default: "Admin" },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;

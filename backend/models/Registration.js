import mongoose from "mongoose";
const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    studentName: { type: String, required: true, trim: true },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    collegeName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // 👉 Add this field
    feedbackGiven: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Registration", registrationSchema);

import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
    rating: { type: Number, required: true },
    comments: { type: String, required: true }, 
    editCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;

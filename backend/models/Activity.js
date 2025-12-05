import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Activity", activitySchema);

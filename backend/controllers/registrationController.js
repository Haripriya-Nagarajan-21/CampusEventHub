// @ts-nocheck

import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import fs from "fs";

dotenv.config();

/* -------------------------------------------------------------------------- */
/* ✅ CLOUDINARY CONFIGURATION */
/* -------------------------------------------------------------------------- */
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* -------------------------------------------------------------------------- */
/* ✅ EMAIL FUNCTION (Reusable) */
/* -------------------------------------------------------------------------- */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Campus Event Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ CREATE EVENT (with optional image upload) */
/* -------------------------------------------------------------------------- */
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, category, venue, createdBy } = req.body;

    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "event_images",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // delete temp file
    }

    const event = new Event({
      title,
      description,
      date,
      time,
      category,
      venue,
      createdBy: createdBy || "Admin",
      image: imageUrl,
    });

    await event.save();
    res.status(201).json({ success: true, message: "Event created successfully", event });
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res.status(500).json({ success: false, message: "Error creating event", error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ REGISTER FOR EVENT */
/* -------------------------------------------------------------------------- */
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, name, email, college } = req.body;

    if (!eventId || !name || !email || !college) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const existing = await Registration.findOne({ eventId, studentEmail: email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Already registered for this event" });
    }

    const registration = new Registration({ eventId, studentName: name, studentEmail: email, collegeName: college });
    await registration.save();

    // Email HTML
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <img src="${event.image || 'https://i.ibb.co/4RbTQpL/event-logo.png'}" alt="Event Logo" width="80" style="border-radius: 50%; background: #fff; padding: 5px;">
            <h1 style="color: #ffffff; margin: 10px 0;">Campus Event Portal</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #2563eb;">🎉 Registration Successful!</h2>
            <p>Hello <b>${name}</b>,</p>
            <p>Thank you for registering for <b>${event.title}</b>!</p>
            <h3 style="margin-top: 20px;">📅 Event Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><b>Date:</b></td><td>${event.date}</td></tr>
              <tr><td><b>Time:</b></td><td>${event.time}</td></tr>
              <tr><td><b>Venue:</b></td><td>${event.venue}</td></tr>
            </table>
            <p style="margin-top: 15px;">You’ll receive another email once your registration is approved by the admin.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5173/student-dashboard" style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">View My Dashboard</a>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 13px; color: #555;">
            <p>Campus Event Portal © ${new Date().getFullYear()} | All Rights Reserved</p>
          </div>
        </div>
      </div>
    `;
    await sendEmail(email, "🎫 Event Registration Successful!", html);

    res.status(201).json({ success: true, message: "Event registration successful! Confirmation email sent.", registration });
  } catch (error) {
    console.error("❌ Error registering for event:", error);
    res.status(500).json({ success: false, message: "Error registering for event", error: error.message });
  }
};

/* ✅ GET ALL REGISTRATIONS (ADMIN) */

export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().populate("eventId");
    res.status(200).json({ success: true, registrations });
  } catch (error) {
    console.error("❌ Error fetching registrations:", error);
    res.status(500).json({ success: false, message: "Error fetching registrations" });
  }
};

export const getStudentRegistrations = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const registrations = await Registration.find({ studentEmail: email })
      .select("eventId studentName studentEmail collegeName status feedbackGiven") // 👈 IMPORTANT
      .populate("eventId");

    res.status(200).json({ success: true, registrations });
  } catch (error) {
    console.error("❌ Error fetching student registrations:", error);
    res.status(500).json({ success: false, message: "Error fetching student registrations" });
  }
};


/* ✅ UPDATE REGISTRATION STATUS (ADMIN APPROVE/REJECT) */

export const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const registration = await Registration.findByIdAndUpdate(id, { status }, { new: true }).populate("eventId");
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });

    // Email HTML
    const eventImage = registration.eventId.image || 'https://i.ibb.co/4RbTQpL/event-logo.png';
    let subject, html;

    if (status === "Approved") {
      subject = `✅ Your registration for ${registration.eventId.title} has been approved!`;
      html = `<div style="font-family: Arial; padding: 20px;">
                <h2>Registration Approved ✅</h2>
                <img src="${eventImage}" width="80"/>
                <p>Hello ${registration.studentName}, your registration for <b>${registration.eventId.title}</b> has been approved!</p>
              </div>`;
    } else {
      subject = `❌ Your registration for ${registration.eventId.title} was not approved`;
      html = `<div style="font-family: Arial; padding: 20px;">
                <h2>Registration Rejected ❌</h2>
                <img src="${eventImage}" width="80"/>
                <p>Hello ${registration.studentName}, your registration for <b>${registration.eventId.title}</b> was not approved.</p>
              </div>`;
    }

    await sendEmail(registration.studentEmail, subject, html);

    res.status(200).json({ success: true, message: `Registration ${status.toLowerCase()} successfully and email sent.`, registration });
  } catch (error) {
    console.error("❌ Error updating registration status:", error);
    res.status(500).json({ success: false, message: "Error updating registration status", error: error.message });
  }
};
export const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    res.json({ success: true, message: "Registration deleted successfully" });
  } catch (err) {
    console.error("Delete registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
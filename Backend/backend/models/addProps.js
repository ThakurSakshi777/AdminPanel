import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  propertyLocation: {
    type: String,
    required: true,
  },
  geoLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  areaDetails: {
    type: Number,
    required: true,
  },
  availability: {
    type: String,
    enum: ["Ready to Move", "Under Construction"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  photosAndVideo: {
    type: [String],
    default: [],
  },
  furnishingStatus: {
    type: String,
    enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
    required: true,
  },
  parking: {
    type: String,
    enum: ["Available", "Not Available"],
    required: true,
  },
  purpose: {
    type: String,
    enum: ["Sell", "Rent/Lease", "Paying Guest"],
    required: true,
  },
  propertyType: {
    type: String,
    enum: ["Residential", "Commercial"],
    required: true,
  },
  commercialType: {
    type: String,
    enum: ["office", "shop", "warehouse"],
    required: function () {
      return this.propertyType === "Commercial";
    },
  },
  residentialType: {
    type: String,
    enum: ["apartment", "villa", "plot"],
    required: function () {
      return this.propertyType === "Residential";
    },
  },
  contactNumber: {
    type: String,
    required: true,
  },

  visitCount: {
    type: Number,
    default: 0,
  },
  visitedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      visitedAt: { type: Date, default: Date.now },
    },
  ],

  postedDate: {
    type: Date,
    default: Date.now,
  },
  // Sold status
  isSold: { type: Boolean, default: false },
});

// Geospatial index
propertySchema.index({ geoLocation: "2dsphere" });

const Property = mongoose.model("Property", propertySchema);
export default Property;

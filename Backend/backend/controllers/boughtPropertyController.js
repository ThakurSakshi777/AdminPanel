import Buy from "../models/buyPropertySchema.js";
import Property from "../models/addProps.js"; 
import User from "../models/user.js";

// Save property as bought
export const boughtProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.body;

    if (!userId || !propertyId) {
      return res.status(400).json({ message: "Need both IDs" });
    }

    const boughtProperties = new Buy({ userId, propertyId });
    await boughtProperties.save();

    res.status(200).json({
      message: "Property bought successfully saved",
      data: boughtProperties,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all bought properties for a user
export const getBoughtPropertiesByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const getBought = await Buy.find({ userId })
      .populate("propertyId")
      .sort({ createdAt: -1 }); // latest first

    if (getBought.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }

    res.status(200).json({
      message: "Bought properties fetched successfully",
      count: getBought.length,
      data: getBought,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get all bought properties for admin (with property details)


export const getBoughtProperties = async (req, res) => {
  try {
    const getBought = await Buy.find()
      // 1 Populate property details
      .populate({
        path: "propertyId",
        populate: {
          // 2 Nested populate → seller details inside property
          path: "userId",
          model: "User",
          select: "fullName email phone city state avatar", // only these fields from seller
        },
      })
      // 3 Populate buyer details (direct from Buy model)
      .populate({
        path: "userId",
        model: "User",
        select: "fullName email phone city state avatar",
      })
      .sort({ createdAt: -1 });

    const getBoughtCount = await Buy.countDocuments();

    if (!getBought.length) {
      return res.status(404).json({ message: "No properties found" });
    }

    res.status(200).json({
      message: "Bought properties fetched successfully",
      count: getBoughtCount,
      data: getBought,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

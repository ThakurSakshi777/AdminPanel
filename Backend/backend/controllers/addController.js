import Property from "../models/addProps.js";
import NodeGeocoder from "node-geocoder";
import User from "../models/user.js";
import axios from "axios"; // We'll use axios to call geocoding API
import { sendPushNotification } from "../utils/sendNotification.js";
import dotenv from "dotenv";

dotenv.config();


// Configure geocoder (OpenStreetMap is free)
const geocoder = NodeGeocoder({
  provider: "openstreetmap",
});




// export const addProperty = async (req, res) => {
//   try {
//     const userId = req.user.id; // from authMiddleware

//     const {
//       propertyLocation,
//       areaDetails,
//       availability,
//       price,
//       description,
//       photosAndVideo,
//       furnishingStatus,
//       parking,
//       purpose,
//       propertyType,
//       commercialType,
//       residentialType,
//       contactNumber,
//     } = req.body;

//     // ✅ VALIDATIONS
//     if (!userId) {
//       return res.status(400).json({ message: "Invalid or missing userId" });
//     }
//     if (!propertyLocation || typeof propertyLocation !== "string") {
//       return res
//         .status(400)
//         .json({ message: "Invalid or missing propertyLocation" });
//     }
//     if (!areaDetails || isNaN(Number(areaDetails))) {
//       return res.status(400).json({
//         message: "Invalid or missing areaDetails. Must be a number",
//       });
//     }
//     const validAvailabilities = ["Ready to Move", "Under Construction"];
//     if (!availability || !validAvailabilities.includes(availability)) {
//       return res.status(400).json({
//         message:
//           "Invalid or missing availability. Valid values: Ready to Move, Under Construction",
//       });
//     }
//     if (!price || isNaN(Number(price))) {
//       return res
//         .status(400)
//         .json({ message: "Invalid or missing price. Must be a number" });
//     }
//     if (!description || typeof description !== "string") {
//       return res
//         .status(400)
//         .json({ message: "Invalid or missing description" });
//     }
//     const validFurnishingStatuses = [
//       "Furnished",
//       "Semi-Furnished",
//       "Unfurnished",
//     ];
//     if (
//       !furnishingStatus ||
//       !validFurnishingStatuses.includes(furnishingStatus)
//     ) {
//       return res.status(400).json({
//         message:
//           "Invalid furnishingStatus. Valid values: Furnished, Semi-Furnished, Unfurnished",
//       });
//     }
//     const validParkings = ["Available", "Not Available"];
//     if (!parking || !validParkings.includes(parking)) {
//       return res.status(400).json({
//         message: "Invalid parking. Valid values: Available, Not Available",
//       });
//     }
//     const validPurposes = ["Sell", "Rent/Lease", "Paying Guest"];
//     if (!purpose || !validPurposes.includes(purpose)) {
//       return res.status(400).json({
//         message:
//           "Invalid or missing purpose. Valid values: Sell, Rent/Lease, Paying Guest",
//       });
//     }
//     const validPropertyTypes = ["Residential", "Commercial"];
//     if (!propertyType || !validPropertyTypes.includes(propertyType)) {
//       return res.status(400).json({
//         message:
//           "Invalid or missing propertyType. Valid values: Residential, Commercial",
//       });
//     }
//     const validCommercialTypes = ["office", "shop", "warehouse"];
//     if (
//       propertyType === "Commercial" &&
//       (!commercialType || !validCommercialTypes.includes(commercialType))
//     ) {
//       return res.status(400).json({
//         message:
//           "Invalid or missing commercialType. Valid values: office, shop, warehouse",
//       });
//     }
//     const validResidentialTypes = ["apartment", "villa", "plot"];
//     if (
//       propertyType === "Residential" &&
//       (!residentialType || !validResidentialTypes.includes(residentialType))
//     ) {
//       return res.status(400).json({
//         message:
//           "Invalid or missing residentialType. Valid values: apartment, villa, plot",
//       });
//     }
//     if (
//       !contactNumber ||
//       typeof contactNumber !== "string" ||
//       !/^\+?[1-9]\d{9,14}$/.test(contactNumber)
//     ) {
//       return res.status(400).json({
//         message:
//           "Invalid or missing contactNumber. Must be a valid phone number (e.g., +917669016630)",
//       });
//     }

//     //  GEOCODING
//     const geoRes = await geocoder.geocode(propertyLocation);
//     let coordinates = [0, 0];
//     if (geoRes.length > 0) {
//       coordinates = [geoRes[0].longitude, geoRes[0].latitude];
//     }

//     //  Multer se files ka path nikalna
//     const photoPaths = req.files?.map((file) => file.path) || [];

//     //  Prepare property data
//     const propertyData = {
//       userId,
//       propertyLocation,
//       geoLocation: { type: "Point", coordinates },
//       areaDetails: Number(areaDetails),
//       availability,
//       price: Number(price),
//       description,
//       photosAndVideo: photoPaths,
//       furnishingStatus,
//       parking,
//       purpose,
//       propertyType,
//       ...(propertyType === "Commercial"
//         ? { commercialType }
//         : { residentialType }),
//       contactNumber,
//     };

//     //  Save property
//     const property = new Property(propertyData);
//     await property.save();

//     //  Increment "myListingsCount"
//     await User.findByIdAndUpdate(userId, { $inc: { myListingsCount: 1 } });

//     //  Send Notification to all other users
//     const users = await User.find({
//       _id: { $ne: userId },
//       fcmToken: { $exists: true, $ne: null },
//     });

//     const tokens = users.map((u) => u.fcmToken);
//     if (tokens.length > 0) {
//       await sendPushNotification(
//         tokens,
//         "🏠 New Property Added!",
//         "A new property has just been listed.",
//         { propertyId: property._id.toString() }
//       );
//     }

//     //  Response
//     res.status(201).json({
//       message: "Property added successfully & notification sent!",
//       property,
//     });
//   } catch (error) {
//     console.error("Add Property Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };




export const addProperty = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const {
      propertyLocation,
      areaDetails,
      availability,
      price,
      description,
      photosAndVideo,
      furnishingStatus,
      parking,
      purpose,
      propertyType,
      commercialType,
      residentialType,
      contactNumber,
    } = req.body;

    // ================== VALIDATIONS ==================
    if (!userId) return res.status(400).json({ message: "Invalid or missing userId" });
    if (!propertyLocation || typeof propertyLocation !== "string") return res.status(400).json({ message: "Invalid or missing propertyLocation" });
    if (!areaDetails || isNaN(Number(areaDetails))) return res.status(400).json({ message: "Invalid or missing areaDetails. Must be a number" });
    
    const validAvailabilities = ["Ready to Move", "Under Construction"];
    if (!availability || !validAvailabilities.includes(availability)) return res.status(400).json({ message: "Invalid availability" });

    if (!price || isNaN(Number(price))) return res.status(400).json({ message: "Invalid or missing price" });
    if (!description || typeof description !== "string") return res.status(400).json({ message: "Invalid or missing description" });

    const validFurnishingStatuses = ["Furnished", "Semi-Furnished", "Unfurnished"];
    if (!furnishingStatus || !validFurnishingStatuses.includes(furnishingStatus)) return res.status(400).json({ message: "Invalid furnishingStatus" });

    const validParkings = ["Available", "Not Available"];
    if (!parking || !validParkings.includes(parking)) return res.status(400).json({ message: "Invalid parking" });

    const validPurposes = ["Sell", "Rent/Lease", "Paying Guest"];
    if (!purpose || !validPurposes.includes(purpose)) return res.status(400).json({ message: "Invalid purpose" });

    const validPropertyTypes = ["Residential", "Commercial"];
    if (!propertyType || !validPropertyTypes.includes(propertyType)) return res.status(400).json({ message: "Invalid propertyType" });

    if (propertyType === "Commercial") {
      const validCommercialTypes = ["office", "shop", "warehouse"];
      if (!commercialType || !validCommercialTypes.includes(commercialType)) return res.status(400).json({ message: "Invalid commercialType" });
    }

    if (propertyType === "Residential") {
      const validResidentialTypes = ["apartment", "villa", "plot"];
      if (!residentialType || !validResidentialTypes.includes(residentialType)) return res.status(400).json({ message: "Invalid residentialType" });
    }

    if (!contactNumber || typeof contactNumber !== "string" || !/^\+?[1-9]\d{9,14}$/.test(contactNumber))
      return res.status(400).json({ message: "Invalid contactNumber" });

    // ================== GEOCODING ==================
    const geoRes = await geocoder.geocode(propertyLocation);
    let coordinates = [0, 0];
    if (geoRes.length > 0) coordinates = [geoRes[0].longitude, geoRes[0].latitude];

    // ================== FILES ==================
    const photoPaths = req.files?.map(file => file.path) || [];

    // ================== PREPARE PROPERTY DATA ==================
    const propertyData = {
      userId,
      propertyLocation,
      geoLocation: { type: "Point", coordinates },
      areaDetails: Number(areaDetails),
      availability,
      price: Number(price),
      description,
      photosAndVideo: photoPaths,
      furnishingStatus,
      parking,
      purpose,
      propertyType,
      ...(propertyType === "Commercial" ? { commercialType } : { residentialType }),
      contactNumber,
    };

    // ================== SAVE PROPERTY ==================
    const property = new Property(propertyData);
    await property.save();

    // Increment user's myListingsCount
    await User.findByIdAndUpdate(userId, { $inc: { myListingsCount: 1 } });

    // ================== SEND NOTIFICATIONS ==================
    const users = await User.find({
      _id: { $ne: userId },
      fcmToken: { $exists: true, $ne: null, $ne: "" }, // only valid & non-empty
    });

    // Filter duplicates & invalid tokens
    const tokens = [...new Set(users.map(u => u.fcmToken).filter(t => typeof t === "string" && t.trim() !== ""))];

    let sentCount = 0;
    let failedCount = 0;

    if (tokens.length > 0) {
      try {
        const response = await sendPushNotification(
          tokens,
          "🏠 New Property Added!",
          "A new property has just been listed.",
          { propertyId: property._id.toString() }
        );

        // Firebase response may have individual token results
        if (response?.responses) {
          response.responses.forEach((resp) => {
            if (resp.success) sentCount++;
            else failedCount++;
          });
        }
      } catch (err) {
        console.error("Error sending push notifications:", err);
        failedCount = tokens.length;
      }
    }

    // ================== RESPONSE ==================
    res.status(201).json({
      message: "Property added successfully & notifications processed!",
      property,
      notificationStats: {
        totalUsers: tokens.length,
        sentCount,
        failedCount,
      },
    });

  } catch (error) {
    console.error("Add Property Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




//  Mark property as sold / unsold (toggle)
export const markPropertyAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the property by ID
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Toggle the sold status
    property.isSold = !property.isSold;
    await property.save();

    return res.status(200).json({
      success: true,
      message: property.isSold
        ? "Property marked as sold successfully"
        : "Property marked as unsold successfully",
      isSold: property.isSold,
      property,
    });
  } catch (error) {
    console.error("Error toggling sold status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//  Get all sold properties
export const getSoldProperties = async (req, res) => {
  try {
    // Fetch only properties where isSold = true
    const soldProperties = await Property.find({ isSold: true }).populate("userId", "fullName email");

    if (soldProperties.length === 0) {
      return res.status(404).json({ success: false, message: "No sold properties found" });
    }

    return res.status(200).json({
      success: true,
      count: soldProperties.length,
      soldProperties,
    });
  } catch (error) {
    console.error("Error fetching sold properties:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


//  Delete a sold property by ID
export const deleteSoldProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (!property.isSold) {
      return res.status(400).json({ success: false, message: "This property is not marked as sold" });
    }

    await Property.findByIdAndDelete(id);

    // Decrement user's myListingsCount
    await User.findByIdAndUpdate(property.userId, { $inc: { myListingsCount: -1 } });

    return res.status(200).json({
      success: true,
      message: "Sold property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sold property:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Get sold properties by logged-in user
export const getMySoldProperties = async (req, res) => {
  try {
    const userId = req.user.id; //  userId from verifyToken middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Missing user ID" });
    }

    //  Fetch sold properties belonging to this user
    const soldProperties = await Property.find({ userId, isSold: true })
      .sort({ createdAt: -1 }) // latest first
      .populate("userId", "fullName email");

    if (soldProperties.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sold properties found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      count: soldProperties.length,
      soldProperties,
    });
  } catch (error) {
    console.error("Error fetching user's sold properties:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// controllers/propertyController.js
//  Track property visits

export const visitProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    //  Check if user has already visited this property
    const alreadyVisited = property.visitedBy.some(
      (visit) => visit.userId.toString() === userId
    );

    //  Only push + increment enquiriesCount if first time visit
    if (userId && !alreadyVisited) {
      property.visitedBy.push({ userId });
      await User.findByIdAndUpdate(userId, { $inc: { enquiriesCount: 1 } });
    }

    //  Always increment property visitCount
    property.visitCount += 1;

    await property.save();

    res.status(200).json({
      message: "Property visit recorded successfully",
      visitCount: property.visitCount,
    });
  } catch (error) {
    console.error("Error recording property visit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// controllers/propertyController.js
export const getNearbyProperties = async (req, res) => {
  try {
    const userId = req.user?.id; // From auth middleware
    const { lat, lng, distance, location } = req.query;

    //  Validate user
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: userId missing" });
    }

    //  Step 1: Initialize latitude & longitude
    let latitude, longitude, placeName;

    //  CASE 1: Frontend directly provides coordinates
    if (lat && lng) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);

      // Reverse geocode to get readable place name
      const reverseRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: `${latitude},${longitude}`,
          key: process.env.OPENCAGE_KEY,
          limit: 1,
        },
      });

      placeName = reverseRes.data.results[0]?.formatted || "Unknown location";
    }

    // ✅ CASE 2: Frontend sends location name (manual search)
    else if (location) {
      const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: location,
          key: process.env.OPENCAGE_KEY,
          limit: 1,
          countrycode: "in",
        },
      });

      if (geoRes.data.results && geoRes.data.results.length > 0) {
        latitude = geoRes.data.results[0].geometry.lat;
        longitude = geoRes.data.results[0].geometry.lng;
        placeName = geoRes.data.results[0].formatted;
      } else {
        return res.status(404).json({ success: false, message: "Location not found" });
      }
    }

    // ✅ CASE 3: Use logged-in user's saved address + pinCode
    else {
      const user = await User.findById(userId).select("street city state pinCode");

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // 📍 Full address for geocoding (best accuracy)
      const fullAddress = `${user.street || ""}, ${user.city || ""}, ${user.state || ""}, ${user.pinCode || ""}`.trim();

      console.log("📍 Full user address for geocoding:", fullAddress);

      const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: fullAddress,
          key: process.env.OPENCAGE_KEY,
          limit: 1,
          countrycode: "in",
        },
      });

      if (geoRes.data.results && geoRes.data.results.length > 0) {
        latitude = geoRes.data.results[0].geometry.lat;
        longitude = geoRes.data.results[0].geometry.lng;
        placeName = geoRes.data.results[0].formatted;
      } else {
        console.warn("⚠️ Could not geocode user's address, using default Delhi coordinates");
        latitude = 28.6139;
        longitude = 77.2090;
        placeName = "Default Location (Delhi)";
      }
    }

    // 🧮 Step 2: Convert km to meters (default 20 km)
    const distanceInMeters = distance ? parseFloat(distance) * 1000 : 20000;
    

    // 🏘️ Step 3: Find nearby properties (exclude self)
    const nearbyProperties = await Property.find({
      geoLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: distanceInMeters,
        },
      },
      userId: { $ne: userId },
    });

    const user = await User.findById(userId).select("street city state pinCode");
    const fullAddress = `${user.street || ""}, ${user.city || ""}, ${user.state || ""}, ${user.pinCode || ""}`.trim();


    // 🧾 Step 4: Return response
    return res.status(200).json({
      success: true,
      count: nearbyProperties.length,
      distanceUsed: distanceInMeters / 1000 + " km",
      usedLocation: {
        latitude,
        longitude,

      },
      userAddressUsed: fullAddress || "derived from user profile",
      message: "Nearby properties fetched successfully",
      data: nearbyProperties,
    });
  } catch (error) {
    console.error("❌ Nearby Properties Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching nearby properties",
      error: error.message,
    });
  }
};





// DELETE property by ID
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    //  Decrement user's myListingsCount
    await User.findByIdAndUpdate(property.userId, { $inc: { myListingsCount: -1 } });

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete Property Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE property by ID (only specific fields)
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "propertyLocation",
      "description",
      "price",
      "areaDetails",
      "purpose",
    ];

    const updatedData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updatedData[key] = req.body[key];
      }
    }

    //  Fix image path for multer uploads
    if (req.files && req.files.length > 0) {
      const photoPaths = req.files.map((file) => {
        // sirf filename add karo
        return `uploads/${file.filename}`;
      });
      updatedData.photosAndVideo = photoPaths;
    }

    //  Update geoLocation if location changed
    if (updatedData.propertyLocation) {
      const geoRes = await geocoder.geocode(updatedData.propertyLocation);
      if (geoRes.length > 0) {
        updatedData.geoLocation = {
          type: "Point",
          coordinates: [geoRes[0].longitude, geoRes[0].latitude],
        };
      }
    }

    //  Update in DB
    const property = await Property.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Update Property Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

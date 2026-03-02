import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

const PanditSchema = new mongoose.Schema({
    email: String,
    phone: String,
    whatsapp: String,
    aadhaarCardUrl: String,
    isActive: Boolean
});

const Pandit = mongoose.models.Pandit || mongoose.model("Pandit", PanditSchema);

async function diagnostic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log("Connected to MongoDB.");

        const duplicates = await Pandit.aggregate([
            {
                $group: {
                    _id: "$email",
                    count: { $sum: 1 },
                    docs: { $push: { id: "$_id", whatsapp: "$whatsapp", aadhaar: "$aadhaarCardUrl" } }
                }
            },
            { $match: { count: { $gt: 1 }, _id: { $ne: "" } } }
        ]);

        if (duplicates.length === 0) {
            console.log("No duplicate emails found.");
        } else {
            console.log("Found duplicate emails:");
            console.log(JSON.stringify(duplicates, null, 2));
        }

        const allPandits = await Pandit.find({ isActive: true }).limit(10);
        console.log("Last 10 Active Pandits:");
        console.log(allPandits.map(p => ({
            id: p._id,
            email: p.email,
            whatsapp: p.whatsapp,
            aadhaar: p.aadhaarCardUrl ? "YES" : "NO"
        })));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

diagnostic();

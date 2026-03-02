import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PanditSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    whatsapp: String,
    aadhaarCardUrl: String,
    isActive: Boolean
}, { collection: 'pandits' });

const Pandit = mongoose.models.Pandit || mongoose.model("Pandit", PanditSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log("Connected to MongoDB.");

        const pandits = await Pandit.find();
        console.log(`Found ${pandits.length} pandits total.\n`);

        pandits.forEach((p, i) => {
            console.log(`[${i + 1}] ID: ${p._id}`);
            console.log(`    Name: ${p.name}`);
            console.log(`    Email: ${p.email}`);
            console.log(`    Phone: ${p.phone}`);
            console.log(`    WhatsApp: "${p.whatsapp}" (${p.whatsapp ? 'PRESENT' : 'MISSING'})`);
            console.log(`    Aadhaar: "${p.aadhaarCardUrl}" (${p.aadhaarCardUrl ? 'PRESENT' : 'MISSING'})\n`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

check();

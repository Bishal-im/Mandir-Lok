import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const PanditSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    whatsapp: String,
    aadhaarCardUrl: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Pandit = mongoose.models.Pandit || mongoose.model("Pandit", PanditSchema);

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log("Connected to MongoDB.");

        const all = await Pandit.find();
        console.log(`Initial count: ${all.length}`);

        // 1. Normalize all emails and phones
        for (const p of all) {
            let updated = false;
            if (p.email && p.email !== p.email.toLowerCase()) {
                p.email = p.email.toLowerCase().trim();
                updated = true;
            }
            if (p.phone && p.phone.trim() !== p.phone) {
                p.phone = p.phone.trim();
                updated = true;
            }
            if (updated) await p.save();
        }

        // 2. Refresh and group by normalized email
        const refreshed = await Pandit.find();
        const groupsByEmail: Record<string, any[]> = {};
        for (const p of refreshed) {
            if (p.email) {
                const email = p.email.toLowerCase().trim();
                if (!groupsByEmail[email]) groupsByEmail[email] = [];
                groupsByEmail[email].push(p);
            }
        }

        // 3. Merge and deduplicate
        for (const [email, docs] of Object.entries(groupsByEmail)) {
            if (docs.length > 1) {
                console.log(`Merging ${docs.length} docs for ${email}`);
                // Sort by completeness
                const sorted = docs.sort((a, b) => {
                    const scoreA = (a.whatsapp ? 1 : 0) + (a.aadhaarCardUrl ? 1 : 0);
                    const scoreB = (b.whatsapp ? 1 : 0) + (b.aadhaarCardUrl ? 1 : 0);
                    if (scoreA !== scoreB) return scoreB - scoreA;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                const primary = sorted[0];
                const others = sorted.slice(1);

                // Merge data from others into primary if prime is missing it
                let primaryUpdated = false;
                for (const other of others) {
                    if (!primary.whatsapp && other.whatsapp) {
                        primary.whatsapp = other.whatsapp;
                        primaryUpdated = true;
                    }
                    if (!primary.aadhaarCardUrl && other.aadhaarCardUrl) {
                        primary.aadhaarCardUrl = other.aadhaarCardUrl;
                        primaryUpdated = true;
                    }
                    console.log(`Deleting duplicate ID: ${other._id}`);
                    await Pandit.deleteOne({ _id: other._id });
                }
                if (primaryUpdated) await primary.save();
            }
        }

        const finalCount = await Pandit.countDocuments();
        console.log(`Final count: ${finalCount}`);
        console.log("Migration complete.");

    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();

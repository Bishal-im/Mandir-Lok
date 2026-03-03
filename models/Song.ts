import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISong extends Document {
    title: string;
    artist: string;
    audioUrl: string;
    imageUrl: string;
    type: "bhajan" | "aarti" | "chalisa";
    deity: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SongSchema = new Schema<ISong>(
    {
        title: { type: String, required: true, trim: true },
        artist: { type: String, required: true, trim: true },
        audioUrl: { type: String, required: true },
        imageUrl: { type: String, required: true },
        type: {
            type: String,
            enum: ["bhajan", "aarti", "chalisa"],
            required: true,
        },
        deity: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Song: Model<ISong> =
    mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);

export default Song;

"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, Loader2, Image as ImageIcon } from "lucide-react";

interface CloudinaryImageUploaderProps {
    onUploadSuccess: (url: string) => void;
    folder?: string;
    label?: string;
}

export default function CloudinaryImageUploader({
    onUploadSuccess,
    folder = "aarti_assets",
    label = "Upload Image"
}: CloudinaryImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type (images only)
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        // Validate size (10MB max for images)
        if (file.size > 10 * 1024 * 1024) {
            setError("File size exceeds 10MB limit.");
            return;
        }

        setIsUploading(true);
        setProgress(0);
        setError("");

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            setError("Cloudinary configuration missing.");
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", folder);
        formData.append("resource_type", "image");

        try {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    onUploadSuccess(response.secure_url);
                    setIsUploading(false);
                    setProgress(100);
                } else {
                    setError("Upload failed.");
                    setIsUploading(false);
                }
            };

            xhr.onerror = () => {
                setError("Network error occurred.");
                setIsUploading(false);
            };

            xhr.send(formData);
        } catch (err) {
            setError("An unexpected error occurred.");
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                className="hidden"
            />

            {!isUploading && progress !== 100 && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-[#ff7f0a] rounded-xl font-bold text-xs hover:bg-orange-100 transition-all border border-orange-100"
                >
                    <Upload size={14} /> {label}
                </button>
            )}

            {isUploading && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-2 text-gray-600 font-medium">
                            <Loader2 size={12} className="animate-spin text-[#ff7f0a]" />
                            Uploading Image...
                        </span>
                        <span className="text-[#ff7f0a] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-[#ff7f0a] h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {progress === 100 && !isUploading && (
                <div className="flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                    <Check size={14} /> Upload Successful!
                    <button
                        onClick={() => { setProgress(0); setError(""); }}
                        className="ml-auto p-1 hover:bg-green-100 rounded-lg transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            {error && (
                <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                    <X size={10} /> {error}
                </p>
            )}
        </div>
    );
}

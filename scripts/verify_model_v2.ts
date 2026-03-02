import mongoose from "mongoose";
import dotenv from "dotenv";
import Pandit from "./models/Pandit";

dotenv.config({ path: ".env.local" });

async function verify() {
    try {
        console.log("Checking Pandit model schema...");
        const paths = Object.keys(Pandit.schema.paths);
        console.log("Available paths:", paths.join(", "));

        if (paths.includes("aadhaarCardUrl") && paths.includes("aadhaarStatus")) {
            console.log("SUCCESS: Aadhaar fields are present in schema.");
        } else {
            console.log("FAILURE: Aadhaar fields are STILL MISSING from schema.");
        }

    } catch (err) {
        console.error(err);
    }
}

verify();

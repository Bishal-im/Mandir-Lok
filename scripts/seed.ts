/**
 * SEED SCRIPT — Run this once to populate your MongoDB
 * 
 * HOW TO RUN:
 * npx ts-node --project tsconfig.json scripts/seed.ts
 * OR add to package.json: "seed": "npx ts-node scripts/seed.ts"
 * then run: npm run seed
 */

import mongoose from "mongoose";
import Temple from "../models/Temple";
import Pooja from "../models/Pooja";
import Chadhava from "../models/Chadhava";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mandirlok";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  // Clear existing data (optional — comment out if you don't want to wipe)
  await Temple.deleteMany({});
  await Pooja.deleteMany({});
  await Chadhava.deleteMany({});
  console.log("🗑️  Cleared old data");

  // ── SEED TEMPLES ──────────────────────────────────────────────────────────
  const temples = await Temple.insertMany([
    {
      name: "Shri Kashi Vishwanath Temple",
      slug: "kashi-vishwanath",
      location: "Vishwanath Gali, Varanasi, Uttar Pradesh",
      city: "Varanasi",
      state: "Uttar Pradesh",
      category: "Jyotirlinga",
      deity: "Lord Shiva",
      description: "One of the 12 Jyotirlingas, this ancient temple on the banks of the Ganga is one of the holiest shrines in Hinduism.",
      about: "The Kashi Vishwanath Temple is one of the most famous Hindu temples dedicated to Lord Shiva. It stands on the western bank of the holy river Ganga and is one of the twelve Jyotirlingas.",
      rating: 4.9,
      totalReviews: 12400,
      pujasAvailable: 12,
      isPopular: true,
      isFeatured: true,
      openTime: "3:00 AM – 11:00 PM",
      phone: "+91 98765 43210",
      website: "shrikashivishwanath.org",
      mapUrl: "https://maps.google.com/?q=Kashi+Vishwanath+Temple+Varanasi",
    },
    {
      name: "Sri Venkateswara Temple",
      slug: "tirupati-balaji",
      location: "Tirumala Hills, Tirupati, Andhra Pradesh",
      city: "Tirupati",
      state: "Andhra Pradesh",
      category: "Vaishnavite",
      deity: "Lord Venkateswara",
      description: "The richest temple in the world and one of the most visited pilgrimage sites, known for Tirumala hills and divine darshan.",
      about: "The Tirumala Venkateswara Temple is a famous Hindu temple located on the Tirumala Hills in Tirupati, Andhra Pradesh.",
      rating: 4.9,
      totalReviews: 23100,
      pujasAvailable: 18,
      isPopular: true,
      isFeatured: true,
      openTime: "2:30 AM – 1:00 AM",
      phone: "+91 877 226 5000",
      website: "tirumala.org",
      mapUrl: "https://maps.google.com/?q=Tirupati+Balaji+Temple",
    },
    {
      name: "Shree Siddhivinayak Ganapati",
      slug: "siddhivinayak",
      location: "Prabhadevi, Mumbai, Maharashtra",
      city: "Mumbai",
      state: "Maharashtra",
      category: "Famous Temples",
      deity: "Lord Ganesha",
      description: "The most celebrated Ganesha temple in Maharashtra, visited by millions seeking Ganpati's blessings for new beginnings.",
      rating: 4.8,
      totalReviews: 3214,
      pujasAvailable: 9,
      isPopular: true,
      isFeatured: false,
      openTime: "5:30 AM – 9:30 PM",
      phone: "+91 22 2437 3626",
      website: "siddhivinayak.org",
      mapUrl: "https://maps.google.com/?q=Siddhivinayak+Temple+Mumbai",
    },
    {
      name: "Shri Mata Vaishno Devi Mandir",
      slug: "vaishno-devi",
      location: "Katra, Jammu & Kashmir",
      city: "Katra",
      state: "J&K",
      category: "Shaktipeeth",
      deity: "Mata Vaishno Devi",
      description: "One of the most revered Hindu shrines, nestled in the Trikuta Mountains, drawing millions of pilgrims annually.",
      rating: 4.9,
      totalReviews: 4250,
      pujasAvailable: 7,
      isPopular: true,
      isFeatured: true,
      openTime: "Open 24 Hours",
      phone: "+91 1991 232 522",
      website: "maavaishnodevi.org",
      mapUrl: "https://maps.google.com/?q=Vaishno+Devi+Temple",
    },
    {
      name: "Mahakaleshwar Jyotirlinga",
      slug: "mahakaleshwar",
      location: "Ujjain, Madhya Pradesh",
      city: "Ujjain",
      state: "Madhya Pradesh",
      category: "Jyotirlinga",
      deity: "Lord Shiva (Mahakal)",
      description: "The only south-facing Jyotirlinga and the 'Lord of Time'. Famous for the Bhasma Aarti performed at dawn each day.",
      rating: 4.9,
      totalReviews: 3820,
      pujasAvailable: 15,
      isPopular: true,
      isFeatured: true,
      openTime: "4:00 AM – 11:00 PM",
      phone: "+91 734 255 0563",
      website: "mahakaleshwar.org",
      mapUrl: "https://maps.google.com/?q=Mahakaleshwar+Temple+Ujjain",
    },
  ]);
  console.log(`✅ Seeded ${temples.length} temples`);

  // Helper to get temple _id by slug
  const getTemple = (slug: string) => temples.find((t) => t.slug === slug)?._id;

  // ── SEED POOJAS ──────────────────────────────────────────────────────────
  const poojas = await Pooja.insertMany([
    {
      name: "Rudrabhishek",
      slug: "kashi-rudrabhishek",
      templeId: getTemple("kashi-vishwanath"),
      deity: "Shiva",
      emoji: "🪔",
      description: "A sacred Rudrabhishek on the banks of the holy Ganga at one of India's most powerful Shiva temples.",
      price: 1100,
      duration: "1.5 hours",
      benefits: ["Moksha blessings", "Kaal Sarp dosh remedy", "Pitru shanti", "Remove obstacles"],
      includes: ["Personalized sankalp in your name", "HD video delivered on WhatsApp", "Prasad offered to deity", "Pandit's personal blessings"],
      tag: "TRENDING",
      tagColor: "bg-amber-500",
      rating: 4.9,
      totalReviews: 3240,
      isActive: true,
      isFeatured: true,
      availableDays: "Every Monday & Pradosh Tithi",
    },
    {
      name: "Mahakaleshwar Rudrabhishek & Bhasma Aarti",
      slug: "mahakaleshwar-rudrabhishek",
      templeId: getTemple("mahakaleshwar"),
      deity: "Shiva",
      emoji: "🪔",
      description: "The most powerful Rudrabhishek performed at the only south-facing Jyotirlinga. Bhasma Aarti is offered at dawn.",
      price: 2100,
      duration: "2 hours",
      benefits: ["Peace & prosperity", "Health & longevity", "Removal of obstacles"],
      includes: ["Personalized sankalp in your name", "HD video delivered on WhatsApp", "Bhasma Aarti participation", "Pandit's personal blessings"],
      tag: "MOST POPULAR",
      tagColor: "bg-orange-500",
      rating: 4.9,
      totalReviews: 5120,
      isActive: true,
      isFeatured: true,
      availableDays: "Every Monday, Maha Shivratri",
    },
    {
      name: "Tirupati Balaji Vishesh Archana",
      slug: "tirupati-archana",
      templeId: getTemple("tirupati-balaji"),
      deity: "Vishnu",
      emoji: "🌺",
      description: "Special Archana at the world's most visited temple. Sahasranama Archana performed with 1008 names.",
      price: 1500,
      duration: "45 mins",
      benefits: ["Wealth & prosperity", "Wish fulfilment", "Marriage blessings"],
      includes: ["Personalized sankalp", "HD video on WhatsApp", "Prasad offered"],
      tag: "SPECIAL OFFER",
      tagColor: "bg-rose-500",
      rating: 4.9,
      totalReviews: 4210,
      isActive: true,
      isFeatured: true,
      availableDays: "Every Day",
    },
    {
      name: "Siddhivinayak Maha Abhishek",
      slug: "siddhivinayak-puja",
      templeId: getTemple("siddhivinayak"),
      deity: "Ganesha",
      emoji: "🐘",
      description: "Maha Abhishek and Archana at the most celebrated Ganesha temple in Maharashtra.",
      price: 1200,
      duration: "1 hour",
      benefits: ["Business success", "Education blessings", "Obstacle removal"],
      includes: ["Personalized sankalp", "HD video on WhatsApp", "Modak prasad"],
      tag: "NEW",
      tagColor: "bg-teal-500",
      rating: 4.8,
      totalReviews: 1840,
      isActive: true,
      isFeatured: false,
      availableDays: "Every Wednesday",
    },
    {
      name: "Mata Vaishno Devi Aarti Seva",
      slug: "vaishno-devi-aarti",
      templeId: getTemple("vaishno-devi"),
      deity: "Devi",
      emoji: "🔱",
      description: "Special Aarti and Chadhava at the most visited Shakti shrine in northern India.",
      price: 801,
      duration: "1 hour",
      benefits: ["Divine protection", "Health blessings", "Family well-being"],
      includes: ["Sankalp in your name", "Video on WhatsApp", "Aarti prasad"],
      tag: "",
      tagColor: "",
      rating: 4.9,
      totalReviews: 2950,
      isActive: true,
      isFeatured: false,
      availableDays: "Every Friday & Navratri",
    },
  ]);
  console.log(`✅ Seeded ${poojas.length} poojas`);

  // ── SEED CHADHAVA ─────────────────────────────────────────────────────────
  const chadhavaItems = await Chadhava.insertMany([
    { name: "Bel Patra", templeId: getTemple("kashi-vishwanath"), category: "Flowers", emoji: "🌿", price: 51, description: "Sacred Bel leaves offered to Lord Shiva" },
    { name: "Dhatura", templeId: getTemple("kashi-vishwanath"), category: "Flowers", emoji: "🌸", price: 51, description: "Sacred Dhatura flower offering" },
    { name: "Flower Garland", templeId: getTemple("kashi-vishwanath"), category: "Flowers", emoji: "💐", price: 151, description: "Fresh flower garland for the deity" },
    { name: "Prasad Thali", templeId: getTemple("kashi-vishwanath"), category: "Bhog", emoji: "🍱", price: 251, description: "Complete prasad thali offering" },
    { name: "Panchamrit", templeId: getTemple("kashi-vishwanath"), category: "Bhog", emoji: "🥛", price: 251, description: "Sacred Panchamrit for abhishek" },
    { name: "Pure Ghee Diya", templeId: getTemple("kashi-vishwanath"), category: "Deep Daan", emoji: "🪔", price: 251, description: "Pure ghee lamp offering" },
    { name: "Lotus Flower", templeId: getTemple("tirupati-balaji"), category: "Flowers", emoji: "🪷", price: 201, description: "Sacred lotus offered to Lord Venkateswara" },
    { name: "Tulsi Leaves", templeId: getTemple("tirupati-balaji"), category: "Flowers", emoji: "🌱", price: 51, description: "Holy Tulsi leaves offering" },
    { name: "Modak Offering", templeId: getTemple("siddhivinayak"), category: "Bhog", emoji: "🥮", price: 251, description: "Lord Ganesha's favourite Modak" },
  ]);
  console.log(`✅ Seeded ${chadhavaItems.length} chadhava items`);

  console.log("\n🎉 Seed complete! Your DB is ready.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
"use server";

import { headers } from "next/headers";

export async function getCountryCode() {
  const headersList = headers();
  const country = headersList.get("x-vercel-ip-country") || "IN";
  return country;
}

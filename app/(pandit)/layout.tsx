import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Pandit from "@/models/Pandit";
import { unstable_noStore as noStore } from "next/cache";

export default async function PanditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();
  const token = cookies().get("mandirlok_pandit_token")?.value;
  const pathname = headers().get('x-pathname') || "";

  if (!token) {
    redirect("/pandit-login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { panditId: string };

    await connectDB();
    const pandit = await Pandit.findById(decoded.panditId);

    if (!pandit || !pandit.isActive) {
      redirect("/pandit-login");
    }

    // Check for onboarding completion
    const isProfileIncomplete = !pandit.whatsapp?.trim() || !pandit.aadhaarCardUrl?.trim();
    const isOnboardingPage = pathname === "/pandit/onboarding";

    console.log(`[Pandit Layout] ID: ${pandit._id} | Email: ${pandit.email} | WhatsApp: "${pandit.whatsapp}" | Aadhaar: "${pandit.aadhaarCardUrl}" | Incomplete: ${isProfileIncomplete} | Path: ${pathname}`);

    if (isProfileIncomplete && !isOnboardingPage) {
      redirect("/pandit/onboarding");
    }

    // If profile is complete, don't allow access to onboarding page
    if (!isProfileIncomplete && isOnboardingPage) {
      redirect("/pandit/dashboard");
    }

  } catch (error) {
    if (error instanceof Error && (error.message.includes("NEXT_REDIRECT") || error.name === "NextRedirectError")) {
      throw error;
    }
    redirect("/pandit-login");
  }

  return <>{children}</>;
}

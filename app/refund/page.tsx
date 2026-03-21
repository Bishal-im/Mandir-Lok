import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "Refund & Cancellation Policy | Mandirlok",
  description: "Learn about Mandirlok's refund processes and cancellation rules for pooja bookings.",
};

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#fdf6ee]">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1a0500] to-[#8b0000] text-white py-14 text-center">
          <div className="text-4xl mb-3">🔄</div>
          <h1 className="font-display text-3xl font-bold mb-2">Refund & Cancellation Policy</h1>
          <p className="text-[#f0dcc8] text-sm">Last updated: February 2026</p>
        </div>

        <div className="container-app py-12 max-w-3xl mx-auto">
          <div className="bg-white border border-[#f0dcc8] rounded-2xl p-8 shadow-card space-y-8">
            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">1. Cancellation Window</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed mb-3">
                We understand that plans can change. You can cancel your pooja booking according to the following rules:
              </p>
              <ul className="list-disc pl-5 text-sm text-[#6b5b45] space-y-1.5">
                <li><strong className="text-[#1a1209]">More than 24 hours before:</strong> 100% refund of the booking amount.</li>
                <li><strong className="text-[#1a1209]">Less than 24 hours before:</strong> No refund is possible as our pandits begin ritual preparations and temple coordination starts 24 hours in advance.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">2. Processing Time</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                Approved refunds are processed to your original payment method (UPI, Card, or Net Banking) within <strong className="text-[#1a1209]">5 to 7 business days</strong>. Please note that banks may take additional time to reflect the amount in your account.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">3. Service Failures</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                In the rare event that a pooja cannot be performed due to technical issues, temple restrictions, or pandit unavailability, Mandirlok will issue a <strong className="text-[#1a1209]">100% automatic refund</strong> and notify you via WhatsApp/Email.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">4. Chadhava Offerings</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                Once a chadhava (offering) has been placed at the temple, it cannot be returned or refunded. Cancellation rules for chadhava are the same as pooja bookings (24-hour window).
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">5. How to Request a Refund</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                To request a cancellation or refund, please visit your <Link href="/dashboard" className="text-[#ff7f0a] hover:underline">User Dashboard</Link> or contact our support team via WhatsApp with your Booking ID.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">6. Contact Us</h2>
              <p className="text-sm text-[#6b5b45]">
                For any refund-related queries, please{" "}
                <Link href="/contact" className="text-[#ff7f0a] hover:underline font-medium">contact our support team</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

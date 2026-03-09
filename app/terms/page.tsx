import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Mandirlok",
  description: "Terms and conditions for using Mandirlok — the online temple pooja booking platform.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#fdf6ee]">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1a0500] to-[#8b0000] text-white py-14 text-center">
          <div className="text-4xl mb-3">⚖️</div>
          <h1 className="font-display text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-[#f0dcc8] text-sm">Last updated: February 2026</p>
        </div>

        <div className="container-app py-12 max-w-3xl mx-auto">
          <div className="bg-white border border-[#f0dcc8] rounded-2xl p-8 shadow-card space-y-8">

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                By accessing or using Mandirlok, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform. We reserve the right to modify these terms at any time, and continued use of the platform constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">2. Use of Platform</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed mb-3">
                Mandirlok is a platform that facilitates the booking of online poojas and chadhava offerings performed by verified pandits at partner temples. You agree to:
              </p>
              <ul className="list-disc pl-5 text-sm text-[#6b5b45] space-y-1.5">
                <li>Provide accurate information in sankalp details (name, gotra, etc.)</li>
                <li>Not misuse the platform for any illegal or harmful purpose</li>
                <li>Maintain the confidentiality of your account and OTP codes</li>
                <li>Not attempt to disrupt or harm the platform infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">3. Payments</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                All payments are processed securely through Cashfree. We accept UPI, credit/debit cards, and net banking. Prices are displayed in Indian Rupees (₹) and are inclusive of all applicable charges. Mandirlok does not store your payment card details.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">4. Cancellation & Refund Policy</h2>
              <div className="bg-[#fff8f0] border border-[#ffd9a8] rounded-xl p-4 text-sm text-[#6b5b45] space-y-2">
                <p>
                  <strong className="text-[#1a1209]">Full Refund:</strong> Cancellation more than 24 hours before the scheduled booking date qualifies for a 100% refund.
                </p>
                <p>
                  <strong className="text-[#1a1209]">No Refund:</strong> Cancellations within 24 hours of the scheduled booking date are not eligible for refunds, as pandit preparation has already begun.
                </p>
                <p>
                  <strong className="text-[#1a1209]">Technical Failure:</strong> If a pooja cannot be performed due to technical issues on our side, a full refund will be issued within 5-7 business days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">5. Video Delivery SLA</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                Mandirlok commits to delivering your pooja video link via WhatsApp within 2 hours of the pooja completion. Videos are hosted on secure cloud storage and remain accessible for 30 days from delivery. We are not responsible for WhatsApp delivery issues caused by the recipient's account settings.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">6. Pandit Services</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                All pandits on our platform are verified. However, Mandirlok acts as a facilitator and is not directly responsible for the specific mantras or rituals performed. Pandits follow traditional methods appropriate for each pooja type.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">7. Contact</h2>
              <p className="text-sm text-[#6b5b45]">
                For any questions regarding these terms, please{" "}
                <Link href="/contact" className="text-[#ff7f0a] hover:underline font-medium">contact us</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

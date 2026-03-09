import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Mandirlok",
  description: "How Mandirlok collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#fdf6ee]">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1a0500] to-[#8b0000] text-white py-14 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="font-display text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-[#f0dcc8] text-sm">Last updated: February 2026</p>
        </div>

        <div className="container-app py-12 max-w-3xl mx-auto">
          <div className="bg-white border border-[#f0dcc8] rounded-2xl p-8 shadow-card space-y-8">

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">1. Information We Collect</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed mb-3">
                When you use Mandirlok, we collect:
              </p>
              <ul className="list-disc pl-5 text-sm text-[#6b5b45] space-y-1.5">
                <li><strong className="text-[#1a1209]">Account info:</strong> Email address (used for OTP login)</li>
                <li><strong className="text-[#1a1209]">Sankalp details:</strong> Name, gotra, date of birth (for pooja personalization)</li>
                <li><strong className="text-[#1a1209]">Contact info:</strong> Phone number, WhatsApp number (for booking updates)</li>
                <li><strong className="text-[#1a1209]">Booking data:</strong> Selected pooja, temple, date, and chadhava items</li>
                <li><strong className="text-[#1a1209]">Usage data:</strong> Pages visited, device type (for platform improvement)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">2. How We Use Your Information</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed mb-3">We use your information to:</p>
              <ul className="list-disc pl-5 text-sm text-[#6b5b45] space-y-1.5">
                <li>Authenticate your identity via OTP</li>
                <li>Process and confirm your bookings</li>
                <li>Send booking updates and pooja videos via WhatsApp</li>
                <li>Assign pandits to your bookings</li>
                <li>Improve our platform and services</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">3. WhatsApp Messaging</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                By providing your WhatsApp number, you consent to receiving booking confirmations, pandit assignment notifications, and pooja video links via WhatsApp. We use Twilio's WhatsApp Business API for sending messages. You can opt out by contacting us, though this may affect your ability to receive pooja videos.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">4. Payment Data</h2>
              <div className="bg-[#f0fdf4] border border-green-200 rounded-xl p-4 text-sm text-[#6b5b45]">
                <p>
                  <strong className="text-[#1a1209]">🔒 We do not store your payment card details.</strong> All payments are processed securely by Cashfree, a PCI-DSS compliant payment gateway. Mandirlok only receives a payment confirmation and transaction ID. Please refer to{" "}
                  <a href="https://www.cashfree.com/privacypolicy/" target="_blank" rel="noreferrer" className="text-[#ff7f0a] hover:underline">Cashfree's Privacy Policy</a>{" "}
                  for details on how they handle your payment data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">5. Data Sharing</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                We share your booking details (name, phone, WhatsApp) with the assigned pandit so they can perform your pooja. We do not sell or share your personal data with third parties for marketing purposes. We may share data with law enforcement if required by law.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">6. Data Retention</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                We retain your booking data for up to 3 years for tax and audit compliance. OTP codes are automatically deleted after 10 minutes. You may request account deletion at any time.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">7. Your Rights (Right to Deletion)</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                You have the right to request deletion of your personal data. To exercise this right, please contact us at our support email. We will process deletion requests within 14 business days. Note that some data may be retained for legal compliance.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">8. Cookies</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                We use HTTP-only cookies to maintain your login session. These are secure, cannot be accessed by JavaScript, and expire after 7 days. We do not use tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">9. Contact</h2>
              <p className="text-sm text-[#6b5b45]">
                For privacy-related questions or data deletion requests, please{" "}
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

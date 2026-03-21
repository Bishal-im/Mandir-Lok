import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "Shipping & Delivery Policy | Mandirlok",
  description: "Information about shipping and delivery of Prasad and sacred items from Mandirlok.",
};

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#fdf6ee]">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1a0500] to-[#8b0000] text-white py-14 text-center">
          <div className="text-4xl mb-3">🚚</div>
          <h1 className="font-display text-3xl font-bold mb-2">Shipping & Delivery Policy</h1>
          <p className="text-[#f0dcc8] text-sm">Last updated: February 2026</p>
        </div>

        <div className="container-app py-12 max-w-3xl mx-auto">
          <div className="bg-white border border-[#f0dcc8] rounded-2xl p-8 shadow-card space-y-8">
            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">1. Delivery Scope</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                Mandirlok delivers sacred Prasad and blessed items to devotees across India. For international devotees, we currently offer digital video proof of rituals, but physical shipping is limited to select countries (please contact support).
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">2. Digital Delivery (Video)</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                Videos of performed rituals are delivered digitally via <strong className="text-[#1a1209]">WhatsApp and Email</strong> within <strong className="text-[#1a1209]">24 to 48 hours</strong> of the ritual completion.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">3. Physical Delivery (Prasad)</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed mb-3">
                If your selected service includes physical Prasad delivery:
              </p>
              <ul className="list-disc pl-5 text-sm text-[#6b5b45] space-y-1.5">
                <li><strong className="text-[#1a1209]">Dispatch:</strong> Prasad is dispatched from the temple location or our central hub within 2-3 business days of the ritual.</li>
                <li><strong className="text-[#1a1209]">Delivery Timeline:</strong> It usually takes <strong className="text-[#1a1209]">5 to 10 business days</strong> for the Prasad to reach your address in India.</li>
                <li><strong className="text-[#1a1209]">Tracking:</strong> A tracking ID will be shared via WhatsApp once the item is shipped via our courier partners (BlueDart, Delhivery, or Speed Post).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">4. Shipping Charges</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                Shipping charges for Prasad are usually inclusive in the service price displayed on Mandirlok, unless specified otherwise during checkout.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">5. Address Accuracy</h2>
              <p className="text-sm text-[#6b5b45] leading-relaxed">
                Devotees are requested to ensure the shipping address provided is accurate and complete with a landmark. Mandirlok is not responsible for non-delivery due to incorrect address information.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl text-[#1a0500] mb-3">6. Contact Us</h2>
              <p className="text-sm text-[#6b5b45]">
                For tracking queries or delivery issues, please{" "}
                <Link href="/contact" className="text-[#ff7f0a] hover:underline font-medium">contact our delivery support team</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

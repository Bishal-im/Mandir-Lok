"use client";

import { useState, useEffect } from "react";
import {
    Layout,
    Bell,
    Shield,
    Globe,
    IndianRupee,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon
} from "lucide-react";
import { getSettings, updateSettings } from "@/lib/actions/admin";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [slides, setSlides] = useState<any[]>([]);
    const [dashboardSettings, setDashboardSettings] = useState({
        bannerUrl: "",
        welcomeMessage: "Welcome to your Divine Journey"
    });
    const [logoUrl, setLogoUrl] = useState("");
    const [pageBanners, setPageBanners] = useState({
        poojas: "",
        chadhava: "",
        temples: ""
    });
    const [aartiSettings, setAartiSettings] = useState<{ deities: any[] }>({
        deities: []
    });

    const tabs = [
        { id: "general", label: "General", icon: <Globe size={18} /> },
        { id: "landing", label: "Landing Page", icon: <Layout size={18} /> },
        { id: "page_banners", label: "Page Banners", icon: <ImageIcon size={18} /> },
        { id: "user_dashboard", label: "User Dashboard", icon: <Layout size={18} /> },
        { id: "aarti", label: "Aarti Settings", icon: <Layout size={18} /> },
        { id: "payments", label: "Payments", icon: <IndianRupee size={18} /> },
    ];

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            const [slideRes, dashRes, bannerRes, logoRes, aartiRes] = await Promise.all([
                getSettings("landing_page_slides"),
                getSettings("dashboard_settings"),
                getSettings("page_banners"),
                getSettings("website_logo"),
                getSettings("aarti_settings")
            ]);

            if (slideRes && slideRes.value) setSlides(slideRes.value);
            if (dashRes && dashRes.value) setDashboardSettings(dashRes.value);
            if (bannerRes && bannerRes.value) setPageBanners(bannerRes.value);
            if (logoRes && logoRes.value) setLogoUrl(logoRes.value);
            if (aartiRes && aartiRes.value) {
                setAartiSettings(aartiRes.value);
            } else {
                // Pre-populate with defaults if empty
                setAartiSettings({
                    deities: [
                        { id: "shiva", name: "Shiv ji", image: "/images/aarti/shiva.png" },
                        { id: "vishnu", name: "Vishnu ji", image: "/images/aarti/vishnu.png" },
                        { id: "ganesha", name: "Ganesh ji", image: "/images/aarti/ganesha.png" },
                        { id: "devi", name: "Durga Maa", image: "/images/aarti/durga.png" },
                    ]
                });
            }

            setLoading(false);
        }
        fetchSettings();
    }, []);

    const handleAddSlide = () => {
        setSlides([...slides, { src: "", title: "", subtitle: "", cta: "Book Now", ctaLink: "/poojas", secondary: "Learn More", secondaryLink: "/about" }]);
    };

    const handleRemoveSlide = (index: number) => {
        setSlides(slides.filter((_, i) => i !== index));
    };

    const handleUpdateSlide = (index: number, field: string, value: string) => {
        const newSlides = [...slides];
        newSlides[index][field] = value;
        setSlides(newSlides);
    };

    const handleAddDeity = () => {
        const newDeity = {
            id: `deity_${Date.now()}`,
            name: "New Deity",
            image: "",
        };
        setAartiSettings({ ...aartiSettings, deities: [...aartiSettings.deities, newDeity] });
    };

    const handleRemoveDeity = (index: number) => {
        const newDeities = [...aartiSettings.deities];
        newDeities.splice(index, 1);
        setAartiSettings({ ...aartiSettings, deities: newDeities });
    };

    const handleUpdateDeity = (index: number, field: string, value: any) => {
        const newDeities = [...aartiSettings.deities];
        newDeities[index] = { ...newDeities[index], [field]: value };
        setAartiSettings({ ...aartiSettings, deities: newDeities });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeTab === "landing") {
                await updateSettings("landing_page_slides", slides, "Banner slides for the landing page");
            } else if (activeTab === "user_dashboard") {
                await updateSettings("dashboard_settings", dashboardSettings, "Banner and welcome info for user dashboard");
            } else if (activeTab === "page_banners") {
                await updateSettings("page_banners", pageBanners, "Background images for Poojas and Chadhava banners");
            } else if (activeTab === "general") {
                await updateSettings("website_logo", logoUrl, "Website main logo URL");
            } else if (activeTab === "aarti") {
                await updateSettings("aarti_settings", aartiSettings, "Aarti page configurations");
            }
            alert("Settings saved successfully!");
        } catch (err) {
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Admin Settings</h2>
                    <p className="text-sm text-gray-500">Global configurations for Mandirlok platform.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Side Tabs */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? "bg-[#ff7f0a] text-white shadow-lg shadow-orange-100" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                                }`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Settings Form */}
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
                    {loading ? (
                        <div className="text-center py-20 opacity-50">Loading configurations...</div>
                    ) : (
                        <>
                            {activeTab === "general" && (
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Platform Name</label>
                                        <input defaultValue="Mandirlok" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Support Email</label>
                                        <input defaultValue="support@mandirlok.com" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Website Logo URL</label>
                                        <input
                                            value={logoUrl}
                                            onChange={(e) => setLogoUrl(e.target.value)}
                                            placeholder="https://cloudinary.com/..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                        />
                                        {logoUrl && (
                                            <div className="mt-2 p-4 bg-gray-50 rounded-xl inline-block border border-gray-100">
                                                <img src={logoUrl} alt="Logo Preview" className="h-10 object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Default Commission (%)</label>
                                        <input type="number" defaultValue="20" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                                    </div>
                                </div>
                            )}

                            {activeTab === "landing" && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Landing Page Hero Slides</h3>
                                            <p className="text-xs text-gray-500">Manage the images and text on your homepage banner.</p>
                                        </div>
                                        <button
                                            onClick={handleAddSlide}
                                            className="p-2 bg-orange-50 text-[#ff7f0a] rounded-lg hover:bg-orange-100 transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {slides.map((slide, index) => (
                                            <div key={index} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4 relative group">
                                                <button
                                                    onClick={() => handleRemoveSlide(index)}
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Image URL</label>
                                                        <div className="relative">
                                                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                            <input
                                                                value={slide.src}
                                                                onChange={(e) => handleUpdateSlide(index, "src", e.target.value)}
                                                                placeholder="https://..."
                                                                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Slide Title</label>
                                                        <input
                                                            value={slide.title}
                                                            onChange={(e) => handleUpdateSlide(index, "title", e.target.value)}
                                                            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subtitle Text</label>
                                                    <textarea
                                                        value={slide.subtitle}
                                                        onChange={(e) => handleUpdateSlide(index, "subtitle", e.target.value)}
                                                        rows={2}
                                                        className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Primary Button</label>
                                                        <input
                                                            value={slide.cta}
                                                            onChange={(e) => handleUpdateSlide(index, "cta", e.target.value)}
                                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Primary Link</label>
                                                        <input
                                                            value={slide.ctaLink}
                                                            onChange={(e) => handleUpdateSlide(index, "ctaLink", e.target.value)}
                                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-400"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Secondary Button</label>
                                                        <input
                                                            value={slide.secondary}
                                                            onChange={(e) => handleUpdateSlide(index, "secondary", e.target.value)}
                                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Secondary Link</label>
                                                        <input
                                                            value={slide.secondaryLink}
                                                            onChange={(e) => handleUpdateSlide(index, "secondaryLink", e.target.value)}
                                                            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {slides.length === 0 && (
                                            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 flex flex-col items-center gap-2">
                                                <Layout size={32} />
                                                <p className="text-sm">No slides added. Home page will use default content.</p>
                                                <button onClick={handleAddSlide} className="text-[#ff7f0a] font-bold text-xs hover:underline">Add First Slide</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "page_banners" && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-900">Frontend Page Banners</h3>
                                    <p className="text-xs text-gray-500">Set the background images for the main banners on high-traffic pages.</p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Poojas Page Banner</label>
                                            <input
                                                value={pageBanners.poojas}
                                                onChange={e => setPageBanners({ ...pageBanners, poojas: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
                                                placeholder="https://..."
                                            />
                                            {pageBanners.poojas && (
                                                <div className="rounded-xl overflow-hidden aspect-video border border-gray-100 shadow-sm">
                                                    <img src={pageBanners.poojas} className="w-full h-full object-cover" alt="Poojas Banner Preview" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chadhava Page Banner</label>
                                            <input
                                                value={pageBanners.chadhava}
                                                onChange={e => setPageBanners({ ...pageBanners, chadhava: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
                                                placeholder="https://..."
                                            />
                                            {pageBanners.chadhava && (
                                                <div className="rounded-xl overflow-hidden aspect-video border border-gray-100 shadow-sm">
                                                    <img src={pageBanners.chadhava} className="w-full h-full object-cover" alt="Chadhava Banner Preview" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Temples Page Banner</label>
                                            <input
                                                value={pageBanners.temples}
                                                onChange={e => setPageBanners({ ...pageBanners, temples: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
                                                placeholder="https://..."
                                            />
                                            {pageBanners.temples && (
                                                <div className="rounded-xl overflow-hidden aspect-video border border-gray-100 shadow-sm">
                                                    <img src={pageBanners.temples} className="w-full h-full object-cover" alt="Temples Banner Preview" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "user_dashboard" && (
                                <div className="space-y-6">
                                    <h3 className="font-bold text-gray-900">User Dashboard Visuals</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400">Banner Image URL</label>
                                            <input
                                                value={dashboardSettings.bannerUrl}
                                                onChange={e => setDashboardSettings({ ...dashboardSettings, bannerUrl: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400">Welcome Message</label>
                                            <input
                                                value={dashboardSettings.welcomeMessage}
                                                onChange={e => setDashboardSettings({ ...dashboardSettings, welcomeMessage: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                            />
                                        </div>
                                        {dashboardSettings.bannerUrl && (
                                            <div className="mt-4 rounded-2xl overflow-hidden aspect-[4/1] border border-gray-100">
                                                <img src={dashboardSettings.bannerUrl} className="w-full h-full object-cover" alt="Banner Preview" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "aarti" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-orange-100 text-[#ff7f0a] rounded-lg">
                                                <ImageIcon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Aarti Page Settings</h3>
                                                <p className="text-xs text-gray-500">Manage interactive elements for the virtual Aarti page.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAddDeity}
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-xs hover:bg-orange-700 transition-all"
                                        >
                                            <Plus size={16} /> Add Deity
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {aartiSettings.deities.map((deity, idx) => (
                                            <div key={deity.id || idx} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-6 relative group">
                                                <button
                                                    onClick={() => handleRemoveDeity(idx)}
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">God Name</label>
                                                            <input
                                                                value={deity.name}
                                                                onChange={(e) => handleUpdateDeity(idx, "name", e.target.value)}
                                                                placeholder="e.g. Shiv ji"
                                                                className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deity Portrait</label>
                                                            <div className="flex items-center gap-4">
                                                                <CloudinaryImageUploader
                                                                    onUploadSuccess={(url) => handleUpdateDeity(idx, "image", url)}
                                                                    folder="aarti_deities"
                                                                    label="Upload Portrait"
                                                                />
                                                                {deity.image && (
                                                                    <img src={deity.image} alt="Portrait" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "payments" && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <IndianRupee size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Payment Configuration</h3>
                                            <p className="text-xs text-gray-500">Manage Razorpay keys and platform commission.</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <h4 className="text-sm font-bold text-gray-700">Razorpay Integration</h4>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Key ID</label>
                                                <input
                                                    readOnly
                                                    value={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_..."}
                                                    className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white font-mono"
                                                />
                                                <p className="text-[10px] text-gray-400 italic">Managed via environment variables for security.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <h4 className="text-sm font-bold text-gray-700">Platform Commission</h4>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default Commission (%)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        defaultValue="20"
                                                        className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 italic">This % will be deducted before Pandit payout.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30">
                                        <h4 className="text-sm font-bold text-blue-800 mb-2">Payout Policy</h4>
                                        <p className="text-xs text-blue-600 leading-relaxed">
                                            Pandits can request a payout once their balance exceeds ₹500.
                                            Payouts are processed within 2-3 business days.
                                            Platform commission is calculated on the total order amount (Pooja + Chadhava).
                                        </p>
                                    </div>
                                </div>
                            )}



                            <div className="pt-6 border-t border-gray-50 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3 bg-[#ff7f0a] text-white rounded-xl font-bold shadow-lg shadow-orange-100 hover:-translate-y-0.5 transition-all text-sm font-display disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : <><Save size={18} /> Save Preferences</>}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

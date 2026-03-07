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
    RefreshCcw,
    Image as ImageIcon
} from "lucide-react";
import { getSettings, updateSettings } from "@/lib/actions/admin";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";

export default function SettingsPage() {
    const [marqueeItems, setMarqueeItems] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchingRate, setFetchingRate] = useState(false);
    const [exchangeRate, setExchangeRate] = useState<number>(83);

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
    const [contactSettings, setContactSettings] = useState({
        bannerUrl: "",
        heroTitle: "How can we help you?",
        heroSubtitle: "Our team is here to help you with bookings, payment issues, or any queries about our poojas and services.",
        supportEmail: "support@mandirlok.com",
        phone: "+91 98765 43210",
        address: "Mandirlok Technologies, India",
        workingHours: "Mon – Sat, 9:00 AM – 7:00 PM IST"
    });
    const [aboutSettings, setAboutSettings] = useState({
        bannerUrl: "",
        heroTitle: "About Mandirlok",
        heroSubtitle: "India's growing platform for authentic temple rituals.",
        missionTitle: "Committed to Building the Most Trusted Devotional Platform",
        missionDescription1: "",
        missionDescription2: "",
        missionImage: "",
        foundedYear: "2020",
        templesCount: "500+",
        panditsCount: "1,200+",
        devoteesCount: "1M+"
    });

    const tabs = [
        { id: "general", label: "General", icon: <Globe size={18} /> },
        { id: "landing", label: "Landing Page", icon: <Layout size={18} /> },
        { id: "marquee", label: "Marquee", icon: <Layout size={18} /> }, // New Tab
        { id: "page_banners", label: "Page Banners", icon: <ImageIcon size={18} /> },
        { id: "user_dashboard", label: "User Dashboard", icon: <Layout size={18} /> },
        { id: "aarti", label: "Aarti Settings", icon: <Layout size={18} /> },
        { id: "contact", label: "Contact Settings", icon: <Bell size={18} /> },
        { id: "about", label: "About Us", icon: <Layout size={18} /> },
        { id: "payments", label: "Payments", icon: <IndianRupee size={18} /> },
        { id: "currency", label: "Currency", icon: <Globe size={18} /> },
    ];

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            const [slideRes, dashRes, bannerRes, logoRes, aartiRes, contactRes, aboutRes, marqueeRes, rateRes] = await Promise.all([
                getSettings("landing_page_slides"),
                getSettings("dashboard_settings"),
                getSettings("page_banners"),
                getSettings("website_logo"),
                getSettings("aarti_settings"),
                getSettings("contact_settings"),
                getSettings("about_settings"),
                getSettings("homepage_marquee_items"),
                getSettings("usd_exchange_rate")
            ]);

            if (slideRes && slideRes.value) setSlides(slideRes.value);
            if (marqueeRes && marqueeRes.value) setMarqueeItems(marqueeRes.value);
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
            if (contactRes && contactRes.value) setContactSettings(prev => ({ ...prev, ...contactRes.value }));
            if (aboutRes && aboutRes.value) setAboutSettings(prev => ({ ...prev, ...aboutRes.value }));
            if (rateRes && rateRes.value) setExchangeRate(Number(rateRes.value));

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

    const handleAddMarqueeItem = () => {
        setMarqueeItems([...marqueeItems, { icon: "Zap", label: "New Item" }]);
    };

    const handleRemoveMarqueeItem = (index: number) => {
        setMarqueeItems(marqueeItems.filter((_, i) => i !== index));
    };

    const handleUpdateMarqueeItem = (index: number, field: string, value: string) => {
        const newItems = [...marqueeItems];
        newItems[index][field] = value;
        setMarqueeItems(newItems);
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

    const fetchLatestRate = async () => {
        setFetchingRate(true);
        try {
            const res = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
            const data = await res.json();
            if (data && data.rates && data.rates.USD) {
                // The API gives 1 INR = X USD. We want 1 USD = X INR.
                const oneInrInUsd = data.rates.USD;
                const oneUsdInInr = 1 / oneInrInUsd;
                setExchangeRate(Number(oneUsdInInr.toFixed(2)));
                alert(`Latest rate fetched: 1 USD = ₹${oneUsdInInr.toFixed(2)}`);
            } else {
                throw new Error("Invalid data format");
            }
        } catch (err) {
            console.error("Failed to fetch exchange rate:", err);
            alert("Failed to fetch latest rate. Please enter it manually.");
        } finally {
            setFetchingRate(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeTab === "landing") {
                await updateSettings("landing_page_slides", slides, "Banner slides for the landing page");
            } else if (activeTab === "marquee") {
                await updateSettings("homepage_marquee_items", marqueeItems, "Scrolling marquee items on homepage");
            } else if (activeTab === "user_dashboard") {
                await updateSettings("dashboard_settings", dashboardSettings, "Banner and welcome info for user dashboard");
            } else if (activeTab === "page_banners") {
                await updateSettings("page_banners", pageBanners, "Background images for Poojas and Chadhava banners");
            } else if (activeTab === "general") {
                await updateSettings("website_logo", logoUrl, "Website main logo URL");
            } else if (activeTab === "aarti") {
                await updateSettings("aarti_settings", aartiSettings, "Aarti page configurations");
            } else if (activeTab === "contact") {
                await updateSettings("contact_settings", contactSettings, "Contact Us page configurations");
            } else if (activeTab === "about") {
                await updateSettings("about_settings", aboutSettings, "About Us page configurations");
            } else if (activeTab === "currency") {
                await updateSettings("usd_exchange_rate", exchangeRate, "USD to INR Exchange Rate");
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
                                        <div className="flex gap-2">
                                            <input
                                                value={logoUrl}
                                                onChange={(e) => setLogoUrl(e.target.value)}
                                                placeholder="https://cloudinary.com/..."
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200"
                                            />
                                            <CloudinaryImageUploader 
                                                onUploadSuccess={(url) => setLogoUrl(url)}
                                                folder="branding"
                                                label="Upload Logo"
                                            />
                                        </div>
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

                            {activeTab === "marquee" && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Homepage Marquee Items</h3>
                                            <p className="text-xs text-gray-500">Manage moving text items on the landing page.</p>
                                        </div>
                                        <button
                                            onClick={handleAddMarqueeItem}
                                            className="p-2 bg-orange-50 text-[#ff7f0a] rounded-lg hover:bg-orange-100 transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {marqueeItems.map((item, index) => (
                                            <div key={index} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center gap-4 relative group">
                                                <div className="grid grid-cols-2 gap-4 flex-1">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lucide Icon Name</label>
                                                        <input
                                                            value={item.icon}
                                                            onChange={(e) => handleUpdateMarqueeItem(index, "icon", e.target.value)}
                                                            placeholder="Zap, Heart, Shield, etc."
                                                            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Label Text</label>
                                                        <input
                                                            value={item.label}
                                                            onChange={(e) => handleUpdateMarqueeItem(index, "label", e.target.value)}
                                                            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMarqueeItem(index)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}

                                        {marqueeItems.length === 0 && (
                                            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400">
                                                <p className="text-sm">No items added. Homepage will use default marquee.</p>
                                            </div>
                                        )}
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
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                <input
                                                                    value={slide.src}
                                                                    onChange={(e) => handleUpdateSlide(index, "src", e.target.value)}
                                                                    placeholder="https://..."
                                                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200"
                                                                />
                                                            </div>
                                                            <CloudinaryImageUploader 
                                                                onUploadSuccess={(url) => handleUpdateSlide(index, "src", url)}
                                                                folder="landing_banners"
                                                                label="Upload"
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
                                            <div className="flex gap-2">
                                                <input
                                                    value={pageBanners.poojas}
                                                    onChange={e => setPageBanners({ ...pageBanners, poojas: e.target.value })}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white"
                                                    placeholder="https://..."
                                                />
                                                <CloudinaryImageUploader 
                                                    onUploadSuccess={(url) => setPageBanners({ ...pageBanners, poojas: url })}
                                                    folder="banners"
                                                    label="Upload"
                                                />
                                            </div>
                                            {pageBanners.poojas && (
                                                <div className="rounded-xl overflow-hidden aspect-video border border-gray-100 shadow-sm">
                                                    <img src={pageBanners.poojas} className="w-full h-full object-cover" alt="Poojas Banner Preview" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chadhava Page Banner</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={pageBanners.chadhava}
                                                    onChange={e => setPageBanners({ ...pageBanners, chadhava: e.target.value })}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white"
                                                    placeholder="https://..."
                                                />
                                                <CloudinaryImageUploader 
                                                    onUploadSuccess={(url) => setPageBanners({ ...pageBanners, chadhava: url })}
                                                    folder="banners"
                                                    label="Upload"
                                                />
                                            </div>
                                            {pageBanners.chadhava && (
                                                <div className="rounded-xl overflow-hidden aspect-video border border-gray-100 shadow-sm">
                                                    <img src={pageBanners.chadhava} className="w-full h-full object-cover" alt="Chadhava Banner Preview" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Temples Page Banner</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={pageBanners.temples}
                                                    onChange={e => setPageBanners({ ...pageBanners, temples: e.target.value })}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white"
                                                    placeholder="https://..."
                                                />
                                                <CloudinaryImageUploader 
                                                    onUploadSuccess={(url) => setPageBanners({ ...pageBanners, temples: url })}
                                                    folder="banners"
                                                    label="Upload"
                                                />
                                            </div>
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
                                            <div className="flex gap-2">
                                                <input
                                                    value={dashboardSettings.bannerUrl}
                                                    onChange={e => setDashboardSettings({ ...dashboardSettings, bannerUrl: e.target.value })}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200"
                                                    placeholder="https://..."
                                                />
                                                <CloudinaryImageUploader 
                                                    onUploadSuccess={(url) => setDashboardSettings({ ...dashboardSettings, bannerUrl: url })}
                                                    folder="dashboard"
                                                    label="Upload"
                                                />
                                            </div>
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

                            {activeTab === "contact" && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Bell size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Contact Us Settings</h3>
                                            <p className="text-xs text-gray-500">Manage banner and contact info for the support page.</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Banner Image</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={contactSettings.bannerUrl}
                                                    onChange={e => setContactSettings({ ...contactSettings, bannerUrl: e.target.value })}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white"
                                                    placeholder="https://..."
                                                />
                                                <CloudinaryImageUploader 
                                                    onUploadSuccess={(url) => setContactSettings({ ...contactSettings, bannerUrl: url })}
                                                    folder="banners"
                                                    label="Upload"
                                                />
                                            </div>
                                            {contactSettings.bannerUrl && (
                                                <div className="rounded-xl overflow-hidden aspect-video border border-gray-100 shadow-sm">
                                                    <img src={contactSettings.bannerUrl} className="w-full h-full object-cover" alt="Contact Banner Preview" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-6 flex flex-col justify-center">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hero Title</label>
                                                <input 
                                                    value={contactSettings.heroTitle}
                                                    onChange={e => setContactSettings({ ...contactSettings, heroTitle: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hero Subtitle</label>
                                                <textarea 
                                                    value={contactSettings.heroSubtitle}
                                                    onChange={e => setContactSettings({ ...contactSettings, heroSubtitle: e.target.value })}
                                                    rows={2}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Support Email (Recipient)</label>
                                            <input 
                                                value={contactSettings.supportEmail}
                                                onChange={e => setContactSettings({ ...contactSettings, supportEmail: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono" 
                                            />
                                            <p className="text-[10px] text-gray-400 italic">User submissions will be sent to this email.</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone / WhatsApp</label>
                                            <input 
                                                value={contactSettings.phone}
                                                onChange={e => setContactSettings({ ...contactSettings, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Office Address</label>
                                            <input 
                                                value={contactSettings.address}
                                                onChange={e => setContactSettings({ ...contactSettings, address: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Working Hours</label>
                                            <input 
                                                value={contactSettings.workingHours}
                                                onChange={e => setContactSettings({ ...contactSettings, workingHours: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "about" && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <Layout size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">About Us Page Settings</h3>
                                            <p className="text-xs text-gray-500">Manage your company story, mission, and key metrics.</p>
                                        </div>
                                    </div>

                                    {/* Hero Section */}
                                    <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-gray-50">
                                        <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hero Banner</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={aboutSettings.bannerUrl}
                                                    onChange={e => setAboutSettings({ ...aboutSettings, bannerUrl: e.target.value })}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm"
                                                    placeholder="Banner URL"
                                                />
                                                <CloudinaryImageUploader 
                                                    onUploadSuccess={(url) => setAboutSettings({ ...aboutSettings, bannerUrl: url })}
                                                    folder="banners"
                                                    label="Upload"
                                                />
                                            </div>
                                            {aboutSettings.bannerUrl && (
                                                <div className="rounded-xl overflow-hidden aspect-video border border-gray-100 shadow-sm">
                                                    <img src={aboutSettings.bannerUrl} className="w-full h-full object-cover" alt="Hero Preview" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hero Title</label>
                                                <input 
                                                    value={aboutSettings.heroTitle}
                                                    onChange={e => setAboutSettings({ ...aboutSettings, heroTitle: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hero Subtitle</label>
                                                <textarea 
                                                    value={aboutSettings.heroSubtitle}
                                                    onChange={e => setAboutSettings({ ...aboutSettings, heroSubtitle: e.target.value })}
                                                    rows={2}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none text-sm" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mission Section */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Mission & Story</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-400">Mission Title</label>
                                                    <input 
                                                        value={aboutSettings.missionTitle}
                                                        onChange={e => setAboutSettings({ ...aboutSettings, missionTitle: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200" 
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-400">Mission Image</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={aboutSettings.missionImage}
                                                            onChange={e => setAboutSettings({ ...aboutSettings, missionImage: e.target.value })}
                                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm"
                                                            placeholder="Image URL"
                                                        />
                                                        <CloudinaryImageUploader 
                                                            onUploadSuccess={(url) => setAboutSettings({ ...aboutSettings, missionImage: url })}
                                                            folder="about"
                                                            label="Upload"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-400">Story Paragraph 1</label>
                                                    <textarea 
                                                        value={aboutSettings.missionDescription1}
                                                        onChange={e => setAboutSettings({ ...aboutSettings, missionDescription1: e.target.value })}
                                                        rows={3}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none text-sm" 
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-gray-400">Story Paragraph 2</label>
                                                    <textarea 
                                                        value={aboutSettings.missionDescription2}
                                                        onChange={e => setAboutSettings({ ...aboutSettings, missionDescription2: e.target.value })}
                                                        rows={3}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none text-sm" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
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

                            {activeTab === "currency" && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Currency & Exchange Rate</h3>
                                            <p className="text-xs text-gray-500">Manage the conversion rate between INR and USD.</p>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-6">
                                        <div className="max-w-md space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">USD to INR Exchange Rate</label>
                                                <div className="flex gap-3">
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                        <input 
                                                            type="number" 
                                                            step="0.01"
                                                            value={exchangeRate}
                                                            onChange={(e) => setExchangeRate(Number(e.target.value))}
                                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-900" 
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={fetchLatestRate}
                                                        disabled={fetchingRate}
                                                        className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all disabled:opacity-50"
                                                    >
                                                        {fetchingRate ? <RefreshCcw size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                                                        Auto-Fetch
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-400 italic">Current Value: 1 USD = ₹{exchangeRate}</p>
                                            </div>

                                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                                <h4 className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-2">
                                                    <Layout size={14} /> How it works
                                                </h4>
                                                <p className="text-[11px] text-amber-700 leading-relaxed">
                                                    All prices in the database are stored in INR. When a user outside India visits the site, prices are converted to USD using this specific rate. 
                                                    Changing this value will update all prices for international users instantly.
                                                </p>
                                            </div>
                                        </div>
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

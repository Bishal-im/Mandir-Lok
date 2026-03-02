'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Video, FileText, CheckCircle, Upload, X, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2>(1)
    const [whatsapp, setWhatsapp] = useState('')
    const [countryCode, setCountryCode] = useState('91')
    const [aadhaarUrl, setAadhaarUrl] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault()
        if (whatsapp.length < 10) {
            setError('Please enter a valid mobile number')
            return
        }
        setError('')
        setStep(2)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setUploadProgress(0)
        setError('')

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset!)

        try {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, true)

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100)
                    setUploadProgress(percent)
                }
            }

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText)
                    setAadhaarUrl(response.secure_url)
                    setIsUploading(false)
                } else {
                    setError('Upload failed. Please try again.')
                    setIsUploading(false)
                }
            }
            xhr.send(formData)
        } catch {
            setError('Upload error occurred.')
            setIsUploading(false)
        }
    }

    const handleSubmit = async () => {
        if (!aadhaarUrl) {
            setError('Please upload your Aadhaar card')
            return
        }

        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/pandit/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    whatsapp: `+${countryCode}${whatsapp}`,
                    aadhaarCardUrl: aadhaarUrl,
                }),
            })
            const data = await res.json()
            if (data.success) {
                router.refresh()
                router.push('/pandit/dashboard')
            } else {
                setError(data.message || 'Failed to save details')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#fdf6ee] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl font-bold text-[#1a1209]">Complete Profile</h1>
                    <p className="text-[#6b5b45] text-sm mt-1">We need a few more details to get you started</p>
                </div>

                <div className="bg-white border border-[#f0dcc8] rounded-2xl shadow-card p-8 animate-in zoom-in-95 duration-200">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 mx-auto">
                                    <Video size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-[#1a1209]">WhatsApp Number</h2>
                                <p className="text-xs text-[#6b5b45] mt-1">For pooja notifications and updates</p>
                            </div>

                            <form onSubmit={handleStep1} className="space-y-4">
                                <div className="flex gap-2">
                                    <select
                                        value={countryCode}
                                        onChange={e => setCountryCode(e.target.value)}
                                        className="px-2 py-2 bg-[#fff8f0] border border-[#f0dcc8] rounded-xl text-[#6b5b45] text-xs font-medium outline-none"
                                    >
                                        {/* South Asia - Most common */}
                                        <option value="91">+91 🇮🇳 India</option>
                                        <option value="977">+977 🇳🇵 Nepal</option>
                                        <option value="92">+92 🇵🇰 Pakistan</option>
                                        <option value="880">+880 🇧🇩 Bangladesh</option>
                                        <option value="94">+94 🇱🇰 Sri Lanka</option>
                                        <option value="975">+975 🇧🇹 Bhutan</option>
                                        <option value="960">+960 🇲🇻 Maldives</option>
                                        <option disabled>──────────</option>
                                        {/* Middle East */}
                                        <option value="971">+971 🇦🇪 UAE</option>
                                        <option value="966">+966 🇸🇦 Saudi Arabia</option>
                                        <option value="974">+974 🇶🇦 Qatar</option>
                                        <option value="965">+965 🇰🇼 Kuwait</option>
                                        <option value="968">+968 🇴🇲 Oman</option>
                                        <option value="973">+973 🇧🇭 Bahrain</option>
                                        <option value="972">+972 🇮🇱 Israel</option>
                                        <option disabled>──────────</option>
                                        {/* East / Southeast Asia */}
                                        <option value="1">+1 🇺🇸 USA / Canada</option>
                                        <option value="44">+44 🇬🇧 UK</option>
                                        <option value="61">+61 🇦🇺 Australia</option>
                                        <option value="64">+64 🇳🇿 New Zealand</option>
                                        <option disabled>──────────</option>
                                        <option value="86">+86 🇨🇳 China</option>
                                        <option value="81">+81 🇯🇵 Japan</option>
                                        <option value="82">+82 🇰🇷 South Korea</option>
                                        <option value="65">+65 🇸🇬 Singapore</option>
                                        <option value="60">+60 🇲🇾 Malaysia</option>
                                        <option value="62">+62 🇮🇩 Indonesia</option>
                                        <option value="63">+63 🇵🇭 Philippines</option>
                                        <option value="66">+66 🇹🇭 Thailand</option>
                                        <option value="84">+84 🇻🇳 Vietnam</option>
                                        <option disabled>──────────</option>
                                        {/* Europe */}
                                        <option value="49">+49 🇩🇪 Germany</option>
                                        <option value="33">+33 🇫🇷 France</option>
                                        <option value="39">+39 🇮🇹 Italy</option>
                                        <option value="34">+34 🇪🇸 Spain</option>
                                        <option value="31">+31 🇳🇱 Netherlands</option>
                                        <option value="41">+41 🇨🇭 Switzerland</option>
                                        <option value="46">+46 🇸🇪 Sweden</option>
                                        <option value="47">+47 🇳🇴 Norway</option>
                                        <option value="45">+45 🇩🇰 Denmark</option>
                                        <option value="32">+32 🇧🇪 Belgium</option>
                                        <option value="48">+48 🇵🇱 Poland</option>
                                        <option value="7">+7 🇷🇺 Russia</option>
                                        <option disabled>──────────</option>
                                        {/* Africa */}
                                        <option value="27">+27 🇿🇦 South Africa</option>
                                        <option value="234">+234 🇳🇬 Nigeria</option>
                                        <option value="254">+254 🇰🇪 Kenya</option>
                                        <option value="20">+20 🇪🇬 Egypt</option>
                                        <option disabled>──────────</option>
                                        {/* Americas */}
                                        <option value="55">+55 🇧🇷 Brazil</option>
                                        <option value="52">+52 🇲🇽 Mexico</option>
                                        <option value="54">+54 🇦🇷 Argentina</option>
                                        <option value="57">+57 🇨🇴 Colombia</option>
                                    </select>
                                    <input
                                        type="tel"
                                        value={whatsapp}
                                        onChange={e => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="WhatsApp Number"
                                        className="input-divine flex-1"
                                        maxLength={10}
                                        required
                                    />
                                </div>
                                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                                <button type="submit" className="btn-saffron w-full py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/20">
                                    Next Step
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 mx-auto">
                                    <FileText size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-[#1a1209]">Aadhaar Card</h2>
                                <p className="text-xs text-[#6b5b45] mt-1">Upload identity document for verification</p>
                            </div>

                            <div className="space-y-4">
                                {!aadhaarUrl && !isUploading ? (
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Direct Upload</p>
                                        <label className="cursor-pointer flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all border border-blue-100">
                                            <Upload size={14} /> Upload Aadhaar Image
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                ) : isUploading ? (
                                    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="flex items-center gap-2 text-gray-600 font-medium">
                                                <Loader2 size={12} className="animate-spin text-blue-600" />
                                                Uploading Image...
                                            </span>
                                            <span className="text-blue-600 font-bold">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-[#f0dcc8] shadow-inner">
                                        <img src={aadhaarUrl} alt="Aadhaar Card" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setAadhaarUrl('')}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white py-1.5 text-[10px] text-center font-bold">
                                            ✓ UPLOADED SUCCESSFULLY
                                        </div>
                                    </div>
                                )}

                                {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-4 text-[#6b5b45] font-bold border border-[#f0dcc8] rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || isUploading}
                                        className="btn-saffron flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle size={18} />
                                                Complete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

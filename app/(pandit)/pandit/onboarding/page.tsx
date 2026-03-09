'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Video, FileText, CheckCircle, Upload, X, Loader2 } from 'lucide-react'
import { COUNTRIES } from '@/lib/countries'

// Parse a stored phone string (e.g. "+9779860804988" or "+91+9779860804988") into
// { code: '977', local: '9860804988' } by matching the longest known country code.
function parseStoredPhone(stored: string): { code: string; local: string } {
  // Strip all non-digit characters to get the raw digit string
  const digits = stored.replace(/\D/g, '')
  // Collect only entries that have a valid string code (exclude dividers)
  const validCodes: string[] = COUNTRIES
    .map(c => c.code)
    .filter((code): code is string => typeof code === 'string' && code.length > 0)
  // Sort longest-first so we match greedily (e.g. 977 before 9)
  validCodes.sort((a, b) => b.length - a.length)
  for (const code of validCodes) {
    if (digits.startsWith(code)) {
      return { code, local: digits.slice(code.length) }
    }
  }
  // Fallback: return digits as-is with default India code
  return { code: '91', local: digits }
}

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2>(1)
    const [whatsapp, setWhatsapp] = useState('')
    const [countryCode, setCountryCode] = useState('91')
    const [aadhaarUrl, setAadhaarUrl] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isCheckingProfile, setIsCheckingProfile] = useState(true)
    const [error, setError] = useState('')

    // Fetch profile to see if Step 1 can be skipped
    useEffect(() => {
        const checkProfile = async () => {
            try {
                const res = await fetch('/api/pandit/me')
                const data = await res.json()
                if (data.success && data.data.whatsapp) {
                    const parsed = parseStoredPhone(data.data.whatsapp)
                    setCountryCode(parsed.code)
                    setWhatsapp(parsed.local)
                    setStep(2)
                }
            } catch (err) {
                console.error("Failed to fetch profile", err)
            } finally {
                setIsCheckingProfile(false)
            }
        }
        checkProfile()
    }, [])

    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault()
        if (whatsapp.length < 7) {
            setError('Please enter a valid mobile number (at least 7 digits)')
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
                    {isCheckingProfile ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                            <p className="text-sm text-[#6b5b45]">Setting up your profile...</p>
                        </div>
                    ) : step === 1 ? (
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
                                        {COUNTRIES.map((c, i) => (
                                            c.divider ? (
                                                <option key={`divider-${i}`} disabled>──────────</option>
                                            ) : (
                                                <option key={c.code} value={c.code}>
                                                    +{c.code} {c.flag} {c.name}
                                                </option>
                                            )
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        value={whatsapp}
                                        onChange={e => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 15))}
                                        placeholder="WhatsApp Number"
                                        className="input-divine flex-1"
                                        maxLength={15}
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

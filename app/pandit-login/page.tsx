'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { COUNTRIES } from '@/lib/countries'

export default function PanditLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [panditId, setPanditId] = useState('')
  const [step, setStep] = useState<'identifier' | 'otp' | 'phone_setup'>('identifier')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState('91')
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('91')
  const [hasCheckedSession, setHasCheckedSession] = useState(false)

  // Restore session if interrupted
  useEffect(() => {
    const savedStep = sessionStorage.getItem('pandit_login_step')
    const savedId = sessionStorage.getItem('pandit_id')
    const savedPhoneCC = sessionStorage.getItem('pandit_phone_cc')
    const savedWaCC = sessionStorage.getItem('pandit_wa_cc')
    if (savedStep === 'phone_setup' && savedId) {
      setStep('phone_setup')
      setPanditId(savedId)
      if (savedPhoneCC) setPhoneCountryCode(savedPhoneCC)
      if (savedWaCC) setWhatsappCountryCode(savedWaCC)
    }
    setHasCheckedSession(true)
  }, [])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setError('')
    setLoading(true)
    try {
      console.log('[Send OTP] Fetching /api/pandit/auth/send-otp...')
      const res = await fetch('/api/pandit/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('otp')
        setSuccess(data.message || `OTP sent to your registered Email`)
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setError('')
    setLoading(true)
    try {
      console.log('[Verify OTP] Fetching /api/pandit/auth/verify-otp...')
      const res = await fetch('/api/pandit/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp
        }),
      })
      const data = await res.json()
      if (data.success) {
        // Refresh router to ensure cookie is recognized
        router.refresh()

        if (data.needsPhoneUpdate) {
          console.log('[Verify OTP] Needs phone update, setting step to phone_setup')
          setPanditId(data.panditId)
          setStep('phone_setup')
          sessionStorage.setItem('pandit_login_step', 'phone_setup')
          sessionStorage.setItem('pandit_id', data.panditId)
          // Persist country code defaults at time of login
          sessionStorage.setItem('pandit_phone_cc', phoneCountryCode)
          sessionStorage.setItem('pandit_wa_cc', whatsappCountryCode)
        } else if (data.onboardingRequired) {
          console.log('[Verify OTP] Onboarding required, redirecting...')
          sessionStorage.removeItem('pandit_login_step')
          sessionStorage.removeItem('pandit_id')
          window.location.href = '/pandit/onboarding'
        } else {
          console.log('[Verify OTP] Login successful, redirecting to dashboard')
          sessionStorage.removeItem('pandit_login_step')
          sessionStorage.removeItem('pandit_id')
          window.location.href = '/pandit/dashboard'
        }
      } else {
        setError(data.message || 'Invalid OTP')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length < 7 || phone.length > 15 || whatsapp.length < 7 || whatsapp.length > 15) {
      setError('Please enter valid phone numbers (7-15 digits)')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/pandit/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panditId,
          // Strip any accidental country code prefix from the local number
          // e.g. if CC=977 and user typed 9779860804988, strip leading 977 → 9860804988
          phone: `+${phoneCountryCode}${phone.startsWith(phoneCountryCode) ? phone.slice(phoneCountryCode.length) : phone}`,
          whatsapp: `+${whatsappCountryCode}${whatsapp.startsWith(whatsappCountryCode) ? whatsapp.slice(whatsappCountryCode.length) : whatsapp}`
        }),
      })
      const data = await res.json()
      console.log('[Save Phone] API Response:', data)

      if (data.success) {
        console.log('[Save Phone] Success, redirecting...')
        sessionStorage.removeItem('pandit_login_step')
        sessionStorage.removeItem('pandit_id')
        sessionStorage.removeItem('pandit_phone_cc')
        sessionStorage.removeItem('pandit_wa_cc')

        // Use window.location.href for aggressive redirect to ensure layout re-runs
        if (data.onboardingRequired) {
          window.location.href = '/pandit/onboarding'
        } else {
          window.location.href = '/pandit/dashboard'
        }
      } else {
        console.error('[Save Phone] Failed:', data.message)
        setError(data.message || 'Failed to update phone number')
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
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] text-white text-3xl mb-4 shadow-lg">
            🧘
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1a1209]">Pandit Portal</h1>
          <p className="text-[#6b5b45] text-sm mt-1">Sign in to manage your poojas</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#f0dcc8] rounded-2xl shadow-card p-8">
          {step === 'identifier' ? (
            <div className="space-y-6">
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1209] mb-2">
                    📧 Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="input-divine w-full"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-[#6b5b45] mt-1.5">
                    OTP will be sent to your registered Gmail
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-saffron w-full py-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    '→'
                  )}
                  {loading ? 'Sending OTP…' : 'Send OTP via Email'}
                </button>
              </form>
            </div>
          ) : step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">📩</div>
                <p className="text-sm text-[#6b5b45]">
                  OTP sent to <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1209] mb-2">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className="input-divine w-full text-center text-2xl tracking-[0.5em] font-bold"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                  ✓ {success}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-saffron w-full py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : '🙏'}
                {loading ? 'Verifying…' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('identifier'); setOtp(''); setError(''); setSuccess(''); }}
                className="w-full text-center text-sm text-[#6b5b45] hover:text-[#ff7f0a] transition-colors"
              >
                ← Change email
              </button>

              <p className="text-center text-xs text-[#6b5b45]">
                Didn't receive OTP?{' '}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[#ff7f0a] font-semibold hover:underline"
                >
                  Resend
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSavePhone} className="space-y-5">
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">📱</div>
                <h2 className="text-lg font-bold text-[#1a1209]">Complete Your Profile</h2>
                <p className="text-sm text-[#6b5b45]">
                  Please provide your contact numbers to continue
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1209] mb-2">
                    📞 Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCountryCode}
                      onChange={e => setPhoneCountryCode(e.target.value)}
                      className="px-2 py-2 bg-[#fff8f0] border border-[#f0dcc8] rounded-xl text-[#6b5b45] text-xs font-medium outline-none"
                    >
                      {COUNTRIES.map((c, i) => (
                        c.divider ? (
                          <option key={`divider-${i}`} disabled>──────────</option>
                        ) : (
                          <option key={c.code} value={c.code}>
                            +{c.code} {c.flag}
                          </option>
                        )
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter phone number"
                      className="input-divine flex-1"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1a1209] mb-2">
                    💬 WhatsApp Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={whatsappCountryCode}
                      onChange={e => setWhatsappCountryCode(e.target.value)}
                      className="px-2 py-2 bg-[#fff8f0] border border-[#f0dcc8] rounded-xl text-[#6b5b45] text-xs font-medium outline-none"
                    >
                      {COUNTRIES.map((c, i) => (
                        c.divider ? (
                          <option key={`divider-${i}`} disabled>──────────</option>
                        ) : (
                          <option key={c.code} value={c.code}>
                            +{c.code} {c.flag}
                          </option>
                        )
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter WhatsApp number"
                      className="input-divine flex-1"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-saffron w-full py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : '✅'}
                {loading ? 'Saving...' : 'Save & Continue'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[#6b5b45] mt-6">
          Mandirlok Pandit Portal · For registered pandits only
        </p>
      </div>
    </div>
  )
}


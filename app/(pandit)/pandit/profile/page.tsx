'use client'

import { useState, useEffect } from 'react'
import PanditSidebar from '@/components/pandit/PanditSidebar'
import {
  User, Mail, Phone, Languages,
  Award, FileText, Camera, Check,
  Building, Percent, ShieldCheck, Save
} from 'lucide-react'
import CloudinaryUploader from '@/components/admin/CloudinaryUploader'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pandit, setPandit] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    languages: '',
    photo: '',
    whatsapp: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetch('/api/pandit/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPandit(data.data)
          setFormData({
            name: data.data.name || '',
            email: data.data.email || '',
            bio: data.data.bio || '',
            languages: (data.data.languages || []).join(', '),
            photo: data.data.photo || '',
            whatsapp: data.data.whatsapp || ''
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/pandit/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean)
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setPandit(data.data)
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#fdf6ee] flex overflow-hidden">
        <PanditSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#ff7f0a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#fdf6ee] flex overflow-hidden">
      <PanditSidebar />
      <div className="flex-1 overflow-auto h-full">
        <header className="bg-white border-b border-[#f0dcc8] px-6 py-4 sticky top-0 z-30">
          <h1 className="font-display font-bold text-gray-900 text-lg">My Profile</h1>
        </header>

        <main className="p-6 max-w-4xl mx-auto space-y-8">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
            {/* Left Col - Avatar & Bio */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white border border-[#f0dcc8] rounded-3xl p-8 shadow-card text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#fff8f0] rounded-bl-full -mr-10 -mt-10 opacity-50" />

                <div className="relative group inline-block mb-4">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#fff8f0] to-[#f0dcc8] border-2 border-white shadow-xl flex items-center justify-center overflow-hidden">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Pandit" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-bold text-[#ff7f0a] uppercase">{formData.name?.[0]}</span>
                    )}
                  </div>
                </div>

                <h2 className="font-display font-bold text-lg text-gray-900">{pandit?.name}</h2>
                <p className="text-xs text-[#6b5b45] mt-1">{pandit?.experienceYears} Years Exp · Pt. ID: {pandit?._id?.slice(-6).toUpperCase()}</p>

                {pandit?.isVerified && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-100 shadow-sm">
                    <ShieldCheck size={14} /> Verified Pandit
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#f0dcc8] rounded-2xl p-6 shadow-card space-y-4">
                <p className="text-[10px] text-[#6b5b45] uppercase font-bold tracking-widest border-b border-[#fdf6ee] pb-2">Internal Metadata</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Percent size={16} className="text-[#ff7f0a]" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Commission</p>
                      <p className="text-sm font-bold text-gray-900">{pandit?.commissionPercentage}% (Pandit Share)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building size={16} className="text-[#ff7f0a]" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Assigned Temples</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pandit?.assignedTemples?.length > 0 ? pandit.assignedTemples.map((t: any) => (
                          <span key={t._id} className="px-2 py-0.5 bg-[#fff8f0] text-[#6b5b45] text-[9px] font-bold rounded border border-[#f0dcc8]">{t.name}</span>
                        )) : <span className="text-xs text-gray-400">Public/All</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col - Edit Fields */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-[#f0dcc8] rounded-3xl shadow-card p-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><User size={14} /> Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-divine w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Mail size={14} /> Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-divine w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Camera size={14} /> Profile Photo URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.photo}
                          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                          className="flex-1 input-divine"
                          placeholder="https://..."
                        />
                        <CloudinaryUploader
                          onUploadSuccess={(url) => setFormData({ ...formData, photo: url })}
                          folder="pandits"
                          resourceType="image"
                          buttonText="Upload"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="opacity-60 bg-gray-50 rounded-2xl p-4 border border-gray-100 cursor-not-allowed">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Phone size={12} /> Registered Phone</label>
                      <p className="font-bold text-gray-900">{pandit?.phone}</p>
                      <p className="text-[9px] text-gray-400 mt-1">Cannot change (used for login)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Phone size={14} /> WhatsApp Number</label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="input-divine w-full"
                        placeholder="+91..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Languages size={14} /> Languages (Comma Separated)</label>
                      <input
                        type="text"
                        value={formData.languages}
                        onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                        className="input-divine w-full"
                        placeholder="Hindi, Sanskrit, English..."
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FileText size={14} /> Professional Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="input-divine w-full min-h-[120px] py-4"
                    placeholder="Tell devotees about your lineage, expertise and years of spiritual practice..."
                  />
                </div>

                {message.text && (
                  <div className={`mt-6 p-4 rounded-xl text-xs font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {message.type === 'success' ? '✓ ' : '✕ '}{message.text}
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-[#fdf6ee] flex justify-end">
                  <button
                    disabled={submitting}
                    className="btn-saffron px-10 py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                  >
                    {submitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                    {submitting ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </div>
            {/* Aadhaar Card Section - Read Only */}
            <div className="bg-white border border-[#f0dcc8] rounded-3xl shadow-card p-8 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#fdf6ee] pb-4">
                <FileText size={18} className="text-[#ff7f0a]" />
                <p className="text-sm font-bold text-gray-900">Aadhaar Card</p>
                {pandit?.aadhaarStatus && pandit.aadhaarStatus !== 'none' && (
                  <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-bold uppercase ${pandit.aadhaarStatus === 'verified' ? 'bg-green-100 text-green-700' :
                    pandit.aadhaarStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                    {pandit.aadhaarStatus}
                  </span>
                )}
              </div>
              {pandit?.aadhaarCardUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#f0dcc8] shadow-inner max-w-sm">
                  <img src={pandit.aadhaarCardUrl} alt="Aadhaar Card" className="w-full object-cover" />
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No Aadhaar card uploaded yet. Complete the onboarding to upload it.</p>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

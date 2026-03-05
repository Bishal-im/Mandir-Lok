'use client'

import { useState } from 'react'
import { X, Video, ExternalLink, CheckCircle } from 'lucide-react'
import CloudinaryUploader from '@/components/admin/CloudinaryUploader'

interface VideoUploadModalProps {
  orderId: string;
  devoteeName: string;
  poojaName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function VideoUploadModal({ orderId, devoteeName, poojaName, onSuccess, onClose }: VideoUploadModalProps) {

  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'success'>('form')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple URL validation
    try {
      new URL(videoUrl)
    } catch {
      setError('Please enter a valid URL (YouTube, Drive, etc.)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/pandit/orders/${orderId}/upload-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      })
      const data = await res.json()
      
      if (data.success) {
        setStep('success')
        onSuccess()
      } else {
        setError(data.message || 'Failed to update order status')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Content */}
      <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {step === 'form' ? (
          <div className="p-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
              <Video size={32} />
            </div>
            
            <div className="text-center mb-8">
              <h3 className="font-display text-xl font-bold text-gray-900">Upload Video for {poojaName}</h3>
              <p className="text-sm text-gray-500 mt-2">
                Recording for devotee: <span className="font-bold text-[#ff7f0a]">{devoteeName}</span>
              </p>
              <p className="text-[11px] text-[#6b5b45] mt-1">
                 Link will be sent to their WhatsApp automatically.
              </p>
            </div>

            {/* Direct Cloudinary Upload */}
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Option 1: Direct Upload</p>
              <CloudinaryUploader 
                folder="pooja_recordings"
                onUploadSuccess={(url) => {
                  setVideoUrl(url);
                  // Optionally you could even trigger the submit here
                }}
              />
            </div>

            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-300 uppercase">Or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Option 2: Video Link (YouTube / Drive)
                </label>
                <div className="relative">
                  <ExternalLink size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/..."
                    className="input-divine w-full pl-12"
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-[11px] text-[#6b5b45]">
                  💡 Tip: For YouTube, set the video as "Unlisted" so only the devotee can watch.
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
                className="btn-saffron w-full py-3 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  '🙏 Mark Complete & Send'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 mx-auto">
              <CheckCircle size={48} />
            </div>
            
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">Pooja Completed!</h3>
            <p className="text-gray-600 mb-8">
              The video link has been shared with the devotee on WhatsApp. Your earnings have been updated.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

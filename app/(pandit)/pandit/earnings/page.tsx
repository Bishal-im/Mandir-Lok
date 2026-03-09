'use client'

import { useState, useEffect } from 'react'
import PanditSidebar from '@/components/pandit/PanditSidebar'
import {
  IndianRupee, TrendingUp, Wallet, History,
  ArrowUpRight, Clock, CheckCircle, AlertCircle, X
} from 'lucide-react'
import { formatINR, formatDate } from '@/lib/utils'

export default function EarningsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [upiId, setUpiId] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchEarnings = async () => {
    try {
      const res = await fetch('/api/pandit/earnings')
      const d = await res.json()
      if (d.success) setData(d.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!upiId && !bankAccount) {
      setError('Please provide at least one payment method (UPI ID or Bank Details)')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/pandit/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(payoutAmount),
          upiId,
          bankAccount
        }),
      })
      const d = await res.json()
      if (d.success) {
        setSuccess('Payout request submitted successfully!')
        setTimeout(() => {
          setShowPayoutModal(false)
          setSuccess('')
          fetchEarnings()
        }, 2000)
      } else {
        setError(d.message || 'Failed to submit request')
      }
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
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

  const cards = [
    { label: 'Total Volume', value: formatINR(data?.totalEarnings || 0), icon: <TrendingUp size={24} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Already Paid', value: formatINR(data?.paidOut || 0), icon: <CheckCircle size={24} />, color: 'bg-green-50 text-green-600' },
    { label: 'Available to Withdraw', value: formatINR(data?.unpaidEarnings || 0), icon: <Wallet size={24} />, color: 'bg-orange-50 text-orange-600', highlight: true },
  ]

  return (
    <div className="h-screen bg-[#fdf6ee] flex overflow-hidden">
      <PanditSidebar />
      <div className="flex-1 overflow-auto h-full">
        <header className="bg-white border-b border-[#f0dcc8] px-6 py-4 sticky top-0 z-30">
          <h1 className="font-display font-bold text-gray-900 text-lg">Earnings & Payouts</h1>
        </header>

        <main className="p-6 max-w-5xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {cards.map((c) => (
              <div key={c.label} className={`bg-white border rounded-3xl p-6 shadow-card ${c.highlight ? 'border-orange-200 ring-4 ring-orange-50' : 'border-[#f0dcc8]'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${c.color}`}>
                  {c.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{c.value}</div>
                <div className="text-xs font-semibold text-[#6b5b45] uppercase tracking-wider">{c.label}</div>
                {c.highlight && data?.unpaidEarnings > 0 && (
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => {
                        setShowPayoutModal(true)
                        setPayoutAmount(data.unpaidEarnings.toString())
                      }}
                      className="w-full py-3 flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-lg bg-[#ff7f0a] text-white hover:bg-[#e66e00] shadow-orange-500/20"
                    >
                      <ArrowUpRight size={18} /> Request Payout
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* History Section */}
          <div className="bg-white border border-[#f0dcc8] rounded-3xl shadow-card overflow-hidden">
            <div className="px-8 py-6 border-b border-[#f0dcc8] flex items-center justify-between">
              <h3 className="font-display font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide text-sm">
                <History size={18} className="text-[#ff7f0a]" /> Recent Payout History
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#fff8f0] text-[#6b5b45] text-[10px] font-bold uppercase tracking-widest border-b border-[#f0dcc8]">
                    <th className="px-8 py-4">Requested Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method/Details</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fdf6ee]">
                  {data?.payouts?.length > 0 ? data.payouts.map((p: any) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="text-sm font-bold text-gray-900">{formatDate(p.createdAt)}</div>
                        <div className="text-[10px] text-gray-400 font-mono uppercase truncate">{p._id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#8b0000]">{formatINR(p.amount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-[#6b5b45] font-medium max-w-[150px] truncate">
                          {p.upiId ? `UPI: ${p.upiId}` : p.bankAccount ? `Bank: ${p.bankAccount}` : '---'}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${p.status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' :
                          p.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            p.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-yellow-50 text-yellow-600 border-yellow-100'
                          }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-[#6b5b45] text-sm italic">
                        No payout history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayoutModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <button onClick={() => setShowPayoutModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>

            <div className="p-8">
              <header className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-50 text-[#ff7f0a] rounded-2xl flex items-center justify-center mx-auto mb-4"><IndianRupee size={32} /></div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Request Withdrawal</h3>
                <p className="text-sm text-[#6b5b45] mt-2">Available: <span className="font-bold text-gray-900">{formatINR(data.unpaidEarnings)}</span></p>
              </header>

              <form onSubmit={handlePayout} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Withdraw Amount (₹)</label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="input-divine w-full text-xl font-bold"
                    max={data.unpaidEarnings}
                    min={1}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-[#6b5b45] uppercase font-bold tracking-widest border-b border-[#fdf6ee] pb-2">Payment Details (Fill Any One)</p>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">UPI ID (e.g. name@upi)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="input-divine w-full text-sm"
                      placeholder="pandit@ptsbi"
                    />
                  </div>

                  <div className="text-center py-1 opacity-50"><span className="text-[10px] font-bold">— OR —</span></div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Bank Account Info</label>
                    <textarea
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="input-divine w-full text-sm py-3 min-h-[80px]"
                      placeholder="A/C: XXXXXXXXXX, IFSC: SBIN00XXXXX..."
                    />
                  </div>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs border border-red-100">{error}</div>}
                {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-xs border border-green-100">{success}</div>}

                <button
                  disabled={submitting}
                  className="btn-saffron w-full py-4 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Processing...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

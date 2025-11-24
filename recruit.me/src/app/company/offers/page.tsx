"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CompanyOffer = {
  id: string;
  applicantName: string;
  jobTitle: string;
  amount: string;
  offeredOn: string;
  status: "Pending" | "Accepted" | "Rejected" | "Rescinded";
};

const API_BASE_URL = 'https://8f542md451.execute-api.us-east-1.amazonaws.com/prod';

function OffersContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<CompanyOffer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cid = sessionStorage.getItem("companyId");
    if (!cid) {
      setError("Please login to view offers");
      setLoading(false);
      // Redirect to login?
      router.push('/company/login');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/company/getCompanyOffers?companyId=${encodeURIComponent(cid)}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setOffers(data);
      } catch (err: any) {
        console.error("Failed to fetch offers:", err);
        setError("Failed to load offers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRescind = async (offerId: string) => {
    if (!confirm("Are you sure you want to rescind this offer?")) return;
    
    // Instant update UI
    setOffers((prev) => 
      prev.map((offer) => 
        offer.id === offerId ? { ...offer, status: "Rescinded" } : offer
      )
    );

    try { // now update the database
      const res = await fetch(`${API_BASE_URL}/applications/rescindOffer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offerId }) 
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
    } catch (e) {
      console.error("Failed to rescind offer:", e);
      alert("Failed to rescind offer. Please try again.");
      // Revert instant update UI because failed to update the database
      setOffers((prev) => 
        prev.map((offer) => 
          offer.id === offerId ? { ...offer, status: "Pending" } : offer
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading offers...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/company/profile">
            <button className="px-4 py-2 rounded bg-blue-600 text-white">Back to Profile</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">Manage Offers</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">View and manage job offers sent to applicants</p>
          </div>
          <Link href="/company/profile">
            <button className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
              Back to Profile
            </button>
          </Link>
        </div>

        {/* Offers List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {offers.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
              No offers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">Applicant</th>
                    <th className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">Job Title</th>
                    <th className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">Amount</th>
                    <th className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">Date Sent</th>
                    <th className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">Status</th>
                    <th className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                        {offer.applicantName}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                        {offer.jobTitle}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 font-mono">
                        {offer.amount}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {offer.offeredOn}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          offer.status === 'Accepted' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                          offer.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                          offer.status === 'Rescinded' ? 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700' :
                          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                        }`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {offer.status === 'Pending' && (
                          <button
                            onClick={() => handleRescind(offer.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40"
                          >
                            Rescind Offer
                          </button>
                        )}
                        {offer.status === 'Accepted' && (
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Hired
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OffersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 flex items-center justify-center">Loading...</div>}>
      <OffersContent />
    </Suspense>
  );
}

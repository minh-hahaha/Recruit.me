'use client'

import { JobForm } from '../JobForm';
import { useRouter } from 'next/navigation';
import { type Job } from '../types';
import { useState, useEffect } from 'react';

 const API_BASE_URL = 'https://f91m7y39wl.execute-api.us-east-1.amazonaws.com/prod';

export default function CreateJobPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get company ID from sessionStorage
    const storedCompanyId = sessionStorage.getItem('companyId');
    if (!storedCompanyId) {
      setError('Please login to create a job');
      router.push('/company/login');
      return;
    }
    setCompanyId(storedCompanyId);
  }, [router]);

  const handleSubmit = async (data: Job) => {
    if (!companyId) {
      setError('Company ID not found. Please login again.');
      return;
    }


    setError(null);
    setLoading(true);

    try {
      console.log(data);
      console.log(companyId);

      const response = await fetch(`${API_BASE_URL}/job/createJob`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          companyId: companyId,
          positions: data.positions || 1,
          skills: data.skills || [],
          status: data.status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError((result && (result.error || result.message)) || `Failed to create job (status ${response.status})`);
        setLoading(false);
        return;
      }

      // After successful creation, redirect to the company profile
      router.push('/company/profile');
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
      setLoading(false);
    }
  };

  if (!companyId) {
    return (
      <main className="flex w-full max-w-3xl flex-col items-center justify-center px-6 py-24 sm:px-16 sm:py-32">
        <div className="text-center">
          <p className="text-red-600">Please login to create a job</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
      <JobForm onSubmit={handleSubmit} />
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg">
            <p>Creating job...</p>
          </div>
        </div>
      )}
    </>
  );
}
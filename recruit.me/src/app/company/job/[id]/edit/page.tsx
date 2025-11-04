'use client'

import { JobForm } from '../../JobForm';
import { useRouter } from 'next/navigation';
import { type Job, JobStatus } from '../../types';
import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://8f542md451.execute-api.us-east-1.amazonaws.com/prod';

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Resolve params promise
    params.then((resolvedParams) => {
      setJobId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!jobId) return;

    // Fetch the job data
    const fetchJob = async () => {
      try {
        // Get all jobs and find the one matching the ID
        const response = await fetch(`${API_BASE_URL}/job/getJob`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const jobs = await response.json();
        const foundJob = jobs.find((j: any) => String(j.id) === String(jobId));

        if (!foundJob) {
          setError('Job not found');
          setLoading(false);
          return;
        }

        // Convert to Job format
        const jobData: Job = {
          id: foundJob.id,
          title: foundJob.title,
          description: foundJob.description,
          companyID: foundJob.companyID,
          status: foundJob.status as JobStatus,
          positions: foundJob.positions || 1,
          skills: foundJob.skills || [],
          applicantCount: foundJob.applicantCount || 0,
          hiredCount: foundJob.hiredCount || 0,
        };

        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job data');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleSubmit = async (data: Job) => {
    if (!jobId) {
      setError('Job ID not found');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/job/editJob`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: jobId,
          title: data.title,
          description: data.description,
          positions: data.positions || 1,
          skills: data.skills || [],
          status: data.status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to update job');
        setSubmitting(false);
        return;
      }

      // After successful update, redirect to the company profile
      router.push('/company/profile');
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex w-full max-w-3xl flex-col items-center justify-center px-6 py-24 sm:px-16 sm:py-32">
        <div className="text-center">
          <p>Loading job data...</p>
        </div>
      </main>
    );
  }

  if (error && !job) {
    return (
      <main className="flex w-full max-w-3xl flex-col items-center justify-center px-6 py-24 sm:px-16 sm:py-32">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
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
      {job && <JobForm onSubmit={handleSubmit} initialData={job} isEdit />}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg">
            <p>Updating job...</p>
          </div>
        </div>
      )}
    </>
  );
}
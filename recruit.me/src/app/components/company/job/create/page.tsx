'use client'

import { JobForm } from '../JobForm';
import { useRouter } from 'next/navigation';
import { type Job } from '../types';

export default function CreateJobPage() {
  const router = useRouter();

  const handleSubmit = async (data: Job) => {
    try {
      // TODO: Implement the API call to create a job
      console.log('Creating job:', data);
      // After successful creation, redirect to the jobs list
      // router.push('/company/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  return <JobForm onSubmit={handleSubmit} />;
}
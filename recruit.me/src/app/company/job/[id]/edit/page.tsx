'use client'

import { JobForm } from '../../JobForm';
import { useRouter } from 'next/navigation';
import { type Job, JobStatus } from '../../types';

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // TODO: Fetch the job data based on the ID
  const mockJob: Job = {
    id: params.id,
    title: "Example Job",
    description: "This is an example job posting",
    companyID: "company-123", // TODO: Get from current user context
    status: JobStatus.Draft,
    positions: 1,
    skills: [{ id: "1", name: "JavaScript" }]
  };

  const handleSubmit = async (data: Job) => {
    try {
      // TODO: Implement the API call to update the job
      console.log('Updating job:', { ...data, id: params.id });
      // After successful update, redirect to the jobs list
      // router.push('/company/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  return <JobForm onSubmit={handleSubmit} initialData={mockJob} isEdit />;
}
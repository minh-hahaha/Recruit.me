'use client'

import Link from 'next/link';

export default function CompanyPortal() {
    return (
        <main className="flex-grow flex flex-col px-6 py-24 sm:px-16 sm:py-32">
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-3xl font-semibold mb-8 text-zinc-900 dark:text-zinc-50">
                    Company Dashboard
                </h1>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Job Management Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                            Job Management
                        </h2>
                        <div className="space-y-4">
                            <Link href="/components/company/job/create">
                                <button className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all">
                                    Create New Job
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
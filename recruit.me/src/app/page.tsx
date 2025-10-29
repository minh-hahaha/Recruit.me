import Link from "next/link";

export default function Home() {
    return (
        <div>
            <div className="flex flex-col font-sans">
                <main className="flex-grow flex flex-col justify-center px-6 py-24 sm:px-16 sm:py-32">
                    <div className="flex flex-col sm:flex-row gap-8 w-full max-w-4xl justify-center">
                        {/* Applicant */}
                        <div className="group flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-8 flex flex-col items-center max-w-sm mx-auto">
                            <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
                                Applicant
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                                Find opportunities, apply easily, and track your progress.
                            </p>
                            <div className="flex flex-col gap-4 w-full">
                                <Link href="/applicant/register">
                                    <button className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all">
                                        Register
                                    </button>
                                </Link>
                                <Link href="/applicant/login">
                                    <button className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium transition-all">
                                        Login
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Company */}
                        <div className="group flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-8 flex flex-col items-center max-w-sm mx-auto">
                            <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
                                Company
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                                Post jobs, manage applicants, and discover top talent.
                            </p>
                            <div className="flex flex-col gap-4 w-full">
                                <Link href="/company/register">
                                    <button className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all">
                                        Register
                                    </button>
                                </Link>
                                <Link href="/company/login">
                                    <button className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium transition-all">
                                        Login
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
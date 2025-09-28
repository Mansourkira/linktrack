export default function BulkImportPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 animate-pulse">
                Coming Soon!
            </h1>
            <p className="text-xl text-gray-700 text-center max-w-md">
                We're diligently working on bringing you exciting new features.
                Stay tuned for updates!
            </p>
            <div className="mt-8 text-gray-500">
                <svg
                    className="w-12 h-12 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
            </div>
        </div>
    );
}

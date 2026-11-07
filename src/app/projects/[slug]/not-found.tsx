import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 text-center border border-black/5 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#FAF7F0] text-gray-500 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--color-charcoal)' }}
        >
          Project Not Found
        </h1>

        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: 'var(--color-charcoal-soft)' }}
        >
          The project you requested does not exist or has not been published yet. Check the catalogue to explore available crochet projects.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/explore"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:brightness-105 text-center"
            style={{
              backgroundColor: 'var(--color-sage)',
              color: '#1F1F1F',
            }}
          >
            Explore catalogue
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold border border-black/10 transition-colors hover:bg-black/5 text-center"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}


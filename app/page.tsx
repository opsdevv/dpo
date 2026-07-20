export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto text-center space-y-8">
        {/* Logo / Brand */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.8"/>
                <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
            <span className="text-3xl md:text-4xl font-bold tracking-tight">
              Agentic <span className="text-teal-400">DPO</span>
            </span>
          </div>
          <span className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-teal-300">
            Pro
          </span>
        </div>

        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            We're Leveling Up
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
              Your AI Botswana Data Protection Act expert is taking a short break to bring you something amazing
          </p>
        </div>

        {/* Features Teaser */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold text-white mb-2">Enhanced Features</h3>
            <p className="text-sm text-white/60">
              New advanced features for deeper DPA compliance
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">Infrastructure Upgrade</h3>
            <p className="text-sm text-white/60">
              Faster, more reliable performance
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-white mb-2">Better Security</h3>
            <p className="text-sm text-white/60">
              Enhanced privacy and data protection
            </p>
          </div>
        </div>

        {/* Timeline / Message */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
          <p className="text-lg text-white/80 leading-relaxed">
            We're working behind the scenes building the next generation of Agentic DPO to help you navigate the Botswana Data Protection Act with even more powerful tools and features. Stay tuned — we'll be back better than ever!
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-white/40 text-sm">
          <p>
            Developed by <a href="https://obokengmakwati.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">
              OBK
            </a> · Botswana Data Protection Act Expert
          </p>
        </div>
      </div>
    </div>
  )
}

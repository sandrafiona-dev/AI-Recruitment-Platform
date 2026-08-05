function Hero() {
  return (
    <section id="home" className="overflow-hidden px-6 pb-20 pt-20 sm:px-10 sm:pt-28 lg:px-16">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="inline-flex rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            Welcome to the platform
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            AI Recruitment Platform
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            A modern foundation for building reliable, thoughtful recruitment
            experiences.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              Get Started
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-100 p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Platform foundation</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Ready
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {["Responsive interface", "API-ready services", "Modular architecture"].map(
                (item, index) => (
                  <div key={item} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                      <span>{item}</span>
                      <span className="text-indigo-600">{92 - index * 6}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${92 - index * 6}%` }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

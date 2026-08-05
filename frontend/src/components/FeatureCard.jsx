function FeatureCard({ icon, title, description }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl font-semibold text-indigo-700">
        {icon}
      </div>
      <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

export default FeatureCard;

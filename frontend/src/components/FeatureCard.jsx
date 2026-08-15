function FeatureCard({ icon, title, description }) {
  return (
    <article className="rounded-2xl border border-[#ead8ce] bg-[#fffdfb] p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#dcb8a8] hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3ded4] text-xl font-semibold text-[#a6573e]">
        {icon}
      </div>
      <h3 className="mt-5 font-semibold text-[#29231f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#766961]">{description}</p>
    </article>
  );
}

export default FeatureCard;

function RecruitaWordmark({ className = "" }) {
    return (
        <span
            className={`font-semibold tracking-[-0.04em] text-[#29231f] ${className}`}
            aria-label="Recruita"
        >
            Recru
            <span className="bg-gradient-to-b from-[#d97757] from-0% via-[#d97757] via-35% to-[#29231f] to-45% bg-clip-text text-transparent">
                i
            </span>
            ta
        </span>
    );
}

export default RecruitaWordmark;
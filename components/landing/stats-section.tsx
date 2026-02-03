const stats = [
  { value: "10-20%", label: "of adopted pets are returned due to mismatches" },
  { value: "92%", label: "success rate with compatibility matching" },
  { value: "14 days", label: "critical adjustment period monitored" },
  { value: "50+", label: "partner shelters across Sri Lanka" },
]

export function StatsSection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold mb-2">{stat.value}</div>
              <p className="text-primary-foreground/80 text-sm sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

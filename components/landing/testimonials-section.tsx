import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Kavindi Perera",
    location: "Colombo",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356679/pawmatch/static/jwytpzevxsaezqhiweaq.jpg",
    pet: "Adopted Bruno, a 2-year-old mix",
    quote:
      "The quiz matched us perfectly. Bruno's energy level matches our active lifestyle, and the welfare tracker helped us through the first two weeks smoothly.",
  },
  {
    name: "Roshan de Silva",
    location: "Kandy",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356678/pawmatch/static/cmxuxwu8byhwsjszig9x.jpg",
    pet: "Adopted Bella, a 4-year-old rescue",
    quote:
      "I was worried about how Bella would get along with my cat. The buddy-check feature gave us confidence, and they're now best friends!",
  },
  {
    name: "Nimali Fernando",
    location: "Galle",
    image: "https://res.cloudinary.com/dd58qgsfx/image/upload/v1770356680/pawmatch/static/r0rrwqmkdmsxuvgbtg5g.jpg",
    pet: "Foster-to-adopt success",
    quote:
      "As a first-time pet owner, the foster option was perfect. The platform supported me every step of the way until I was ready to commit.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">Success Stories</h2>
          <p className="text-muted-foreground text-lg">Real families, real matches, real happy endings</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="bg-card p-8 rounded-2xl border border-border relative">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />

              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  <p className="text-xs text-primary mt-1">{testimonial.pet}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

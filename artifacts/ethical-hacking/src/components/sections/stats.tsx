import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "AI Tools Tracked" },
  { value: "50+", label: "Categories" },
  { value: "Weekly", label: "Updates" },
  { value: "100%", label: "Free to Start" }
];

export function Stats() {
  return (
    <section className="py-12 border-y border-border/50 bg-card/30 relative z-10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/0 md:divide-border/50">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-white mb-2 font-mono">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

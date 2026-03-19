import { motion } from "framer-motion";
import { Shield, Mail, TerminalSquare, FileBarChart } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "AI Tools Directory",
    description: "200+ curated AI tools for security professionals, constantly updated with the latest in defensive and offensive tech.",
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "group-hover:border-primary/50"
  },
  {
    title: "Weekly Newsletter",
    description: "AI-powered security insights, tool teardowns, and zero-day alerts delivered to your inbox every single week.",
    icon: Mail,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "group-hover:border-accent/50"
  },
  {
    title: "Prompt Library",
    description: "Premium AI prompts specifically crafted for penetration testers, red teams, and security researchers.",
    icon: TerminalSquare,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "group-hover:border-purple-400/50"
  },
  {
    title: "AI Reports",
    description: "Automated vulnerability assessment reports powered by AI, saving you hours of documentation time.",
    icon: FileBarChart,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "group-hover:border-amber-400/50"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Unleash the Power of AI
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Everything you need to modernize your security workflows. Coming soon to EthicalHacking.ai.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
      >
        {features.map((feature, idx) => (
          <motion.div key={idx} variants={item}>
            <div className={cn(
              "group relative p-8 rounded-2xl glass-panel transition-all duration-300 h-full",
              "hover:-translate-y-1 hover:shadow-2xl",
              feature.border
            )}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <feature.icon className={cn("w-24 h-24", feature.color)} />
              </div>
              
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6", feature.bg)}>
                <feature.icon className={cn("w-7 h-7", feature.color)} />
              </div>
              
              <h3 className="text-xl font-bold mb-3 font-display">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              
              <div className="mt-6 flex items-center text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse mr-2" />
                Coming Soon
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

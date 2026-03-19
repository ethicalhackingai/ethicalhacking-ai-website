import { motion } from "framer-motion";
import { Terminal, Shield, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl mx-auto z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-8 font-medium shadow-[0_0_15px_rgba(0,212,255,0.15)]">
          <Terminal className="w-4 h-4" />
          <span>v2.0 Beta Protocol Initialized</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-6">
          AI-Powered <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-glow-cyan">
            Cybersecurity Intelligence
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
          Discover the best AI tools for ethical hacking, penetration testing, and cyber defense. Curated directory, expert insights, and premium resources.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Explore AI Tools
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 bg-transparent text-accent font-bold rounded-xl border-2 border-accent shadow-[0_0_15px_rgba(0,255,136,0.1)_inset] hover:bg-accent/10 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Join Newsletter
          </motion.button>
        </div>
      </motion.div>

    </section>
  );
}

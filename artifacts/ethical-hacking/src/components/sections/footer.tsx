import { Shield, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
          
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-white">
                EthicalHacking<span className="text-primary">.ai</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs text-center md:text-left">
              Empowering security professionals with next-generation AI intelligence.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-center md:text-left">
            <div>
              <h4 className="text-foreground font-bold mb-4 uppercase text-sm tracking-wider">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">About Us</a></li>
                <li><a href="mailto:hello@ethicalhacking.ai" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-4 uppercase text-sm tracking-wider">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50 gap-4">
          <p className="text-muted-foreground text-sm font-mono">
            &copy; {currentYear} EthicalHacking.ai. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-white hover:bg-card p-2 rounded-full transition-all">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-white hover:bg-card p-2 rounded-full transition-all">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-white hover:bg-card p-2 rounded-full transition-all">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

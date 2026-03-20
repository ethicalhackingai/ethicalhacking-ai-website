export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-mono">© 2025 EthicalHacking.ai</p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          <a
            href="mailto:hello@ethicalhacking.ai"
            className="hover:text-primary transition-colors font-mono"
          >
            hello@ethicalhacking.ai
          </a>
          <span className="text-border/60">|</span>
          <a href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <span className="text-border/60">|</span>
          <a href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}

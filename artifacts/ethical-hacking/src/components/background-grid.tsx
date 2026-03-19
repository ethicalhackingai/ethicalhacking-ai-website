export function BackgroundGrid() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Dynamic Grid */}
      <div 
        className="absolute inset-[-100%] opacity-[0.03] animate-grid-pan"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00D4FF 1px, transparent 1px),
            linear-gradient(to bottom, #00D4FF 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0E27_100%)]" />
    </div>
  );
}

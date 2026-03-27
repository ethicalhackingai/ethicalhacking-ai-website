import { Link } from "wouter";

const SECTIONS = [
  {
    heading: "Tools",
    links: [
      { label: "Browse All Tools", href: "/tools" },
      { label: "Nmap", href: "/tools/nmap" },
      { label: "Burp Suite", href: "/tools/burp-suite" },
      { label: "Metasploit", href: "/tools/metasploit" },
      { label: "Kali Linux", href: "/tools/kali-linux" },
      { label: "Wireshark", href: "/tools/wireshark" },
    ],
  },
  {
    heading: "Best Of",
    links: [
      { label: "Best AI Pen Testing Tools", href: "/best/best-ai-penetration-testing-tools" },
      { label: "Best AI Vulnerability Scanners", href: "/best/best-ai-vulnerability-scanners" },
      { label: "Best Free Cybersecurity Tools", href: "/best/best-free-cybersecurity-tools" },
      { label: "Best AI OSINT Tools", href: "/best/best-ai-osint-tools" },
      { label: "Best AI Cloud Security Tools", href: "/best/best-ai-cloud-security-tools" },
      { label: "Best AI Endpoint Security Tools", href: "/best/best-ai-endpoint-security-tools" },
    ],
  },
  {
    heading: "Compare",
    links: [
      { label: "Burp Suite vs OWASP ZAP", href: "/compare/burp-suite-vs-owasp-zap" },
      { label: "CrowdStrike vs SentinelOne", href: "/compare/crowdstrike-vs-sentinelone" },
      { label: "Nmap vs Shodan", href: "/compare/nmap-vs-shodan" },
      { label: "Kali Linux vs Parrot OS", href: "/compare/kali-linux-vs-parrot-os" },
      { label: "HackTheBox vs TryHackMe", href: "/compare/hackthebox-vs-tryhackme" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
      { label: "All Comparisons", href: "/compare" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/40 bg-[#070b1f] mt-auto">
      {/* Link grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                {section.heading}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-cyan-400 transition-colors leading-snug"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© 2026 EthicalHacking.ai — The #1 AI Cybersecurity Tools Directory</p>
          <a
            href="mailto:contact@ethicalhacking.ai"
            className="hover:text-gray-400 transition-colors font-mono"
          >
            contact@ethicalhacking.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

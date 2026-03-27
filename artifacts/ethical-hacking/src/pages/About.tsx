import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { BackgroundGrid } from "@/components/background-grid";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/sections/footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Helmet>
        <title>About EthicalHacking.ai — Our Mission &amp; Methodology</title>
        <meta
          name="description"
          content="Learn about EthicalHacking.ai, the largest AI cybersecurity tools directory with 500+ expert-reviewed tools. Our mission, rating methodology, and the team behind the platform."
        />
        <link rel="canonical" href="https://ethicalhacking.ai/about" />
        <meta property="og:title" content="About EthicalHacking.ai — Our Mission & Methodology" />
        <meta
          property="og:description"
          content="Learn about EthicalHacking.ai, the largest AI cybersecurity tools directory with 500+ expert-reviewed tools."
        />
        <meta property="og:url" content="https://ethicalhacking.ai/about" />
        <meta property="og:type" content="website" />
      </Helmet>

      <BackgroundGrid />
      <Navbar />

      <main className="flex-1 pt-16 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">About</span>
          </nav>

          {/* Content */}
          <div className="space-y-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-5">
                About EthicalHacking.ai
              </h1>
              <p className="text-gray-300 leading-relaxed text-base md:text-lg">
                EthicalHacking.ai is the largest AI-powered cybersecurity tools directory, built to help security professionals find the right tools faster. We catalog over 500 tools across penetration testing, red teaming, cloud security, endpoint protection, OSINT, DevSecOps, and more. Every tool is reviewed, categorized, and rated by our team.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-8">

              <section>
                <h2 className="text-xl font-bold text-primary mb-3">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The cybersecurity tool landscape is overwhelming. New AI-powered tools launch every week, and security teams waste hours evaluating options. Our mission is to be the single trusted source where penetration testers, red teamers, bug bounty hunters, and security engineers can discover, compare, and choose the best tools for their workflow.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-primary mb-3">How We Rate Tools</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Every tool on EthicalHacking.ai is evaluated across five criteria: feature depth, ease of use, pricing and value, community and support, and AI capability. Ratings are on a scale of 1 to 5 and represent the consensus of our editorial team. We update ratings quarterly as tools evolve. We are editorially independent and our ratings are not influenced by vendors.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-primary mb-3">What You Will Find Here</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform includes 500+ individual tool reviews with detailed descriptions, 16 curated best-of lists covering every major security category, 13 head-to-head comparison pages for popular tool matchups, and a growing library of expert guides and blog articles on cybersecurity topics.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-primary mb-3">The Team</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EthicalHacking.ai was founded by Shaariq Sami, a domain investor and digital entrepreneur passionate about cybersecurity and AI. The platform is maintained by a small editorial team committed to providing accurate, unbiased, and up-to-date information for the global security community.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-primary mb-3">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Have a question, tool suggestion, or partnership inquiry? Reach out to us at{" "}
                  <a
                    href="mailto:contact@ethicalhacking.ai"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    contact@ethicalhacking.ai
                  </a>
                  . We also welcome contributions from security professionals who want to share their expertise through guest articles or tool reviews.
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
}

export function SEO({ 
  title = "EthicalHacking.ai - AI-Powered Cybersecurity Intelligence", 
  description = "Discover the best AI tools for ethical hacking, penetration testing, and cyber defense. Curated directory, expert insights, and premium resources." 
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="EthicalHacking.ai" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Theme */}
      <meta name="theme-color" content="#0A0E27" />
    </Helmet>
  );
}

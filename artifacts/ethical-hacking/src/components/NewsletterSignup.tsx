import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    } else {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <section className="relative z-10 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-cyan-500/20 bg-[#070b1f] shadow-[0_0_60px_rgba(0,255,200,0.05)] p-8 md:p-10 text-center">

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-5">
            <Mail className="w-5 h-5 text-cyan-400" />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Stay Ahead in Cybersecurity
          </h2>
          <p className="text-gray-400 mb-7 text-sm md:text-base leading-relaxed">
            Get weekly updates on the latest AI security tools, expert guides, and industry news.<br className="hidden sm:block" />
            Join 500+ security professionals.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl py-3 px-5 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              You're in! Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Enter your email"
                disabled={status === "loading"}
                className="flex-1 bg-[#0d1230] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="whitespace-nowrap bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing…
                  </>
                ) : (
                  "Subscribe Free"
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="flex items-center justify-center gap-1.5 text-red-400 text-xs mt-3">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errorMessage}
            </p>
          )}

          <p className="text-gray-600 text-xs mt-4">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}

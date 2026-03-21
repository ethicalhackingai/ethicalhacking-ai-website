import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSubscribeNewsletter } from "@workspace/api-client-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const subscribeMutation = useSubscribeNewsletter({
    mutation: {
      onSuccess: () => {
        setStatus("success");
        reset();
        setTimeout(() => setStatus("idle"), 5000);
      },
      onError: (error: any) => {
        setStatus("error");
        setErrorMessage(
          error?.data?.error ||
          error?.message ||
          "Failed to subscribe. Please try again."
        );
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    setStatus("idle");
    subscribeMutation.mutate({ data: { email: data.email } });
  };

  return (
    <section id="newsletter" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden border-primary/20">
          {/* Decorative background element */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Stay Ahead of Cyber Threats
              </h2>
              <p className="text-muted-foreground text-lg">
                Join <span className="text-primary font-mono font-bold">0+</span> security professionals getting weekly AI-powered insights.
              </p>
            </div>
            
            <div className="flex-1 w-full max-w-md">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-4 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    disabled={isSubmitting || subscribeMutation.isPending}
                  />
                </div>
                
                {errors.email && (
                  <p className="text-destructive text-sm font-mono pl-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.email.message}
                  </p>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || subscribeMutation.isPending}
                  className="w-full py-4 bg-accent hover:bg-[#00e67a] text-accent-foreground font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:shadow-[0_0_25px_rgba(0,255,136,0.5)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(isSubmitting || subscribeMutation.isPending) ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Encrypting...
                    </>
                  ) : (
                    "Subscribe Now"
                  )}
                </button>

                {status === "success" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-accent mt-2 font-mono text-sm justify-center bg-accent/10 py-2 rounded-lg border border-accent/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Subscription confirmed!
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-destructive mt-2 font-mono text-sm justify-center bg-destructive/10 py-2 rounded-lg border border-destructive/20"
                  >
                    <AlertCircle className="w-4 h-4" /> {errorMessage}
                  </motion.div>
                )}
              </form>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                We protect your data. No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

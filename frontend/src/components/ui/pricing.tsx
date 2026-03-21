import { buttonVariants } from "./button";
import { Label } from "./label";
import { Switch } from "./switch";
import { useMediaQuery } from "../../hooks/use-media-query";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ["#f97316", "#ea580c", "#fb923c", "#fed7aa"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="text-lg whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center gap-3 mb-10">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Monthly</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
            />
          </Label>
        </label>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Annual <span style={{ color: 'var(--accent-primary)' }}>(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pb-8">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -16 : 0,
                    opacity: 1,
                    scale: index === 0 || index === 2 ? 0.96 : 1.0,
                  }
                : { opacity: 1, y: 0 }
            }
            viewport={{ once: true }}
            transition={{ duration: 1.2, type: 'spring', stiffness: 90, damping: 28, delay: 0.3 }}
            className={cn(
              'rounded-2xl p-6 flex flex-col relative',
              index === 0 && 'origin-right',
              index === 2 && 'origin-left'
            )}
            style={{
              backgroundColor: 'var(--card-bg)',
              border: `2px solid ${plan.isPopular ? 'var(--accent-primary)' : 'var(--card-border)'}`,
              zIndex: plan.isPopular ? 10 : 0,
            }}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center gap-1"
                style={{ backgroundColor: 'var(--accent-primary)' }}>
                <Star className="h-3.5 w-3.5 fill-white text-white" />
                <span className="text-white text-xs font-semibold">Popular</span>
              </div>
            )}

            <div className="flex-1 flex flex-col">
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-secondary)' }}>
                {plan.name}
              </p>

              <div className="mt-2 flex items-end justify-center gap-1">
                <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  <NumberFlow
                    value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                    format={{ style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                    transformTiming={{ duration: 500, easing: "ease-out" }}
                    willChange
                  />
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>/ {plan.period}</span>
                )}
              </div>

              <p className="text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mb-6 gap-2.5 flex flex-col text-left">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <hr style={{ borderColor: 'var(--card-border)' }} className="mb-4" />
                <a
                  href={plan.href}
                  className={cn(
                    buttonVariants({ variant: plan.isPopular ? "default" : "outline" }),
                    "w-full text-base font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105",
                  )}
                  style={plan.isPopular ? {
                    backgroundColor: 'var(--accent-primary)',
                    borderColor: 'var(--accent-primary)',
                    color: 'white',
                  } : {
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {plan.buttonText}
                </a>
                <p className="mt-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>{plan.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

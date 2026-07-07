"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Check } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"personal" | "education" | "business">("personal")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 animate-in fade-in duration-300 overflow-y-auto">
      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="fixed right-6 top-6 text-white/40 hover:text-white transition-colors z-10"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-5xl">
          {/* Plan Type Tabs */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setSelectedPlan("personal")}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPlan === "personal"
                  ? "bg-teal-600/20 text-teal-400 border border-teal-500/50"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setSelectedPlan("education")}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPlan === "education"
                  ? "bg-teal-600/20 text-teal-400 border border-teal-500/50"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Education
            </button>
            <button
              onClick={() => setSelectedPlan("business")}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPlan === "business"
                  ? "bg-teal-600/20 text-teal-400 border border-teal-500/50"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Business
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Pro Plan */}
            <div className="border border-white/10 rounded-xl p-8 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Pro</h3>
                <span className="px-2 py-0.5 bg-teal-600/20 text-teal-400 text-xs font-medium rounded">Popular</span>
              </div>

              <div className="mb-2">
                <span className="text-3xl font-bold text-white">$17</span>
                <span className="text-sm text-white/40"> USD / month</span>
              </div>
              <p className="text-xs text-white/40 mb-4">or equivalent, when billed annually</p>

              <p className="text-sm text-white/40 mb-6">
                Upgrade productivity and learning with additional access.
              </p>

              <Button variant="secondary" disabled className="w-full mb-6 opacity-50">
                Your current plan
              </Button>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>10x as many citations in answers</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>One subscription to the latest AI models including GPT-5.2 and Claude Sonnet 4.5</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Access to Perplexity file and app creation</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>10x daily file uploads</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Extended access to Perplexity deep research</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Extended access to image generation</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Limited access to video generation</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Exclusive access to Pro Perks and more</span>
                </li>
              </ul>

              <p className="text-xs text-white/40 mt-6">
                Existing subscriber? See{" "}
                <a href="#" className="text-white underline">
                  billing help
                </a>
              </p>
            </div>

            {/* Max Plan */}
            <div className="border border-white/10 rounded-xl p-8 bg-white/5">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white">Max</h3>
              </div>

              <div className="mb-2">
                <span className="text-3xl font-bold text-white">$167</span>
                <span className="text-sm text-white/40"> USD / month</span>
              </div>
              <p className="text-xs text-white/40 mb-4">or equivalent, when billed annually</p>

              <p className="text-sm text-white/40 mb-6">
                Unlock Perplexity's full capabilities with early access to new products.
              </p>

              <Button className="w-full mb-6 bg-teal-600 hover:bg-teal-700 text-white">Upgrade to Max</Button>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Unlimited access to advanced AI models by OpenAI and Anthropic such as Opus 4.5</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Early access to our newest products</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>100x daily file uploads</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Unlimited access to Perplexity file and app creation</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Unlimited access to Perplexity deep research</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Enhanced access to video generation</span>
                </li>
                <li className="flex items-start gap-2 text-white/80">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-teal-500" />
                  <span>Priority support</span>
                </li>
              </ul>

              <p className="text-xs text-white/40 mt-6">
                For personal use only and subject to our{" "}
                <a href="#" className="text-white underline">
                  policies
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

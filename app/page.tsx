"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Award,
  DollarSign,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
  Check
} from "lucide-react";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "How long does it take to get funded?",
      answer: "Once you pass the evaluation by hitting your profit target while following our rules, you'll receive your funded account instantly. Most traders get funded within 2-4 weeks."
    },
    {
      question: "What happens if I fail the evaluation?",
      answer: "If you violate any rules or hit the maximum drawdown, your evaluation will fail. However, you can always try again by purchasing a new challenge."
    },
    {
      question: "How often can I request payouts?",
      answer: "Payouts can be requested bi-weekly once you are a funded trader, provided you have a profitable balance."
    },
    {
      question: "Can I trade during news events?",
      answer: "Yes, we allow trading during news events. However, we recommend practicing proper risk management."
    },
    {
      question: "What is the maximum drawdown rule?",
      answer: "The maximum total drawdown is 10% of your initial account balance, and the daily drawdown limit is 5%."
    },
    {
      question: "Do I need to pay a monthly fee?",
      answer: "No, there are no monthly fees. You only pay a one-time fee for the evaluation challenge."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-black font-sans">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/Image (FundedFlips Logo).svg" alt="FundedFlips Logo" width={140} height={42} className="h-8 w-auto" priority />
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#about" className="hover:text-foreground transition-colors">About Us</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link>
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
              Resources <ChevronDown className="w-4 h-4" />
            </div>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-medium hover:text-primary transition-colors">
              Log In
            </Link>
            <Link href="/get-started" className="bg-primary hover:bg-primary-hover text-black px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto px-6 text-center pt-10 pb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
          >
            Trade Smarter.<br />
            <span className="text-primary">Get Funded.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto"
          >
            FundedFlips gives serious traders funded accounts up to $50,000. 
            Pass a simple challenge, keep 75% of your profits — no catches.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="#pricing" className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-black px-8 py-3.5 rounded-full font-semibold transition-colors text-lg">
              Get Started
            </Link>
            <Link href="#discord" className="w-full sm:w-auto bg-transparent border border-border hover:bg-card px-8 py-3.5 rounded-full font-semibold transition-colors text-lg">
              Join our Discord
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="text-2xl font-bold text-primary mb-1">$50K</div>
              <div className="text-sm text-muted">Maximum Funding</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="text-2xl font-bold text-primary mb-1">75%</div>
              <div className="text-sm text-muted">Profit Split</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="text-2xl font-bold text-primary mb-1">15K+</div>
              <div className="text-sm text-muted">Active Traders</div>
            </div>
          </motion.div>
        </section>

        {/* AS FEATURED IN */}
        <section className="py-10 border-y border-border/50 bg-card/30">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-8">As Featured In</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-xl font-bold font-serif">THE WALL STREET JOURNAL</span>
              <span className="text-xl font-bold">Bloomberg</span>
              <span className="text-xl font-bold italic text-purple-400">yahoo! finance</span>
              <span className="text-xl font-bold">TradingView</span>
              <span className="text-xl font-bold">Discord</span>
              <span className="text-xl font-bold">Bitcoin</span>
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/5">
            <Image 
              src="/PlatformPreview.svg" 
              alt="Dashboard Preview" 
              width={1200} 
              height={800} 
              className="w-full h-auto object-cover"
            />
            {/* Fallback styling in case image fails to load */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Real trading experience,<br/>without the risk.</h2>
          <p className="text-muted mb-16 max-w-2xl mx-auto">You're four steps away from harnessing your trading skills. It's simple. Here's how it works:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-2xl p-8 text-left">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Complete a challenge</h3>
              <p className="text-sm text-muted leading-relaxed">Prove your trading skills and discipline in a one or two stage challenge. Hit the profit target without hitting the drawdown limits.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-left">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Get verified</h3>
              <p className="text-sm text-muted leading-relaxed">If you choose to do a 2-step challenge, you'll need to pass the verification stage. Then, your real account is just days away.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-left">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Become a funded trader</h3>
              <p className="text-sm text-muted leading-relaxed">Congratulations! You've got a simulated funded trading account and you can keep 75% of the profits you make.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-left">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Get paid</h3>
              <p className="text-sm text-muted leading-relaxed">Our Payout frequency on our standard accounts is 14 days!</p>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS / PAYOUTS */}
        <section className="py-20 bg-card/30">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Traders, <span className="text-primary">Real Payouts</span></h2>
            <p className="text-muted mb-16">Join thousands of traders receiving weekly payouts from FundedFlips</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Payout Card 1 */}
              <div className="bg-background border border-border rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-semibold text-muted tracking-wider">PAYOUT CERTIFICATE</span>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-sm text-muted">Amount</span>
                    <span className="text-2xl font-bold text-primary">$10,103</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/50 pt-4">
                    <span className="text-sm text-muted">Status</span>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">Paid</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center font-bold">M</div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Mohammed</div>
                    <div className="text-xs text-muted">UAE</div>
                  </div>
                </div>
              </div>
              {/* Payout Card 2 */}
              <div className="bg-background border border-border rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-semibold text-muted tracking-wider">PAYOUT CERTIFICATE</span>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-sm text-muted">Amount</span>
                    <span className="text-2xl font-bold text-primary">$7,431</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/50 pt-4">
                    <span className="text-sm text-muted">Status</span>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">Paid</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center font-bold">M</div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Maria</div>
                    <div className="text-xs text-muted">Spain</div>
                  </div>
                </div>
              </div>
              {/* Payout Card 3 */}
              <div className="bg-background border border-border rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-semibold text-muted tracking-wider">PAYOUT CERTIFICATE</span>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-sm text-muted">Amount</span>
                    <span className="text-2xl font-bold text-primary">$16,523</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/50 pt-4">
                    <span className="text-sm text-muted">Status</span>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">Paid</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-900 flex items-center justify-center font-bold">L</div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Lucas</div>
                    <div className="text-xs text-muted">Germany</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10">
              <Link href="#payouts" className="bg-primary hover:bg-primary-hover text-black px-6 py-3 rounded-full font-semibold transition-colors inline-block">
                View More Payouts
              </Link>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your <span className="text-primary">Account Size</span></h2>
          <p className="text-muted mb-16">Flexible funding options to match your trading style and experience.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Starter */}
            <div className="bg-card border border-border rounded-3xl p-8 text-left">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="text-4xl font-bold text-primary mb-2">$10,000</div>
              <div className="text-sm text-muted mb-8">One-time fee: $99</div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Maximum daily loss: $500</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Maximum loss: $1,000</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Profit target: $800</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Trading period: Unlimited</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Bi-weekly payouts</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-background border border-border hover:bg-border/50 transition-colors font-semibold">Get Started</button>
            </div>

            {/* Professional (Highlighted) */}
            <div className="bg-card border-2 border-primary rounded-3xl p-8 text-left relative transform md:-translate-y-4 shadow-2xl shadow-primary/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-full text-xs font-bold tracking-wide">MOST POPULAR</div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <div className="text-4xl font-bold text-primary mb-2">$50,000</div>
              <div className="text-sm text-muted mb-8">One-time fee: $299</div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Maximum daily loss: $2,500</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Maximum loss: $5,000</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Profit target: $4,000</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Trading period: Unlimited</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Bi-weekly payouts</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> All trading instruments</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Priority support</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-black transition-colors font-semibold">Get Started</button>
            </div>

            {/* Elite */}
            <div className="bg-card border border-border rounded-3xl p-8 text-left">
              <h3 className="text-xl font-semibold mb-2">Elite</h3>
              <div className="text-4xl font-bold text-primary mb-2">$200,000</div>
              <div className="text-sm text-muted mb-8">One-time fee: $999</div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Maximum daily loss: $10,000</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Maximum loss: $20,000</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Profit target: $16,000</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Trading period: Unlimited</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Weekly payouts</li>
                <li className="flex items-center gap-3 text-sm"><Check className="w-5 h-5 text-primary" /> Dedicated account manager</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-background border border-border hover:bg-border/50 transition-colors font-semibold">Get Started</button>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-24 bg-card/30">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About <span className="text-primary">FundedFlips</span></h2>
            <p className="text-muted mb-16 max-w-3xl mx-auto">We're on a mission to empower talented traders worldwide by providing access to capital, cutting-edge technology, and a supportive community.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="bg-background border border-border rounded-2xl p-6 flex items-start gap-5 text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Transparent & Fair</h4>
                  <p className="text-sm text-muted">Clear rules, no hidden fees. We believe in honest partnerships with our traders.</p>
                </div>
              </div>
              <div className="bg-background border border-border rounded-2xl p-6 flex items-start gap-5 text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Trader-First Approach</h4>
                  <p className="text-sm text-muted">Built by traders, for traders. We understand what you need to succeed.</p>
                </div>
              </div>
              <div className="bg-background border border-border rounded-2xl p-6 flex items-start gap-5 text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Proven Track Record</h4>
                  <p className="text-sm text-muted">Over $25M paid out to successful traders worldwide since our launch.</p>
                </div>
              </div>
              <div className="bg-background border border-border rounded-2xl p-6 flex items-start gap-5 text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Growth Focused</h4>
                  <p className="text-sm text-muted">Scale your account size as you demonstrate consistent profitability.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-24">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">2020</div>
                <div className="text-sm text-muted uppercase tracking-wider">Founded</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">15K+</div>
                <div className="text-sm text-muted uppercase tracking-wider">Active Traders</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">120+</div>
                <div className="text-sm text-muted uppercase tracking-wider">Countries</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked <span className="text-primary">Questions</span></h2>
          <p className="text-muted mb-12">Everything you need to know about getting funded.</p>
          
          <div className="space-y-4 text-left">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className="font-semibold">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-muted text-sm leading-relaxed border-t border-border/30 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12">
            <p className="text-sm text-muted mb-4">Still have questions?</p>
            <Link href="#contact" className="inline-flex items-center justify-center border border-primary text-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary hover:text-black transition-colors">
              Contact Support
            </Link>
          </div>
        </section>

        {/* GET IN TOUCH */}
        <section id="contact" className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in <span className="text-primary">Touch</span></h2>
          <p className="text-muted mb-16">Have questions? Our team is here to help you succeed.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card border border-border rounded-2xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Email Us</h4>
              <p className="text-sm text-muted">support@fundedflips.com</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Live Chat</h4>
              <p className="text-sm text-muted">Chat with our team</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Office</h4>
              <p className="text-sm text-muted">123 Trading Street, NY</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Business Hours</h4>
              <p className="text-sm text-muted">Mon-Fri: 9AM - 5PM EST</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-8 text-left">
            <h3 className="text-xl font-semibold mb-6">Send us a message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Name</label>
                  <input type="text" placeholder="Your name" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Email</label>
                  <input type="email" placeholder="your@email.com" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Subject</label>
                <input type="text" placeholder="How can we help?" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Message</label>
                <textarea rows={4} placeholder="Tell us more..." className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm resize-none"></textarea>
              </div>
              <button type="button" className="w-full bg-primary hover:bg-primary-hover text-black font-semibold py-3.5 rounded-xl transition-colors mt-2">
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/50 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 border-b border-border/50 pb-16">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-8 h-8 text-primary fill-primary" />
                <span className="text-2xl font-bold">Trustpilot</span>
              </div>
              <div className="text-xl font-semibold mb-3">Excellent</div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                    <Star className="w-5 h-5 text-black fill-black" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold">TrustScore 4.5</span> | 1,204 reviews
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/Image (FundedFlips Logo).svg" alt="FundedFlips Logo" width={140} height={42} className="h-6 w-auto grayscale opacity-80" />
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Empowering traders worldwide with capital and opportunity to achieve their financial goals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-sm text-muted">
                <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Rules</Link></li>
                <li><Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm text-muted">
                <li><Link href="#about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm text-muted">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Risk Disclosure</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 text-sm text-muted">
            <p>© 2026 FundedFlips. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-primary transition-colors"><FaTwitter className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><FaLinkedin className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><FaGithub className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

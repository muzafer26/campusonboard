import Link from "next/link";
import {
  GraduationCap,
  UploadCloud,
  ShieldCheck,
  MessageCircleQuestion,
  CheckCircle2,
  FileSearch,
  ArrowRight,
  FileCheck,
  Clock,
  Users,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-navy-dark text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 sticky top-0 bg-navy-dark/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="h-7 w-7 text-accent-amber" />
            <span className="font-serif">CampusOnboard</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/80 hover:text-white px-3 py-2 rounded-md transition"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-accent-amber text-navy-dark font-semibold px-5 py-2 rounded-md hover:bg-amber-400 transition shadow-lg"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-block mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-amber bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
              Production v2.0 — May 2026
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight max-w-5xl mx-auto">
            Complete Your College Admission{" "}
            <span className="text-accent-amber">From Home</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Upload documents, track approvals, and finish your onboarding without
            a single in-person visit. Modern, secure, and built for students.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent-amber text-navy-dark font-semibold px-8 py-3.5 rounded-md hover:bg-amber-400 transition shadow-lg text-lg"
            >
              Start Registration <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-3.5 rounded-md hover:bg-white/10 transition text-lg"
            >
              I already have an account
            </Link>
          </div>

          {/* Stats Row */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-amber">9</div>
              <div className="text-sm text-white/60 uppercase tracking-wider mt-1">
                Documents Tracked
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-amber">24/7</div>
              <div className="text-sm text-white/60 uppercase tracking-wider mt-1">
                EduBot Support
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-amber">100%</div>
              <div className="text-sm text-white/60 uppercase tracking-wider mt-1">
                Paperless Process
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white text-navy-dark py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl text-navy-dark">
              Everything you need, online
            </h2>
            <p className="text-slate-600 text-lg mt-4">
              One portal for students. One dashboard for administrators. Zero paperwork.
            </p>
          </div>
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={UploadCloud}
              title="Drag-and-drop uploads"
              description="PDF, JPG, or PNG — up to 10 MB. Re-upload on rejection without losing progress."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Secure & audited"
              description="Files served only through authenticated routes. Role-based access for student and admin."
            />
            <FeatureCard
              icon={FileSearch}
              title="Real-time status"
              description="Each of your 9 documents shows pending, submitted, approved, or rejected — instantly."
            />
            <FeatureCard
              icon={MessageCircleQuestion}
              title="24/7 EduBot"
              description="Rule-based assistant answers common admission questions with zero API cost."
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Caste-certificate aware"
              description="Open-category applicants can mark the optional document as Not Applicable."
            />
            <FeatureCard
              icon={GraduationCap}
              title="Admin-first dashboard"
              description="Approve, reject, export, and import — built for college admission staff."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-50 text-navy-dark py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl text-navy-dark">
              How it works
            </h2>
            <p className="text-slate-600 text-lg mt-4">
              Getting started is simple. Follow these four steps to complete your admission.
            </p>
          </div>
          <div className="mt-16 grid md:grid-cols-4 gap-6">
            <StepCard
              number="1"
              title="Register"
              description="Use your Application/Merit Number and Date of Birth from your allotment letter."
            />
            <StepCard
              number="2"
              title="Wait for approval"
              description="Admin verifies your application and activates your account."
            />
            <StepCard
              number="3"
              title="Upload documents"
              description="Submit all 9 required documents through the guided checklist."
            />
            <StepCard
              number="4"
              title="Admission confirmed"
              description="Once all documents are approved, your admission is complete!"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-blue py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl text-white">Ready to get started?</h2>
          <p className="text-white/80 text-lg mt-4">
            Join thousands of students who have completed their admission online.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-brand-blue font-semibold px-8 py-3.5 rounded-md hover:bg-slate-100 transition shadow-lg"
            >
              Create Your Account <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-navy-dark border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
            <div>
              © {new Date().getFullYear()} CampusOnboard. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="mailto:support@campusonboard.app" className="hover:text-white transition">
                support@campusonboard.app
              </a>
              <span>|</span>
              <span>Built for TCET, B-26 Batch, BCA</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <Icon className="h-8 w-8 text-brand-blue" />
      <h3 className="mt-4 font-semibold text-lg text-navy-dark">{title}</h3>
      <p className="text-slate-600 mt-1 text-sm">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 text-center hover:shadow-md transition">
      <div className="h-12 w-12 rounded-full bg-brand-blue text-white font-bold text-xl grid place-items-center mx-auto">
        {number}
      </div>
      <h3 className="mt-4 font-semibold text-lg text-navy-dark">{title}</h3>
      <p className="text-slate-600 mt-2 text-sm">{description}</p>
    </div>
  );
}
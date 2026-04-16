import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LegalLayout = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-brand-paper min-h-screen py-20 px-4">
    <div className="container mx-auto max-w-4xl">
      <Link to="/" className="inline-flex items-center text-brand-dark/60 hover:text-brand-gold mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
        <h1 className="text-4xl font-serif font-bold mb-8 text-brand-dark">{title}</h1>
        <div className="prose prose-brand max-w-none text-brand-dark/70 space-y-6">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy">
    <p>Last updated: April 16, 2024</p>
    <section>
      <h2 className="text-2xl font-serif text-brand-dark mb-4">1. Information We Collect</h2>
      <p>We collect information you provide directly to us when you create an account, make a purchase, or subscribe to our newsletter. This includes your name, email address, shipping address, and phone number.</p>
    </section>
    <section>
      <h2 className="text-2xl font-serif text-brand-dark mb-4">2. How We Use Your Information</h2>
      <p>We use the information we collect to process your orders, provide customer support, and send you marketing communications if you have opted in. We do not sell your personal information to third parties.</p>
    </section>
    <section>
      <h2 className="text-2xl font-serif text-brand-dark mb-4">3. Data Security</h2>
      <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or disclosure.</p>
    </section>
  </LegalLayout>
);

export const TermsOfService = () => (
  <LegalLayout title="Terms of Service">
    <p>Last updated: April 16, 2024</p>
    <section>
      <h2 className="text-2xl font-serif text-brand-dark mb-4">1. Agreement to Terms</h2>
      <p>By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree to all the terms, you must not use our services.</p>
    </section>
    <section>
      <h2 className="text-2xl font-serif text-brand-dark mb-4">2. Products and Pricing</h2>
      <p>All products are subject to availability. We reserve the right to modify prices or discontinue products at any time without notice.</p>
    </section>
    <section>
      <h2 className="text-2xl font-serif text-brand-dark mb-4">3. Limitation of Liability</h2>
      <p>Aura Jewelry shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our products.</p>
    </section>
  </LegalLayout>
);

export const RefundPolicy = () => (
  <LegalLayout title="Cancellation & Refund Policy">
    <p>Last updated: April 16, 2024</p>
    <section>
      <h2 className="text-2xl font-serif text-brand-dark mb-4">1. Cancellations</h2>
      <p>Orders can be cancelled within 24 hours of placement for a full refund, provided the item has not already been shipped.</p>
    </section>
    <section>
      <h2 className="text-2xl font-serif text-brand-dark mb-4">2. Returns</h2>
      <p>We offer a 30-day return policy for unused jewelry in its original packaging. Please contact support to initiate a return request.</p>
    </section>
    <section>
      <h2 className="text-2xl font-serif text-brand-dark mb-4">3. Refunds</h2>
      <p>Once your return is received and inspected, we will process your refund within 7-10 business days. Refunds will be issued via the original payment method.</p>
    </section>
  </LegalLayout>
);

export const CustomerSupport = () => (
  <LegalLayout title="Customer Support">
    <div className="grid md:grid-cols-2 gap-8 mt-4">
      <div className="p-6 bg-brand-paper rounded-xl">
        <h2 className="text-xl font-serif mb-4">Contact Us</h2>
        <p className="mb-4">Our support team is available Monday to Friday, 9:00 AM - 6:00 PM EST.</p>
        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> support@aurajewelry.com</p>
          <p><strong>Phone:</strong> +1 (800) AURA-GLO</p>
        </div>
      </div>
      <div className="p-6 bg-brand-paper rounded-xl">
        <h2 className="text-xl font-serif mb-4">Need Quick Help?</h2>
        <p className="mb-6">Check our FAQ for instant answers to common questions about shipping and orders.</p>
        <Button className="w-full bg-brand-dark text-white rounded-full">Explore FAQ</Button>
      </div>
    </div>
  </LegalLayout>
);

import React from 'react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              About Safe Job Platform
            </h1>
            <Link
              to="/"
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-lg mx-auto">
          <div className="space-y-8">
            {/* Mission Section */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Mission</h2>
              <p className="leading-relaxed text-gray-600">
                Safe Job Platform is dedicated to creating a secure and transparent marketplace for
                temporary employment in the Netherlands. We bridge the gap between legitimate hiring
                agencies and temporary workers while prioritizing worker safety, preventing
                exploitation, and ensuring regulatory compliance.
              </p>
            </section>

            {/* What We Do */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">What We Do</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Employer Verification
                  </h3>
                  <p className="text-gray-600">
                    We thoroughly vet all employers and hiring agencies to ensure they meet Dutch
                    labor standards and maintain legitimate business practices.
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Worker Protection</h3>
                  <p className="text-gray-600">
                    Our platform includes built-in safeguards to prevent exploitation, ensure fair
                    wages, and protect workers' rights throughout their employment.
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Smart Matching</h3>
                  <p className="text-gray-600">
                    Our AI-powered system matches candidates with suitable opportunities based on
                    skills, location, and career preferences.
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Compliance Monitoring
                  </h3>
                  <p className="text-gray-600">
                    We continuously monitor compliance with Dutch labor laws and EU regulations to
                    maintain the highest standards of employment practices.
                  </p>
                </div>
              </div>
            </section>

            {/* Why Choose Us */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Why Choose Safe Job?</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2 text-primary-600">✓</span>
                  <span>Verified employers with proven track records</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary-600">✓</span>
                  <span>Transparent job postings with clear terms and conditions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary-600">✓</span>
                  <span>Fair wage guarantees and timely payments</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary-600">✓</span>
                  <span>24/7 support for workers and employers</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary-600">✓</span>
                  <span>Continuous improvement based on user feedback</span>
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section className="rounded-lg bg-primary-50 p-6">
              <h2 className="mb-4 text-2xl font-bold text-primary-900">Get Started Today</h2>
              <p className="mb-6 text-primary-700">
                Join thousands of workers and employers who trust Safe Job Platform for secure,
                transparent temporary employment opportunities.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                >
                  Sign Up Now
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-md border border-primary-300 bg-white px-4 py-2 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50"
                >
                  Sign In
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

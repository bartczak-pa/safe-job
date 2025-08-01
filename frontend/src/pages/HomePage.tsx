import React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Safe Job</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Connect with
            <span className="text-primary-600"> Safe Employment</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Connect legitimate hiring agencies with temporary workers in the
            Netherlands. Focus on worker safety, exploitation prevention, and
            regulatory compliance.
          </p>
          <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-8 py-3 text-base font-medium text-white hover:bg-primary-700 md:px-10 md:py-4 md:text-lg"
              >
                Get Started
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:ml-3 sm:mt-0">
              <Link
                to="/about"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-primary-600 hover:bg-gray-50 md:px-10 md:py-4 md:text-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base font-semibold uppercase tracking-wide text-primary-600">
              Features
            </h2>
            <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
              Safe, Verified, Connected
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10 md:space-y-0">
              <div className="relative">
                <div className="card text-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Verified employers
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    All employers go through a rigorous verification process to
                    ensure legitimacy.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="card text-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Worker Protection
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    Built-in safeguards to prevent exploitation and ensure fair
                    treatment.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="card text-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Smart Matching
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    AI-powered matching system connects candidates with suitable
                    opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

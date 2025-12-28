import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Find Your Next Opportunity
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Connect with top companies and advance your career
          </p>
          {!user ? (
            <div className="space-x-4">
              <Link
                to="/login"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Get Started
              </Link>
              <Link
                to="/jobs"
                className="inline-block bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <Link
              to="/jobs"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              View Jobs
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Why Choose JobPortal?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-blue-500 transition">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Smart Search
              </h3>
              <p className="text-gray-400">
                Find jobs that match your skills and preferences with our
                intelligent search and filtering system.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-blue-500 transition">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Easy Applications
              </h3>
              <p className="text-gray-400">
                Apply to jobs with just one click. Track all your applications
                in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-blue-500 transition">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Quick Hiring
              </h3>
              <p className="text-gray-400">
                For recruiters, post jobs and review qualified candidates
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-800 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
              <p className="text-gray-400">Job Listings</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
              <p className="text-gray-400">Companies</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">10k+</div>
              <p className="text-gray-400">Job Seekers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-gray-800 rounded-lg p-12 border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of job seekers and find your dream job today.
          </p>
          {!user ? (
            <Link
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Sign Up Now
            </Link>
          ) : (
            <Link
              to={user.role === "recruiter" ? "/recruiter-dashboard" : "/candidate-dashboard"}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

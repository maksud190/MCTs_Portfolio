import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "../api/api";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const [stats, setStats] = useState({
    projects: 0,
    users: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        API.get("/projects"),
        API.get("/users/all"),
      ]);

      setStats({
        projects: projectsRes.data.length || 0,
        users: usersRes.data.length || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return (
    <footer className="relative bg-neutral-900 border-t border-gray-200 ">
      {/* Top Stats Banner */}
      <div className="relative -mt-16 mb-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
              <div className="group">
                <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">
                  {stats.projects}+
                </div>
                <div className="text-sm font-medium opacity-90">Projects</div>
              </div>
              <div className="group">
                <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">
                  {stats.users}+
                </div>
                <div className="text-sm font-medium opacity-90">Creators</div>
              </div>
              <div className="group">
                <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">
                  50+
                </div>
                <div className="text-sm font-medium opacity-90">Views</div>
              </div>
              <div className="group">
                <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">
                  10+
                </div>
                <div className="text-sm font-medium opacity-90">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column - Larger */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                <span className="text-2xl font-black text-white">M</span>
              </div>
              <div>
                <div className="text-xl font-black text-white">
                  MCT's Portfolio
                </div>
                <div className="text-xs text-stone-400">
                  Showcase Your Creativity
                </div>
              </div>
            </a>

            <p className="text-sm text-stone-300 mb-6 leading-relaxed max-w-sm">
              The ultimate platform for Multimedia & Creative Technology
              students to showcase their work and connect with the creative
              community.
            </p>

            {/* Social Media - Modern Pills */}
            <div className="flex flex-wrap gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 hover:!text-stone-800 !text-stone-100 rounded-full text-sm font-medium transition-all"
              >
                Facebook
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 hover:!text-stone-800 !text-stone-100 rounded-full text-sm font-medium transition-all"
              >
                Twitter
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 hover:!text-stone-800 !text-stone-100 rounded-full text-sm font-medium transition-all"
              >
                Instagram
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 hover:!text-stone-800 !text-stone-100 rounded-full text-sm font-medium transition-all"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-stone-100 mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-3 list-none">
              {[
                { to: "/", label: "Home" },
                { to: "/profiles", label: "Browse Creators" },
                { to: "/upload", label: "Upload Project" },
                { to: "/profile", label: "My Profile" },
              ].map((link) => (
                <li key={link.to}>
                  <a
                    href={link.to}
                    className="text-sm font-medium !text-stone-100 hover:text-blue-600 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5  rounded-full group-hover:bg-blue-600 transition-colors"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-stone-100 mb-4 uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-3 list-none">
              {[
                "3D Modeling",
                "Graphics Design",
                "Web Development",
                "Photography",
                "Video Production",
              ].map((cat) => (
                <li key={cat}>
                  <a
                    href={`/?category=${cat}`}
                    className="text-sm font-medium !text-stone-100 hover:text-blue-600 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5  rounded-full group-hover:bg-blue-600 transition-colors"></span>
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-stone-100 mb-4 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-3 mb-6 !list-none">
              {[
                "Help Center",
                "Guidelines",
                "Privacy Policy",
                "Terms of Use",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm font-medium !text-stone-100 hover:text-blue-600 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5  rounded-full group-hover:bg-blue-600 transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            {/* Contact Email */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4">
              <div className="text-xs font-semibold text-stone-100 mb-2">
                Get in Touch
              </div>
              <a
                href="mailto:support@mctportfolio.com"
                className="text-sm !text-stone-300 hover:!text-stone-800 font-medium break-all"
              >
                support@mctportfolio.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-stone-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-stone-300">
              © {currentYear} MCT's Portfolio. All rights reserved.
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Made by</span>
              <a href="https://www.facebook.com/maksud190" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                <span className="text-amber-300 text-md animate-pulse">
                  
                  Maksudur Rahaman
                </span>
              </a>
              {/* <span className="text-red-500 text-lg animate-pulse">♥</span>
              <span className="text-xs text-stone-400">by MCT Students</span> */}
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                v1.0
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
        aria-label="Back to top"
      >
        <svg
          className="w-6 h-6 group-hover:-translate-y-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </footer>
  );
}

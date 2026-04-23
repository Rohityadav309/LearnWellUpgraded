import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

import learnWellLogo from "../../assets/Logo/Logo-Full-Light.png";

const footerSections = [
  {
    title: "Platform",
    links: [
      "Learning paths",
      "Mentor sessions",
      "Team learning",
      "Creator tools",
    ],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Roadmap", "Privacy"],
  },
  {
    title: "Resources",
    links: ["Playbooks", "Case studies", "Guides", "Community"],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-richblack-900">
      <div className="mx-auto grid w-11/12 max-w-maxContent gap-12 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <img src={learnWellLogo} alt="LearnWell" className="h-20 w-32" />
          <div className="max-w-xl space-y-4">
            <p className="text-2xl font-semibold text-richblack-5">
              LearnWell is Rohit Yadav&apos;s modern learning workspace for
              focused, practical growth.
            </p>
            <p className="text-sm leading-7 text-richblack-300">
              Designed for students and instructors who want a cleaner, calmer,
              and more effective digital learning experience.
            </p>
          </div>

          <div className="flex items-center gap-3 text-richblack-300">
            <a
              href="https://github.com"
              className="rounded-full border border-white/10 p-3 transition hover:border-white/20 hover:text-richblack-5"
            >
              <FaGithub />
            </a>
            <a
              href="https://linkedin.com"
              className="rounded-full border border-white/10 p-3 transition hover:border-white/20 hover:text-richblack-5"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://instagram.com"
              className="rounded-full border border-white/10 p-3 transition hover:border-white/20 hover:text-richblack-5"
            >
              <FaInstagram />
            </a>
            <a
              href="https://x.com"
              className="rounded-full border border-white/10 p-3 transition hover:border-white/20 hover:text-richblack-5"
            >
              <FaTwitter />
            </a>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-richblack-100">
                {section.title}
              </h3>
              <div className="mt-5 space-y-3">
                {section.links.map((item) => (
                  <Link
                    key={item}
                    to={
                      item === "About"
                        ? "/about"
                        : item === "Contact"
                          ? "/contact"
                          : "/"
                    }
                    className="block text-sm text-richblack-300 transition hover:text-richblack-5"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col gap-3 py-5 text-sm text-richblack-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 LearnWell. Designed and authored by Rohit Yadav.</p>
          <p>Focused learning, polished workflow, modern code.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

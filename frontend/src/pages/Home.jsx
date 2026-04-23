import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useEffect, useState } from "react";

import bannerVideo from "../assets/Images/banner.mp4";
import Footer from "../components/common/Footer.jsx";
import CourseSlider from "../components/core/Catalog/CourseSlider.jsx";
import { getStudentVisibleCourses } from "../services/operations/courseDetailsAPI";

const learningSignals = [
  { value: "12K+", label: "active learners building weekly consistency" },
  { value: "140+", label: "project-first lessons across focused tracks" },
  { value: "91%", label: "learners reporting better momentum in 30 days" },
];

const featureCards = [
  {
    title: "Structured roadmaps",
    description:
      "Move from basics to advanced work through guided paths with practical milestones, not scattered playlists.",
  },
  {
    title: "Mentor-style clarity",
    description:
      "Each lesson is designed to remove friction, explain the why, and help you keep building with confidence.",
  },
  {
    title: "Progress you can feel",
    description:
      "Track lessons, revisit weak areas, and continue learning without losing context across devices.",
  },
];

const curatedTracks = [
  "Frontend systems",
  "Backend foundations",
  "Data structures",
  "Interview prep",
  "Creator-led cohorts",
  "Team upskilling",
];

const Home = () => {
  const [studentVisibleCourses, setStudentVisibleCourses] = useState([]);

  useEffect(() => {
    const loadStudentVisibleCourses = async () => {
      const response = await getStudentVisibleCourses();
      setStudentVisibleCourses(response || []);
    };

    loadStudentVisibleCourses();
  }, []);

  return (
    <>
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,214,10,0.15),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(17,138,178,0.18),_transparent_28%)]" />
          <div className="relative mx-auto grid w-11/12 max-w-maxContent gap-16 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-richblack-100 backdrop-blur">
                <HiSparkles className="text-yellow-25" />
                Modern learning platform by Rohit Yadav
              </div>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-richblack-5 md:text-6xl">
                  Learn with calm focus, modern tools, and a platform that feels
                  handcrafted.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-richblack-300">
                  LearnWell helps students and instructors work through
                  meaningful learning paths, cleaner dashboards, and a premium
                  experience that feels current in every detail.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-50 to-yellow-25 px-6 py-3.5 text-sm font-semibold text-richblack-900 shadow-lg shadow-yellow-50/20 transition hover:scale-[1.01]"
                >
                  Start learning free
                  <FaArrowRight />
                </Link>

                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3.5 text-sm font-semibold text-richblack-25 transition hover:border-white/20 hover:bg-white/5"
                >
                  See the LearnWell story
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                {learningSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                  >
                    <p className="text-3xl font-semibold text-richblack-5">
                      {signal.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-richblack-300">
                      {signal.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 scale-95 rounded-[2rem] bg-gradient-to-tr from-blue-200/20 via-transparent to-yellow-25/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-richblack-800/70 p-3 shadow-2xl shadow-richblack-900/50 backdrop-blur-xl">
                <video
                  className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                >
                  <source src={bannerVideo} type="video/mp4" />
                </video>
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-richblack-300">
                      Student flow
                    </p>
                    <p className="mt-3 text-lg font-semibold text-richblack-5">
                      Continue learning without losing context.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-richblack-300">
                      Instructor mode
                    </p>
                    <p className="mt-3 text-lg font-semibold text-richblack-5">
                      Launch polished course experiences faster.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-11/12 max-w-maxContent py-8 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[2rem] border border-white/10 bg-richblack-800/60 p-8 shadow-xl shadow-richblack-900/20 backdrop-blur-sm"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-yellow-25">
                  Why LearnWell
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-richblack-5">
                  {card.title}
                </h2>
                <p className="mt-4 leading-7 text-richblack-300">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-11/12 max-w-maxContent gap-12 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
              Built for modern momentum
            </p>
            <h2 className="text-4xl font-semibold leading-tight text-richblack-5">
              A cleaner path from curiosity to consistent results.
            </h2>
            <p className="text-base leading-8 text-richblack-300">
              LearnWell replaces noisy templates and outdated flows with a
              product experience that feels intentional—clear navigation,
              stronger hierarchy, personal branding, and smoother progression
              through every course surface.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {curatedTracks.map((track) => (
              <div
                key={track}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/6 to-white/[0.02] p-6 text-richblack-100"
              >
                <p className="text-lg font-medium text-richblack-5">{track}</p>
                <p className="mt-2 text-sm leading-6 text-richblack-300">
                  Purpose-built lessons and workflows designed for steady,
                  real-world progress.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-11/12 max-w-maxContent py-8 lg:py-16">
          <div className="mb-6 flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-yellow-25">
              Explore courses
            </p>
            <h2 className="text-3xl font-semibold text-richblack-5">
              Courses students can view now
            </h2>
            <p className="text-richblack-300">
              This section helps students discover available courses directly
              from the home page.
            </p>
          </div>

          <CourseSlider Courses={studentVisibleCourses} />
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;

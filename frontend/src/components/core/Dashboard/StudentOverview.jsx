import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import IconBtn from "../../common/IconBtn";
import EmptyState from "./common/EmptyState";
import StatCard from "./common/StatCard";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";

const StudentOverview = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadStudentCourses = async () => {
      setLoading(true);
      const result = await getUserEnrolledCourses(token);
      setCourses(Array.isArray(result) ? result : []);
      setLoading(false);
    };

    loadStudentCourses();
  }, [token]);

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      (course) => Number(course.progressPercentage || 0) >= 100,
    ).length;
    const averageProgress =
      totalCourses > 0
        ? Math.round(
            courses.reduce(
              (sum, course) => sum + Number(course.progressPercentage || 0),
              0,
            ) / totalCourses,
          )
        : 0;

    const totalLessons = courses.reduce((sum, course) => {
      const lessonCount = (course.courseContent || []).reduce(
        (sectionSum, section) => sectionSum + (section.subSection?.length || 0),
        0,
      );

      return sum + lessonCount;
    }, 0);

    return {
      totalCourses,
      completedCourses,
      averageProgress,
      totalLessons,
    };
  }, [courses]);

  const recentCourses = courses.slice(0, 3);

  return (
    <div className="space-y-8 text-richblack-5">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-6 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-richblack-300">
            Student Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-richblack-300">
            Track your enrolled courses, monitor completion, and jump back into
            the next lesson quickly.
          </p>
        </div>
        <IconBtn
          text="View Enrolled Courses"
          onclick={() => navigate("/dashboard/enrolled-courses")}
        />
      </div>

      {loading ? (
        <div className="grid min-h-[300px] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No enrolled courses yet"
          description="Your student dashboard is ready. Once you enroll in a course, your learning progress, durations, and quick resume actions will appear here."
          action={
            <IconBtn text="Browse Courses" onclick={() => navigate("/")} />
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Enrolled Courses" value={stats.totalCourses} />
            <StatCard
              label="Completed Courses"
              value={stats.completedCourses}
            />
            <StatCard
              label="Average Progress"
              value={`${stats.averageProgress}%`}
              valueClassName="text-yellow-50"
            />
            <StatCard label="Total Lessons" value={stats.totalLessons} />
          </div>

          <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Continue Learning</h2>
                <p className="mt-1 text-sm text-richblack-300">
                  Your most recent courses based on current enrollment data.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/enrolled-courses")}
                className="text-sm font-semibold text-yellow-50"
              >
                View all
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {recentCourses.map((course) => {
                const firstSection = course.courseContent?.[0];
                const firstSubSection = firstSection?.subSection?.[0];
                const canResume = Boolean(
                  course._id && firstSection?._id && firstSubSection?._id,
                );

                return (
                  <div
                    key={course._id}
                    className="flex h-full flex-col overflow-hidden rounded-xl border border-richblack-700 bg-richblack-900"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-44 w-full object-cover"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-semibold text-richblack-5">
                        {course.courseName}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-richblack-300">
                        {course.courseDescription}
                      </p>

                      <div className="mt-4 space-y-2 text-sm text-richblack-300">
                        <p>
                          Duration: {course.totalDuration || "Not available"}
                        </p>
                        <p>Progress: {course.progressPercentage || 0}%</p>
                      </div>

                      <div className="mt-5">
                        <IconBtn
                          text={
                            canResume ? "Resume Course" : "Open Course List"
                          }
                          onclick={() =>
                            canResume
                              ? navigate(
                                  `/view-course/${course._id}/section/${firstSection._id}/sub-section/${firstSubSection._id}`,
                                )
                              : navigate("/dashboard/enrolled-courses")
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentOverview;

const ClassroomHeader = ({
  courseName,
  completedLectures,
  totalNoOfLectures,
}) => {
  const progressPercentage = totalNoOfLectures
    ? Math.round((completedLectures / totalNoOfLectures) * 100)
    : 0;

  return (
    <div className="mb-6 rounded-xl border border-richblack-700 bg-richblack-800 p-5 text-richblack-5">
      <p className="text-sm font-medium uppercase tracking-wider text-richblack-300">
        Personal Classroom
      </p>
      <h1 className="mt-2 text-2xl font-semibold">
        {courseName || "Course Classroom"}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-richblack-300">
        <span>
          Completed {completedLectures} of {totalNoOfLectures} lectures
        </span>
        <span className="rounded-full bg-richblack-900 px-3 py-1 font-semibold text-yellow-50">
          {progressPercentage}% done
        </span>
      </div>
    </div>
  );
};

export default ClassroomHeader;

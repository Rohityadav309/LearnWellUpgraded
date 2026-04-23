import { useNavigate } from "react-router-dom";

import IconBtn from "../../common/IconBtn";

const InstructorDetailsCard = ({
  instructor,
  totalCourses = 0,
  totalStudents = 0,
}) => {
  const navigate = useNavigate();

  if (!instructor) {
    return null;
  }

  const fullName =
    `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim();

  return (
    <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <img
          src={
            instructor.image ||
            `https://api.dicebear.com/5.x/initials/svg?seed=${fullName || "Instructor"}`
          }
          alt={fullName}
          className="h-24 w-24 rounded-full object-cover"
        />

        <div className="flex-1">
          <p className="text-sm font-medium uppercase tracking-wider text-richblack-300">
            Teacher Profile
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-richblack-5">
            {fullName}
          </h3>
          <p className="mt-3 text-sm leading-6 text-richblack-300">
            {instructor?.additionalDetails?.about ||
              "This instructor has not added a public bio yet."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-richblack-900 p-4">
              <p className="text-xs text-richblack-400">Courses</p>
              <p className="mt-1 text-xl font-semibold text-richblack-5">
                {totalCourses}
              </p>
            </div>
            <div className="rounded-lg bg-richblack-900 p-4">
              <p className="text-xs text-richblack-400">Students</p>
              <p className="mt-1 text-xl font-semibold text-richblack-5">
                {totalStudents}
              </p>
            </div>
            <div className="rounded-lg bg-richblack-900 p-4">
              <p className="text-xs text-richblack-400">Contact</p>
              <p className="mt-1 break-all text-sm font-medium text-richblack-5">
                {instructor?.email || "Private"}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <IconBtn
              text="Explore More Courses"
              onclick={() => navigate("/")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailsCard;

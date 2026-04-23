import RatingStars from "../../common/RatingStars";

const CourseReviewsSection = ({ ratingAndReviews = [] }) => {
  if (!ratingAndReviews.length) {
    return (
      <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
        <h2 className="text-2xl font-semibold text-richblack-5">
          Student Reviews
        </h2>
        <p className="mt-3 text-sm text-richblack-300">
          This course has no reviews yet. Once students rate the course, reviews
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-richblack-5">
            Student Reviews
          </h2>
          <p className="mt-2 text-sm text-richblack-300">
            Real feedback from enrolled learners for this course.
          </p>
        </div>
        <div className="rounded-lg bg-richblack-900 px-4 py-2 text-sm font-medium text-richblack-100">
          {ratingAndReviews.length} review
          {ratingAndReviews.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {ratingAndReviews.map((review) => (
          <div
            key={review._id}
            className="rounded-xl border border-richblack-700 bg-richblack-900 p-5"
          >
            <div className="flex items-start gap-4">
              <img
                src={
                  review?.user?.image ||
                  `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName || "Learner"} ${review?.user?.lastName || ""}`
                }
                alt={`${review?.user?.firstName || "Student"} profile`}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-base font-semibold text-richblack-5">
                      {review?.user?.firstName} {review?.user?.lastName}
                    </p>
                    <p className="text-xs text-richblack-400">
                      Verified learner review
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-yellow-50">
                      {Number(review?.rating || 0).toFixed(1)}
                    </span>
                    <RatingStars
                      Review_Count={Number(review?.rating || 0)}
                      Star_Size={18}
                    />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-richblack-100">
                  {review?.review}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseReviewsSection;

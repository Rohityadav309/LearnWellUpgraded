const StatCard = ({
  label,
  value,
  subtext,
  valueClassName = "text-richblack-5",
}) => {
  return (
    <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
      <p className="text-sm font-medium text-richblack-300">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${valueClassName}`}>{value}</p>
      {subtext ? (
        <p className="mt-2 text-xs text-richblack-400">{subtext}</p>
      ) : null}
    </div>
  );
};

export default StatCard;

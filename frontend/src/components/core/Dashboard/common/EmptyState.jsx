const EmptyState = ({ title, description, action }) => {
  return (
    <div className="rounded-xl border border-dashed border-richblack-600 bg-richblack-800/60 p-8 text-center">
      <h3 className="text-xl font-semibold text-richblack-5">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-richblack-300">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
};

export default EmptyState;

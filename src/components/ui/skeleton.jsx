import React from "react";

const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
};

// Card skeleton for dashboard stats
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-[10px]">
        <Skeleton className="h-[40px] w-[40px] rounded-[8px]" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-[40px] w-[170px] rounded-[10px]" />
    </div>
    <div className="flex items-end justify-between">
      <div>
        <Skeleton className="h-8 w-16 mb-1" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  </div>
);

// Table skeleton for companies list
export const TableSkeleton = ({ rows = 5, columns = 7 }) => (
  <div className="bg-white rounded-lg  w-full border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white border-b border-gray-200">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3  text-left">
                <Skeleton className="h-4 w-20 xs:h-[20px] xs:w-[20px]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 xs:h-[10px] xs:w-[10px] whitespace-nowrap"
                >
                  {colIndex === 0 ? (
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : colIndex === columns - 1 ? (
                    <Skeleton className="h-8 w-20 rounded-[8px] xs:h-[20px] xs:w-[20px]" />
                  ) : (
                    <Skeleton className="h-4 w-16 xs:h-[20px] xs:w-[20px]" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Chart skeleton for pie chart
export const ChartSkeleton = () => (
  <div className="bg-white rounded-lg flex-1 p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="flex items-center space-x-6">
      <div className="flex-1">
        <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto" />
      </div>
      <div className="flex-1 space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// System overview skeleton
export const SystemOverviewSkeleton = () => (
  <div className="bg-white rounded-lg w-[420px] p-6 border border-gray-200">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-8" />
        </div>
      ))}
    </div>
  </div>
);

// Quick actions skeleton
export const QuickActionsSkeleton = () => (
  <div className="w-[300px] bg-white rounded-lg p-6 border border-gray-200">
    <Skeleton className="h-6 w-24 mb-4" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3">
          <Skeleton className="h-[40px] w-[40px] rounded-[8px]" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Form skeleton for onboarding wizard
export const FormSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index}>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-[56px] w-full rounded-[10px]" />
      </div>
    ))}
  </div>
);

// Step indicator skeleton
export const StepIndicatorSkeleton = () => (
  <div className="flex items-center gap-4 mb-8 w-full">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex items-center">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="h-4 w-16 ml-2 mr-4" />
        {index < 2 && <Skeleton className="w-[400px] h-[2px]" />}
      </div>
    ))}
  </div>
);

// Summary stats skeleton
export const SummaryStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="bg-white p-4 rounded-lg border border-gray-200"
      >
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-12" />
      </div>
    ))}
  </div>
);

export default Skeleton;

export function SkeletonText({ width = '100%', className = '' }) {
  return (
    <div
      className={`skeleton skeleton-text ${className}`}
      style={{ width }}
    />
  );
}

export function SkeletonTitle({ width = '60%', className = '' }) {
  return (
    <div
      className={`skeleton skeleton-title ${className}`}
      style={{ width }}
    />
  );
}

export function SkeletonAvatar({ size = '3rem', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
}

export function SkeletonCard({ height = '200px', className = '' }) {
  return (
    <div
      className={`skeleton skeleton-card ${className}`}
      style={{ height }}
    />
  );
}

export function SkeletonButton({ width = '120px', className = '' }) {
  return (
    <div
      className={`skeleton skeleton-button ${className}`}
      style={{ width }}
    />
  );
}

// Skeleton for exam cards
export function ExamCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 p-6 h-32" />
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-4 w-12 rounded" />
          </div>
        </div>
        <div className="skeleton h-12 w-full rounded-xl mt-4" />
      </div>
    </div>
  );
}

// Skeleton for dashboard stats
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-8 w-16 rounded" />
            </div>
            <div className="skeleton w-14 h-14 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for table rows
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }, (_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="skeleton h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}

export default {
  SkeletonText,
  SkeletonTitle,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonButton,
  ExamCardSkeleton,
  DashboardStatsSkeleton,
  TableRowSkeleton
};

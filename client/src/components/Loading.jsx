export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 animate-fadeIn">
      <div className="text-center animate-scaleIn">
        <div className="relative">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
        </div>
        <p className="text-xl text-gray-700 font-semibold text-gradient">{message}</p>
      </div>
    </div>
  );
}

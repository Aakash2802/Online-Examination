export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          Designed & Developed by{' '}
          <span className="font-semibold text-white hover:text-blue-400 transition-colors cursor-pointer">
            Aakash
          </span>{' '}
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

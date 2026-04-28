export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-gray-50 shadow-lg min-h-screen relative flex flex-col">
        {children}
      </div>
    </div>
  );
}

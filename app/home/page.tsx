// /app/page.tsx
import ScanForm from "@/components/ScanForm";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Security Vulnerability Scanner
        </h1>
        <ScanForm />
      </div>
    </div>
  );
}

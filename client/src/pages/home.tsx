import { useEffect, useState } from "react";
import { RegistrationForm } from "@/components/registration-form";
import { QueueDisplay } from "@/components/queue-display";
import { getCurrentTime } from "@/lib/utils";
import { CalendarCheck, Settings } from "lucide-react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <CalendarCheck className="text-blue-600 h-8 w-8" />
              <h1 className="text-2xl font-bold text-gray-900">Activity Center</h1>
              <span className="text-sm text-gray-500 hidden md:block">Queue Management System</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span>{currentTime}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RegistrationForm />
          </div>
          <div className="lg:col-span-2">
            <QueueDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}

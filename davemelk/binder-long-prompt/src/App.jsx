import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";
import WeekTabs from "./components/WeekTabs";
import ScheduleTable from "./components/ScheduleTable";

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <ProtectedRoute>
          <WeekTabs />
          <ScheduleTable />
        </ProtectedRoute>
      </main>
    </div>
  );
}

export default App;

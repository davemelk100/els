import { ScheduleTable } from "@/components/schedule/schedule-table";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Weekly Schedule</h1>
        <ScheduleTable />
      </div>
    </main>
  );
}
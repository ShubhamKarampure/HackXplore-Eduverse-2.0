
import { Card } from "../ui/card"
import CourseHeader from "./dashboard/course-header"
import ModuleList from "./dashboard/module-list"
import EngagementChart from "./dashboard/stats/engagement-chart"
import CompletionHeatmap from "./dashboard/stats/completion-heatmap"
import ProgressChart from "./dashboard/stats/progress-chart"
import ResourceUsage from "./dashboard/stats/resource-usage"
import StudentActivity from "./dashboard/stats/student-activity"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Course Dashboard</h1>

        <CourseHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 shadow-md w-full min-h-[300px] overflow-auto">
  <h2 className="text-xl font-semibold mb-4">Student Engagement</h2>
            <EngagementChart />
          </Card>

<Card className="p-6 shadow-md w-full min-h-[300px] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Resource Usage</h2>
            <ResourceUsage />
          </Card>
        </div>

        <div className="mt-8">
          <Card className="p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Module Completion Heatmap</h2>
            <CompletionHeatmap />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Learning Progress</h2>
            <ProgressChart />
          </Card>

          <Card className="p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Student Activity</h2>
            <StudentActivity />
          </Card>
        </div>

        <div className="mt-8">
          <Card className="p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Course Modules</h2>
            <ModuleList />
          </Card>
        </div>
      </div>
    </div>
  )
}


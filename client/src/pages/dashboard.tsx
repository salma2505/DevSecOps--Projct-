import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricCard from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Chart from "chart.js/auto";

const Dashboard = () => {
  const { 
    data: stats,
    isLoading,
    error
  } = useQuery({
    queryKey: ["/api/stats/dashboard"],
  });

  const distributionChartRef = useRef<HTMLCanvasElement | null>(null);
  const trendsChartRef = useRef<HTMLCanvasElement | null>(null);
  const distributionChartInstance = useRef<Chart | null>(null);
  const trendsChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (stats && distributionChartRef.current) {
      // Destroy existing chart instance if it exists
      if (distributionChartInstance.current) {
        distributionChartInstance.current.destroy();
      }

      const ctx = distributionChartRef.current.getContext('2d');
      if (ctx) {
        distributionChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
            datasets: [{
              data: [
                stats.statusDistribution.open,
                stats.statusDistribution["in-progress"],
                stats.statusDistribution.resolved,
                stats.statusDistribution.closed
              ],
              backgroundColor: ['#6b7280', '#3b82f6', '#10b981', '#1e293b'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }
        });
      }
    }
  }, [stats, distributionChartRef]);

  useEffect(() => {
    if (stats && stats.trends && trendsChartRef.current) {
      // Destroy existing chart instance if it exists
      if (trendsChartInstance.current) {
        trendsChartInstance.current.destroy();
      }

      const ctx = trendsChartRef.current.getContext('2d');
      if (ctx) {
        trendsChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: stats.trends.map((trend: any) => trend.date),
            datasets: [{
              label: 'Created',
              data: stats.trends.map((trend: any) => trend.created),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4
            }, {
              label: 'Resolved',
              data: stats.trends.map((trend: any) => trend.resolved),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 5
                }
              }
            }
          }
        });
      }
    }
  }, [stats, trendsChartRef]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6">
            <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Overview of incident management metrics and status</p>
            
            {isLoading ? (
              <div className="flex justify-center mt-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-md">
                Error loading dashboard data. Please try again later.
              </div>
            ) : (
              <>
                {/* Metric Cards */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Incidents"
                    value={stats?.totalIncidents || 0}
                    iconColor="primary"
                    iconName="plus"
                    trend="8% increase from last month"
                    trendUp={true}
                  />
                  <MetricCard
                    title="Open Incidents"
                    value={stats?.openIncidents || 0}
                    iconColor="amber"
                    iconName="alert-triangle"
                    trend={`${stats?.openIncidents - 19 || 0} more than yesterday`}
                    trendUp={stats?.openIncidents > 19}
                  />
                  <MetricCard
                    title="Critical Incidents"
                    value={stats?.criticalIncidents || 0}
                    iconColor="red"
                    iconName="alert-circle"
                    trend="3 require immediate attention"
                    trendType="neutral"
                  />
                  <MetricCard
                    title="Resolved This Week"
                    value={stats?.resolvedThisWeek || 0}
                    iconColor="emerald"
                    iconName="check"
                    trend="12% increase from last week"
                    trendUp={true}
                  />
                </div>

                {/* Charts and Recent Incidents */}
                <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Recent Incidents Table */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Recent Incidents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">#INC-1092</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">Database connection failure</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="priority-critical">Critical</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="status-in-progress">In Progress</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">#INC-1091</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">Payment gateway error</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="priority-high">High</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="status-open">Open</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">#INC-1090</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">User login issues</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="priority-medium">Medium</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="status-resolved">Resolved</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">#INC-1089</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">UI rendering issues in Safari</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="priority-low">Low</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="status-resolved">Resolved</Badge>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">#INC-1088</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">API rate limiting exceeded</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="priority-medium">Medium</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="status-closed">Closed</Badge>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Distribution Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Incident Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div style={{ height: "240px" }}>
                        <canvas ref={distributionChartRef} height="240"></canvas>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Time-Based Trends */}
                <div className="mt-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Incident Trends (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div style={{ height: "240px" }}>
                        <canvas ref={trendsChartRef} height="240"></canvas>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

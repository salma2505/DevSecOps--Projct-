import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from "chart.js/auto";
import { priorityLabels, categoryLabels } from "@shared/schema";

const Analytics = () => {
  const { 
    data: analytics,
    isLoading,
    error
  } = useQuery({
    queryKey: ["/api/stats/analytics"],
  });

  const priorityChartRef = useRef<HTMLCanvasElement | null>(null);
  const categoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const resolutionTimeChartRef = useRef<HTMLCanvasElement | null>(null);
  
  const priorityChartInstance = useRef<Chart | null>(null);
  const categoryChartInstance = useRef<Chart | null>(null);
  const resolutionTimeChartInstance = useRef<Chart | null>(null);

  // Initialize and update charts when data changes
  useEffect(() => {
    if (analytics && priorityChartRef.current) {
      // Destroy existing chart instance if it exists
      if (priorityChartInstance.current) {
        priorityChartInstance.current.destroy();
      }

      const ctx = priorityChartRef.current.getContext('2d');
      if (ctx) {
        priorityChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(analytics.byPriority).map(key => priorityLabels[key]),
            datasets: [{
              label: 'Number of Incidents',
              data: Object.values(analytics.byPriority),
              backgroundColor: ['#dc2626', '#ea580c', '#f59e0b', '#65a30d']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  }, [analytics, priorityChartRef]);

  useEffect(() => {
    if (analytics && categoryChartRef.current) {
      // Destroy existing chart instance if it exists
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }

      const ctx = categoryChartRef.current.getContext('2d');
      if (ctx) {
        categoryChartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: Object.keys(analytics.byCategory).map(key => categoryLabels[key]),
            datasets: [{
              data: Object.values(analytics.byCategory),
              backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6b7280']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
    }
  }, [analytics, categoryChartRef]);

  useEffect(() => {
    if (analytics && resolutionTimeChartRef.current) {
      // Destroy existing chart instance if it exists
      if (resolutionTimeChartInstance.current) {
        resolutionTimeChartInstance.current.destroy();
      }

      const ctx = resolutionTimeChartRef.current.getContext('2d');
      if (ctx) {
        resolutionTimeChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(analytics.resolutionTime).map(key => priorityLabels[key]),
            datasets: [{
              label: 'Average Hours to Resolution',
              data: Object.values(analytics.resolutionTime),
              backgroundColor: '#3b82f6'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Hours'
                }
              }
            }
          }
        });
      }
    }
  }, [analytics, resolutionTimeChartRef]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6">
            <h1 className="text-2xl font-semibold text-slate-800">Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">Visualize incident data to identify trends and improve response times.</p>
            
            {isLoading ? (
              <div className="flex justify-center mt-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-md">
                Error loading analytics data. Please try again later.
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Incidents by Priority</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div style={{ height: "240px" }}>
                        <canvas ref={priorityChartRef} height="240"></canvas>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Incidents by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div style={{ height: "240px" }}>
                        <canvas ref={categoryChartRef} height="240"></canvas>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Resolution Time by Priority</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div style={{ height: "240px" }}>
                        <canvas ref={resolutionTimeChartRef} height="240"></canvas>
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

export default Analytics;

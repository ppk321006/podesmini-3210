
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProgressDataPoint {
  name: string;
  padi: number;
  palawija: number;
}

interface ProgressChartProps {
  title: string;
  description?: string;
  data: ProgressDataPoint[];
  loading?: boolean;
}

export function ProgressChart({ title, description, data, loading }: ProgressChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data yang tersedia
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${parseFloat(value.toString()).toFixed(1)}%`} />
                <Legend />
                <Bar name="Padi (%)" dataKey="padi" fill="#4f46e5" />
                <Bar name="Palawija (%)" dataKey="palawija" fill="#84cc16" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function convertProgressDataToChartData(data: any[]): ProgressDataPoint[] {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "Mei", "Jun", "Jul", "Ags",
    "Sep", "Okt", "Nov", "Des"
  ];
  
  return data.map(item => ({
    name: monthNames[item.month - 1],
    padi: item.padi_percentage || 0,
    palawija: item.palawija_percentage || 0
  }));
}

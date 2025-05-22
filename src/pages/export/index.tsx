
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExportDataPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Export Data</CardTitle>
          <CardDescription>
            Export data ubinan dalam berbagai format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Fungsi export data sedang dalam pengembangan.</p>
        </CardContent>
      </Card>
    </div>
  );
}

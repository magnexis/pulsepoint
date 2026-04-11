import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OwnerSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>Owner controls reuse the same account settings infrastructure as the main user workspace.</p>
        <Button asChild>
          <Link to="/settings/profile">Open settings center</Link>
        </Button>
      </CardContent>
    </Card>
  );
}


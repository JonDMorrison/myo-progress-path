import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const SeedSuperAdmins = () => {
  const [seedToken, setSeedToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSeed = async () => {
    if (!seedToken) {
      toast.error("Please enter the seed token");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('seed-super-admins', {
        body: { seedToken }
      });

      if (error) throw error;

      setResults(data.results || []);
      toast.success(data.message || "Seeding complete");
    } catch (error: any) {
      console.error('Seed error:', error);
      toast.error(error.message || "Failed to seed super admins");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent px-4 py-8">
      <Card className="w-full max-w-2xl shadow-elevated">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Seed Super Admins</CardTitle>
              <CardDescription>
                One-time setup to create master admin accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This is a one-time operation. The seed token is required for security. 
              After running this successfully, you should remove or disable this page.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seedToken">Seed Token</Label>
              <Input
                id="seedToken"
                type="password"
                placeholder="Enter your seed token"
                value={seedToken}
                onChange={(e) => setSeedToken(e.target.value)}
                className="h-11"
              />
              <p className="text-sm text-muted-foreground">
                The seed token is stored as SEED_TOKEN in your backend secrets
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm">Will create/update:</h3>
              <ul className="space-y-1 text-sm">
                <li>• matt@montrosedentalcentre.com → super_admin (password: montrose)</li>
                <li>• info@montrosedentalcentre.com → super_admin (password: montrose)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                <strong>Important:</strong> Change these passwords immediately after first login!
              </p>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Results:</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <Alert 
                    key={index} 
                    className={result.status === 'error' ? 'border-destructive' : 'border-success'}
                  >
                    <AlertDescription>
                      <strong>{result.email}</strong>: {result.message || result.status}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handleSeed} 
            className="w-full h-11" 
            disabled={loading || !seedToken}
          >
            {loading ? "Seeding..." : "Run Seed"}
          </Button>
          
          <Alert>
            <AlertDescription className="text-xs">
              After successful seeding, you can delete this page from your codebase or remove the route.
              The seed function will remain protected by the token in your backend.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SeedSuperAdmins;
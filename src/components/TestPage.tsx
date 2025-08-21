import { useAuth } from "@/contexts/AuthContext";
import { authManager } from "@/lib/auth.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TestPage = () => {
  const { user, loading, isAuthenticated, isAdmin, login, logout } = useAuth();

  const testLogin = async () => {
    console.log('Testing login...');
    const success = await login("admin", "admin123");
    console.log('Login result:', success);
  };

  const testUserLogin = async () => {
    console.log('Testing user login...');
    const success = await login("user", "user123");
    console.log('User login result:', success);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Has Tokens:</strong> {authManager.isAuthenticated() ? 'Yes' : 'No'}
              </div>
            </div>
            
            {user && (
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Current User:</h3>
                <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testLogin} disabled={loading}>
                Test Admin Login
              </Button>
              <Button onClick={testUserLogin} disabled={loading}>
                Test User Login
              </Button>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div><strong>Access Token:</strong> {authManager.getAccessToken() || 'None'}</div>
              <div><strong>Refresh Token:</strong> {authManager.getRefreshToken() || 'None'}</div>
              <div><strong>Token Valid:</strong> {authManager.getAccessToken() ? authManager.isTokenValid(authManager.getAccessToken()!) : 'No token'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPage; 
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DebugAuth() {
  const { isAuthenticated, isLoading, user, tokens, login, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Card className="p-4 m-4">
      <h3 className="font-bold mb-2">🔍 Debug Auth State</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">isAuthenticated:</span>
          <Badge variant={isAuthenticated ? "default" : "secondary"} className="ml-2">
            {isAuthenticated ? "true" : "false"}
          </Badge>
        </div>
        <div>
          <span className="font-medium">isLoading:</span>
          <Badge variant={isLoading ? "destructive" : "outline"} className="ml-2">
            {isLoading ? "true" : "false"}
          </Badge>
        </div>
        <div>
          <span className="font-medium">User:</span>
          <pre className="text-xs mt-1 bg-muted p-2 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        <div>
          <span className="font-medium">Current Path:</span>
          <Badge variant="outline" className="ml-2">
            {window.location.pathname}
          </Badge>
        </div>
        <div>
          <span className="font-medium">Navigation History:</span>
          <div className="text-xs mt-1 space-y-1">
            <div>History length: {window.history.length}</div>
            <div>State: {JSON.stringify(window.history.state)}</div>
          </div>
        </div>
        <div>
          <span className="font-medium">LocalStorage:</span>
          <div className="text-xs mt-1 space-y-1">
            <div>auth_user: {localStorage.getItem('auth_user') ? '✅' : '❌'}</div>
            <div>auth_tokens: {localStorage.getItem('auth_tokens') ? '✅' : '❌'}</div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">🧪 Test Actions:</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await login('demo@taskflow.pro', 'password');
                } catch (err) {
                  console.error('Demo login failed:', err);
                }
              }}
            >
              Demo Login
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Navigate to /
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/', { replace: true })}
            >
              Navigate Replace
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              window.location.href
            </Button>
            {isAuthenticated && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => logout()}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

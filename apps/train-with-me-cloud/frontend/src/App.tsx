import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "register";

type User = {
  id: string;
  email: string;
  display_name: string;
};

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

type TrainingSpace = {
  id: string;
  name: string;
  owner_user_id: string;
  my_role: string;
};

type ApiErrorPayload = {
  detail?: {
    error?: {
      message?: string;
    };
  };
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const tokenStorageKey = "twm_cloud_access_token";

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.detail?.error?.message ?? `Request failed with HTTP ${response.status}.`;
  } catch {
    return `Request failed with HTTP ${response.status}.`;
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return await response.json() as T;
}

export function App() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey) ?? "");
  const [user, setUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<TrainingSpace[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [spaceStatus, setSpaceStatus] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(Boolean(token));
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  const selectedSpace = useMemo(
    () => spaces.find((space) => space.id === selectedSpaceId) ?? spaces[0] ?? null,
    [selectedSpaceId, spaces],
  );

  const loadSpaces = useCallback(async (activeToken: string) => {
    const nextSpaces = await apiRequest<TrainingSpace[]>("/api/training-spaces", {}, activeToken);
    setSpaces(nextSpaces);
    setSelectedSpaceId((currentId) => {
      if (nextSpaces.some((space) => space.id === currentId)) {
        return currentId;
      }
      return nextSpaces[0]?.id ?? "";
    });
  }, []);

  const applySession = useCallback(async (nextToken: string, nextUser?: User) => {
    localStorage.setItem(tokenStorageKey, nextToken);
    setToken(nextToken);
    setUser(nextUser ?? await apiRequest<User>("/api/auth/me", {}, nextToken));
    await loadSpaces(nextToken);
  }, [loadSpaces]);

  useEffect(() => {
    if (!token) {
      setIsLoadingSession(false);
      return;
    }

    let isActive = true;
    setIsLoadingSession(true);
    apiRequest<User>("/api/auth/me", {}, token)
      .then(async (currentUser) => {
        if (!isActive) {
          return;
        }
        setUser(currentUser);
        await loadSpaces(token);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        localStorage.removeItem(tokenStorageKey);
        setToken("");
        setUser(null);
        setSpaces([]);
        setAuthStatus(error instanceof Error ? error.message : "Session expired.");
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingSession(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [loadSpaces, token]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const displayName = String(form.get("displayName") ?? "");
    const path = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = authMode === "login"
      ? { email, password }
      : { email, password, display_name: displayName };

    setIsSubmittingAuth(true);
    setAuthStatus("");
    try {
      const response = await apiRequest<AuthResponse>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });
      await applySession(response.access_token, response.user);
    } catch (error) {
      setAuthStatus(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handleCreateSpace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const name = String(form.get("spaceName") ?? "");

    setIsCreatingSpace(true);
    setSpaceStatus("");
    try {
      const createdSpace = await apiRequest<TrainingSpace>("/api/training-spaces", {
        method: "POST",
        body: JSON.stringify({ name }),
      }, token);
      await loadSpaces(token);
      setSelectedSpaceId(createdSpace.id);
      event.currentTarget.reset();
    } catch (error) {
      setSpaceStatus(error instanceof Error ? error.message : "Could not create training space.");
    } finally {
      setIsCreatingSpace(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(tokenStorageKey);
    setToken("");
    setUser(null);
    setSpaces([]);
    setSelectedSpaceId("");
    setAuthStatus("");
    setSpaceStatus("");
  }

  if (isLoadingSession) {
    return (
      <main className="app-shell app-shell-centered">
        <section className="loading-panel">
          <p className="eyebrow">Train With Me Cloud</p>
          <h1>Loading session</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app-shell auth-layout">
        <section className="auth-intro" aria-labelledby="auth-title">
          <p className="eyebrow">Train With Me Cloud</p>
          <h1 id="auth-title">Training space</h1>
          <p>Sign in to manage your cloud training history, coach access, and imported V1 data.</p>
        </section>

        <section className="auth-panel" aria-label="Authentication">
          <div className="segmented-control" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={authMode === "login" ? "active" : ""}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === "register" ? "active" : ""}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          <form className="stacked-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <label>
                Name
                <input name="displayName" autoComplete="name" minLength={1} maxLength={120} required />
              </label>
            )}
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                minLength={authMode === "login" ? 1 : 8}
                required
              />
            </label>
            {authStatus && <p className="form-status" role="status">{authStatus}</p>}
            <button type="submit" className="primary-action" disabled={isSubmittingAuth}>
              {isSubmittingAuth ? "Working" : authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Train With Me Cloud</p>
          <h1>Dashboard</h1>
        </div>
        <div className="account-bar">
          <div>
            <span>{user.display_name}</span>
            <small>{user.email}</small>
          </div>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="dashboard-grid">
        <aside className="sidebar-panel" aria-label="Training spaces">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Spaces</p>
              <h2>Training spaces</h2>
            </div>
          </div>

          {spaces.length > 0 ? (
            <div className="space-list" role="listbox" aria-label="Select training space">
              {spaces.map((space) => (
                <button
                  key={space.id}
                  type="button"
                  className={selectedSpace?.id === space.id ? "space-item active" : "space-item"}
                  onClick={() => setSelectedSpaceId(space.id)}
                >
                  <span>{space.name}</span>
                  <small>{space.my_role}</small>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-state">No training spaces yet.</p>
          )}

          <form className="stacked-form compact" onSubmit={handleCreateSpace}>
            <label>
              New space
              <input name="spaceName" placeholder="Base Season" minLength={1} maxLength={120} required />
            </label>
            {spaceStatus && <p className="form-status" role="status">{spaceStatus}</p>}
            <button type="submit" disabled={isCreatingSpace}>
              {isCreatingSpace ? "Creating" : "Create space"}
            </button>
          </form>
        </aside>

        <section className="workspace-panel" aria-label="Dashboard">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Current</p>
              <h2>{selectedSpace?.name ?? "Select a training space"}</h2>
            </div>
            {selectedSpace && <span className="role-pill">{selectedSpace.my_role}</span>}
          </div>

          <div className="metric-grid">
            <article className="metric-tile">
              <span className="metric-value">{spaces.length}</span>
              <span className="metric-label">Spaces</span>
            </article>
            <article className="metric-tile">
              <span className="metric-value">{selectedSpace ? "Ready" : "None"}</span>
              <span className="metric-label">Selection</span>
            </article>
          </div>

          <div className="next-panel">
            <p className="panel-kicker">Next</p>
            <h3>Workout and plan views</h3>
            <p>Read-only workout and planned-session lists will attach here after the import workflow is visible.</p>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;

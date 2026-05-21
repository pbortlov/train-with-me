import { useCallback, useEffect, useState } from "react";

type HealthState =
  | { status: "checking"; message: string; checkedAt: string }
  | { status: "ok"; message: string; checkedAt: string }
  | { status: "error"; message: string; checkedAt: string };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

function checkedAtNow(): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

async function fetchApiHealth(): Promise<HealthState> {
  const response = await fetch(`${apiBaseUrl}/api/health`);
  if (!response.ok) {
    return {
      status: "error",
      message: `HTTP ${response.status}`,
      checkedAt: checkedAtNow(),
    };
  }

  const payload = await response.json() as { status?: string };
  if (payload.status !== "ok") {
    return {
      status: "error",
      message: "Unexpected response",
      checkedAt: checkedAtNow(),
    };
  }

  return {
    status: "ok",
    message: "Online",
    checkedAt: checkedAtNow(),
  };
}

export function App() {
  const [health, setHealth] = useState<HealthState>({
    status: "checking",
    message: "Checking",
    checkedAt: checkedAtNow(),
  });

  const refreshHealth = useCallback(async () => {
    setHealth({
      status: "checking",
      message: "Checking",
      checkedAt: checkedAtNow(),
    });

    try {
      setHealth(await fetchApiHealth());
    } catch {
      setHealth({
        status: "error",
        message: "Offline",
        checkedAt: checkedAtNow(),
      });
    }
  }, []);

  useEffect(() => {
    void refreshHealth();
  }, [refreshHealth]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Train With Me</p>
          <h1>Cloud</h1>
        </div>
        <button type="button" onClick={refreshHealth}>Refresh</button>
      </header>

      <section className="status-grid" aria-label="System status">
        <article className="status-panel">
          <div className="status-panel-header">
            <div>
              <p className="panel-kicker">API</p>
              <h2>Backend</h2>
            </div>
            <span className={`status-dot status-dot-${health.status}`} aria-label={health.status} />
          </div>
          <dl className="status-list">
            <div>
              <dt>Status</dt>
              <dd>{health.message}</dd>
            </div>
            <div>
              <dt>Endpoint</dt>
              <dd>/api/health</dd>
            </div>
            <div>
              <dt>Last checked</dt>
              <dd>{health.checkedAt}</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}

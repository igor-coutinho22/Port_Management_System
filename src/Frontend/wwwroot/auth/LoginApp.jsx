import api from "./apiClient";

export default function App() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/me");
        setMe(data);
      } catch (e) {
        if (e?.response?.status === 403) {
          setErr("Your account has no active role. Please contact an administrator.");
        } else {
          setErr("Unable to load your profile.");
        }
      }
    })();
  }, []);

  return (
    <AuthGate>
      <div style={{ padding: 16 }}>
        <h1>Port Management</h1>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        {!err && !me && <div>Loading…</div>}
        {!err && me && (
          <>
            <p>
              Welcome, <strong>{me.firstName}</strong> ({me.email}) — role: <strong>{me.role}</strong>
            </p>
            {me.role === "Admin" ? <AdminMenu /> : <UserMenu />}
            <button onClick={() => (window.location.href = "/logout")}>Logout</button>
          </>
        )}
      </div>
    </AuthGate>
  );
}

function AdminMenu() {
  return <nav>Admin: Users, Roles, Reports…</nav>;
}
function UserMenu() {
  return <nav>User: Dashboard, My Stuff…</nav>;
}

import { useEffect, useState } from "react";
import { api, hasApi } from "./api";
import Dashboard from "./Dashboard";
import Login from "./Login";

const TOKEN_KEY = "saev-admin-token";

/** Dashboard admin (halaman rahasia /super-admin-saevitation/). Token sesi hanya di sessionStorage. */
export default function AdminApp() {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  });
  const [notice, setNotice] = useState("");

  // tampilan terang + font Lexend Deca hanya untuk halaman ini; jangan diindeks mesin pencari
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Super Admin | Saevitation";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href =
      "https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;500;600;700&display=swap";
    document.head.append(meta, font);
    const html = document.documentElement;
    const body = document.body;
    const prev = { html: html.style.backgroundColor, body: body.style.backgroundColor };
    html.style.backgroundColor = body.style.backgroundColor = "#EFF2F7";
    html.classList.remove("has-bar");
    return () => {
      document.title = prevTitle;
      meta.remove();
      font.remove();
      html.style.backgroundColor = prev.html;
      body.style.backgroundColor = prev.body;
    };
  }, []);

  const login = (t) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* abaikan */
    }
    setNotice("");
    setToken(t);
  };

  const clear = (msg) => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* abaikan */
    }
    setToken("");
    setNotice(msg || "");
  };

  const logout = () => {
    if (token && hasApi) api.logout(token); // cabut token di server (tidak perlu ditunggu)
    clear("Anda sudah keluar.");
  };

  return (
    <div className="font-lexend text-adm-fg antialiased bg-adm-muted min-h-screen">
      {token ? (
        <Dashboard
          token={token}
          onLogout={logout}
          onExpired={() => clear("Sesi berakhir. Silakan masuk lagi.")}
        />
      ) : (
        <Login onLogin={login} notice={notice} />
      )}
    </div>
  );
}

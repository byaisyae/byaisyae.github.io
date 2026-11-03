import { useState } from "react";
import { api, hasApi } from "./api";
import { Icon, Spinner, inputCls } from "./ui";

export default function Login({ onLogin, notice }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!user.trim() || !pass) return setErr("Isi username dan password.");
    setBusy(true);
    setErr("");
    const out = await api.login(user.trim(), pass);
    setBusy(false);
    if (out.ok && out.token) {
      setPass("");
      onLogin(out.token);
    } else {
      setErr(out.error || "Gagal masuk.");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-5">
      <div className="w-full max-w-md bg-white rounded-3xl border border-adm-line shadow-xl shadow-black/5 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-9 bg-adm-primary rounded-xl flex items-center justify-center shadow-sm shadow-adm-primary/30">
            <Icon name="mail" className="size-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Saevitation</span>
        </div>

        <h1 className="text-2xl font-bold">Masuk Super Admin</h1>
        <p className="text-adm-sec text-sm mt-1 mb-6">Khusus pengelola. Masuk untuk mengatur koleksi dan tema.</p>

        {!hasApi && (
          <p role="alert" className="mb-5 rounded-xl bg-adm-warn/30 text-adm-fg text-sm px-4 py-3">
            Dashboard belum terhubung ke Google Sheet. Isi <code>VITE_APPS_SCRIPT_URL</code> (lihat
            apps-script/SETUP.md), lalu build ulang.
          </p>
        )}
        {notice && !err && (
          <p role="status" className="mb-5 rounded-xl bg-adm-primary/10 text-adm-primary text-sm px-4 py-3">
            {notice}
          </p>
        )}

        <form onSubmit={submit} className="space-y-4" noValidate>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Username</span>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              className={inputCls}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5">Password</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
                className={`${inputCls} pr-12`}
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-lg flex items-center justify-center text-adm-sec hover:text-adm-fg cursor-pointer"
              >
                <Icon name={show ? "eyeOff" : "eye"} className="size-5" />
              </button>
            </div>
          </label>

          {err && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-adm-err/10 text-adm-err text-sm px-4 py-3">
              <Icon name="alert" className="size-4 mt-0.5 shrink-0" />
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !hasApi}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-adm-primary text-white font-bold hover:bg-adm-hover transition-colors shadow-lg shadow-adm-primary/30 disabled:opacity-60 cursor-pointer"
          >
            {busy ? <Spinner /> : <Icon name="lock" className="size-5" />}
            {busy ? "Memeriksa…" : "Masuk"}
          </button>
        </form>

        <a href={import.meta.env.BASE_URL} className="block text-center text-sm text-adm-sec hover:text-adm-primary mt-6">
          ← Kembali ke situs
        </a>
      </div>
    </div>
  );
}

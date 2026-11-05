import { useEffect, useMemo, useState } from "react";
import { CATS as BUILTIN_CATS, D as STATIC } from "../config";
import { fmtDate, refreshDesigns } from "../utils/useDesigns";
import { api } from "./api";
import CategoryForm from "./CategoryForm";
import CategoryPanel from "./CategoryPanel";
import ItemForm from "./ItemForm";
import PromoPanel from "./PromoPanel";
import TestimoniPanel from "./TestimoniPanel";
import { Icon, Modal, Spinner, Toast, inputCls } from "./ui";

const MENU = [
  { id: "ringkasan", label: "Ringkasan", icon: "grid", title: "Ringkasan" },
  { id: "client", label: "Koleksi Client", icon: "users", title: "Koleksi Client" },
  { id: "tema", label: "Tema Katalog", icon: "palette", title: "Tema Katalog" },
  { id: "kategori", label: "Kategori Tema", icon: "layers", title: "Kategori Tema" },
  { id: "testimoni", label: "Testimoni", icon: "chat", title: "Moderasi Testimoni" },
  { id: "promo", label: "Promo", icon: "tag", title: "Pengaturan Promo" },
];

const match = (it, q) =>
  !q || [it.name, it.tag, it.url, it.cat].some((v) => String(v || "").toLowerCase().includes(q));

function StatCard({ icon, label, value, tone }) {
  return (
    <div className="bg-white rounded-2xl border border-adm-line p-5 flex items-center gap-4">
      <div className={`size-12 rounded-xl flex items-center justify-center ${tone}`}>
        <Icon name={icon} className="size-6" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-sm text-adm-sec mt-1">{label}</p>
      </div>
    </div>
  );
}

function ItemCard({ it, busy, onEdit, onToggle, onDelete }) {
  const cover = it.img || it.shot1;
  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-adm-line overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
      <a
        href={it.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[3/4] bg-adm-muted overflow-hidden"
        aria-label={`Buka undangan ${it.name}`}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${it.visible ? "" : "grayscale opacity-60"}`}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-adm-sec">
            <Icon name="image" className="size-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full font-semibold text-sm shadow-lg">
            <Icon name="external" className="size-4" /> Buka
          </span>
        </div>
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm max-w-[70%] truncate">
          {it.tag}
        </span>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {!it.visible && (
            <span className="bg-adm-fg text-white text-[11px] font-bold px-3 py-1 rounded-full">Tersembunyi</span>
          )}
          {it.type === "client" && it.featured && (
            <span className="inline-flex items-center gap-1 bg-adm-warn text-adm-fg text-[11px] font-bold px-3 py-1 rounded-full">
              <Icon name="star" className="size-3" /> Unggulan
            </span>
          )}
        </div>
      </a>
      <div className="p-5 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-lg truncate">{it.type === "tema" && it.title ? it.title : it.name}</h3>
        {it.type === "tema" && it.title && <p className="text-xs text-adm-sec/80 truncate">Contoh: {it.name}</p>}
        <p className="text-sm text-adm-sec">{fmtDate(it.date)}</p>
        <p className="text-xs text-adm-sec/80 truncate">{it.url}</p>
        {it.type === "tema" && it.now && (
          <p className="text-sm mt-1">
            <span className="text-adm-sec line-through mr-2">Rp {it.was}</span>
            <span className="font-bold">Rp {it.now}</span>
          </p>
        )}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-adm-line">
          <button
            type="button"
            onClick={() => onEdit(it)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-adm-primary/10 text-adm-primary text-sm font-semibold hover:bg-adm-primary hover:text-white transition-colors cursor-pointer"
          >
            <Icon name="pencil" className="size-4" /> Edit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggle(it)}
            title={it.visible ? "Sembunyikan dari situs" : "Tampilkan di situs"}
            aria-label={it.visible ? "Sembunyikan dari situs" : "Tampilkan di situs"}
            className="size-10 rounded-full ring-1 ring-adm-line flex items-center justify-center text-adm-sec hover:text-adm-primary hover:ring-adm-primary/40 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {busy ? <Spinner /> : <Icon name={it.visible ? "eye" : "eyeOff"} className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(it)}
            title="Hapus"
            aria-label="Hapus"
            className="size-10 rounded-full ring-1 ring-adm-line flex items-center justify-center text-adm-sec hover:text-adm-err hover:ring-adm-err/40 transition-colors cursor-pointer"
          >
            <Icon name="trash" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ token, onLogout, onExpired }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [view, setView] = useState("ringkasan");
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("semua");
  const [form, setForm] = useState(null); // { type, item? }
  const [del, setDel] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState(null);
  // kategori tema (dari Google Sheet)
  const [promo, setPromo] = useState(null); // pengaturan promo dari Sheet (null = belum pernah disimpan)
  const [cats, setCats] = useState([]);
  const [catForm, setCatForm] = useState(null); // {} = baru, { item } = ubah
  const [catDel, setCatDel] = useState(null);
  const [catDelBusy, setCatDelBusy] = useState(false);
  const [catBusy, setCatBusy] = useState("");
  // moderasi testimoni
  const [testi, setTesti] = useState([]);
  const [testiFilter, setTestiFilter] = useState("Pending");
  const [testiBusy, setTestiBusy] = useState("");
  const [testiDel, setTestiDel] = useState(null);
  const [testiDelBusy, setTestiDelBusy] = useState(false);

  const say = (text, type = "ok") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // respons 401 = sesi habis → kembali ke halaman login
  const guard = (out) => {
    if (out && out.code === 401) {
      onExpired();
      return false;
    }
    return true;
  };

  const load = async () => {
    setLoading(true);
    setLoadErr("");
    const [out, tOut] = await Promise.all([api.list(token), api.testiList(token)]);
    if (!guard(out) || !guard(tOut)) return;
    if (out.ok) {
      setItems(out.items);
      setCats(out.categories || []);
      setPromo(out.promo || null);
    } else setLoadErr(out.error || "Gagal memuat data.");
    if (tOut.ok) setTesti(tOut.items);
    else if (out.ok)
      setLoadErr(
        tOut.error === "Aksi tidak dikenal."
          ? "Fitur moderasi testimoni belum aktif: tempel Code.gs terbaru lalu deploy versi baru di Apps Script."
          : tOut.error || "Gagal memuat testimoni.",
      );
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const clients = useMemo(() => items.filter((i) => i.type === "client"), [items]);
  const themes = useMemo(() => items.filter((i) => i.type === "tema"), [items]);
  // semua kategori: bawaan kode (hanya baca) + dari dashboard
  const allCats = useMemo(
    () => [
      ...BUILTIN_CATS.map((c) => ({ id: c.id, label: c.label, desc: c.desc, was: c.price?.was || "", now: c.price?.now || "", visible: true, builtin: true })),
      ...cats,
    ],
    [cats],
  );
  const catLabel = (id) => allCats.find((c) => c.id === id)?.label;
  const themeCount = (id) =>
    STATIC.filter((d) => !d.client && d.cat === id).length + themes.filter((t) => t.cat === id).length;
  const hidden = items.filter((i) => !i.visible).length;
  const featured = clients.filter((i) => i.featured && i.visible).length;
  const tagOptions = useMemo(
    () => [...new Set([...allCats.map((c) => c.label), ...STATIC.map((d) => d.tag), ...clients.map((c) => c.tag)])].filter(Boolean),
    [clients, allCats],
  );

  const onSaved = (item, edited) => {
    setItems((list) => (edited ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]));
    setForm(null);
    say(edited ? "Perubahan disimpan." : "Berhasil ditambahkan.");
    refreshDesigns();
  };

  const toggleVisible = async (it) => {
    setBusyId(it.id);
    const out = await api.save(token, { ...it, visible: !it.visible });
    setBusyId("");
    if (!guard(out)) return;
    if (!out.ok) return say(out.error || "Gagal mengubah.", "err");
    setItems((list) => list.map((x) => (x.id === it.id ? out.item : x)));
    say(out.item.visible ? "Ditampilkan di situs." : "Disembunyikan dari situs.");
    refreshDesigns();
  };

  const confirmDelete = async () => {
    setDelBusy(true);
    const out = await api.remove(token, del.id);
    setDelBusy(false);
    if (!guard(out)) return;
    if (!out.ok) return say(out.error || "Gagal menghapus.", "err");
    setItems((list) => list.filter((x) => x.id !== del.id));
    setDel(null);
    say("Dihapus.");
    refreshDesigns();
  };

  const onCatSaved = (item, edited) => {
    setCats((list) => (edited ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]));
    setCatForm(null);
    say(edited ? "Kategori disimpan." : "Kategori ditambahkan.");
    refreshDesigns();
  };

  const toggleCat = async (c) => {
    setCatBusy(c.id);
    const out = await api.catSave(token, { ...c, visible: !c.visible, isEdit: true });
    setCatBusy("");
    if (!guard(out)) return;
    if (!out.ok) return say(out.error || "Gagal mengubah.", "err");
    setCats((list) => list.map((x) => (x.id === c.id ? out.item : x)));
    say(out.item.visible ? "Kategori ditampilkan." : "Kategori disembunyikan.");
    refreshDesigns();
  };

  const confirmCatDelete = async () => {
    setCatDelBusy(true);
    const out = await api.catRemove(token, catDel.id);
    setCatDelBusy(false);
    if (!guard(out)) return;
    if (!out.ok) {
      setCatDel(null);
      return say(out.error || "Gagal menghapus.", "err");
    }
    setCats((list) => list.filter((x) => x.id !== catDel.id));
    setCatDel(null);
    say("Kategori dihapus.");
    refreshDesigns();
  };

  const pending = testi.filter((t) => t.status === "Pending").length;

  const setTestiStatus = async (it, status) => {
    setTestiBusy(it.id);
    const out = await api.testiStatus(token, it.id, status);
    setTestiBusy("");
    if (!guard(out)) return;
    if (!out.ok) return say(out.error || "Gagal mengubah status.", "err");
    setTesti((list) => list.map((x) => (x.id === it.id ? out.item : x)));
    say(
      status === "Approved"
        ? "Testimoni disetujui dan akan tampil di situs."
        : status === "Rejected"
          ? "Testimoni ditolak."
          : "Dikembalikan ke menunggu.",
    );
  };

  const confirmTestiDelete = async () => {
    setTestiDelBusy(true);
    const out = await api.testiRemove(token, testiDel.id);
    setTestiDelBusy(false);
    if (!guard(out)) return;
    if (!out.ok) return say(out.error || "Gagal menghapus.", "err");
    setTesti((list) => list.filter((x) => x.id !== testiDel.id));
    setTestiDel(null);
    say("Testimoni dihapus.");
  };

  const go = (id) => {
    setView(id);
    setQ("");
    setCatFilter("semua");
    setMenu(false);
  };

  const query = q.trim().toLowerCase();
  const listItems = useMemo(() => {
    const base = view === "client" ? clients : view === "tema" ? themes : [];
    return base
      .map((i) => (i.type === "tema" ? { ...i, tag: catLabel(i.cat) || i.tag } : i)) // label ikut nama kategori terbaru
      .filter((i) => (view === "tema" && catFilter !== "semua" ? i.cat === catFilter : true))
      .filter((i) => match(i, query))
      .slice()
      .reverse(); // terbaru dulu
  }, [view, clients, themes, catFilter, query, allCats]);

  const current = MENU.find((m) => m.id === view);
  const addType = view === "tema" ? "tema" : "client";

  return (
    <div className="min-h-screen">
      {menu && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setMenu(false)} />}

      {/* Sidebar */}
      <aside
        className={`flex flex-col w-[280px] h-screen fixed left-0 top-0 z-50 bg-white border-r border-adm-line transition-transform ${
          menu ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-adm-line h-[90px] px-5 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-9 bg-adm-primary rounded-xl flex items-center justify-center shadow-sm shadow-adm-primary/30">
              <Icon name="mail" className="size-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Saevitation</h1>
          </div>
          <button
            type="button"
            onClick={() => setMenu(false)}
            aria-label="Tutup menu"
            className="lg:hidden size-11 flex items-center justify-center rounded-xl ring-1 ring-adm-line cursor-pointer"
          >
            <Icon name="x" className="size-6 text-adm-sec" />
          </button>
        </div>
        <nav className="flex flex-col p-5 gap-6 overflow-y-auto flex-1">
          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-xs text-adm-sec uppercase tracking-wider">Menu</h3>
            <div className="flex flex-col gap-1">
              {MENU.map((m) => {
                const on = m.id === view;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => go(m.id)}
                    className={`flex items-center rounded-xl p-3.5 gap-3 text-left transition-all cursor-pointer ${
                      on ? "bg-adm-primary/10" : "hover:bg-adm-muted"
                    }`}
                  >
                    <Icon name={m.icon} className={`size-5 ${on ? "text-adm-primary" : "text-adm-sec"}`} />
                    <span className={`font-medium ${on ? "font-semibold text-adm-primary" : "text-adm-sec"}`}>
                      {m.label}
                    </span>
                    {m.id === "testimoni" && pending > 0 && (
                      <span className="ml-auto min-w-6 h-6 px-2 rounded-full bg-adm-err text-white text-xs font-bold grid place-items-center">
                        {pending}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-auto">
            <a
              href={import.meta.env.BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center rounded-xl p-3.5 gap-3 hover:bg-adm-muted transition-all"
            >
              <Icon name="external" className="size-5 text-adm-sec" />
              <span className="font-medium text-adm-sec">Lihat Situs</span>
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center rounded-xl p-3.5 gap-3 hover:bg-adm-err/10 transition-all text-left cursor-pointer group"
            >
              <Icon name="logout" className="size-5 text-adm-sec group-hover:text-adm-err" />
              <span className="font-medium text-adm-sec group-hover:text-adm-err">Keluar</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Konten */}
      <main className="lg:ml-[280px] flex flex-col min-h-screen">
        <header className="flex items-center justify-between gap-3 h-[90px] border-b border-adm-line bg-white px-5 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Buka menu"
              className="lg:hidden size-11 shrink-0 flex items-center justify-center rounded-xl ring-1 ring-adm-line cursor-pointer hover:bg-adm-muted transition-colors"
            >
              <Icon name="menu" className="size-6" />
            </button>
            <h2 className="font-bold text-xl md:text-2xl truncate">{current.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            {view !== "ringkasan" && view !== "promo" && (
              <div className="hidden sm:flex items-center gap-2 bg-adm-muted rounded-xl px-3 focus-within:ring-2 focus-within:ring-adm-primary/20">
                <Icon name="search" className="size-4 text-adm-sec" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama, tag, link…"
                  className="w-48 lg:w-64 py-2.5 bg-transparent outline-none text-sm placeholder:text-adm-sec/70"
                />
              </div>
            )}
            <button
              type="button"
              onClick={load}
              disabled={loading}
              title="Muat ulang"
              aria-label="Muat ulang"
              className="size-11 flex items-center justify-center rounded-xl ring-1 ring-adm-line hover:bg-adm-muted transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Spinner className="size-5" /> : <Icon name="refresh" className="size-5 text-adm-sec" />}
            </button>
            {view !== "testimoni" && view !== "promo" && (
              <button
                type="button"
                onClick={() => (view === "kategori" ? setCatForm({}) : setForm({ type: addType }))}
                className="inline-flex items-center gap-2 px-4 sm:px-6 h-11 rounded-full bg-adm-primary text-white font-semibold text-sm hover:bg-adm-hover transition-colors shadow-lg shadow-adm-primary/30 cursor-pointer"
              >
                <Icon name="plus" className="size-5" />
                <span className="hidden sm:inline">
                  {view === "kategori" ? "Tambah Kategori" : addType === "tema" ? "Tambah Tema" : "Tambah Client"}
                </span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 p-5 md:p-8">
          <div className="max-w-7xl mx-auto">
            {loadErr && (
              <p role="alert" className="mb-6 flex items-start gap-2 rounded-xl bg-adm-err/10 text-adm-err text-sm px-4 py-3">
                <Icon name="alert" className="size-4 mt-0.5 shrink-0" /> {loadErr}
              </p>
            )}

            {view === "ringkasan" && (
              <>
                {pending > 0 && (
                  <button
                    type="button"
                    onClick={() => go("testimoni")}
                    className="w-full mb-6 flex items-center gap-4 text-left rounded-2xl bg-adm-warn/30 border border-adm-warn px-5 py-4 hover:bg-adm-warn/40 transition-colors cursor-pointer"
                  >
                    <Icon name="chat" className="size-6 shrink-0" />
                    <span className="flex-1 font-semibold">
                      {pending} testimoni menunggu persetujuan
                    </span>
                    <span className="text-sm font-bold underline">Tinjau →</span>
                  </button>
                )}
                <div className="bg-adm-fg rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden shadow-xl">
                  <div className="relative z-10 max-w-xl">
                    <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full mb-4 border border-white/20">
                      Super Admin
                    </span>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                      Kelola koleksi & tema undangan
                    </h3>
                    <p className="text-white/70 mb-8 text-lg">
                      Tambahkan undangan client atau tema baru. Perubahan langsung tampil di katalog situs tanpa
                      build ulang.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setForm({ type: "client" })}
                        className="bg-adm-primary text-white px-7 py-3.5 rounded-full font-bold hover:bg-adm-hover transition-colors shadow-lg shadow-adm-primary/30 cursor-pointer"
                      >
                        + Koleksi Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ type: "tema" })}
                        className="bg-white/10 text-white px-7 py-3.5 rounded-full font-bold hover:bg-white/20 transition-colors border border-white/20 cursor-pointer"
                      >
                        + Tema Baru
                      </button>
                    </div>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-adm-primary/20 to-transparent pointer-events-none" />
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                  <StatCard icon="users" label="Koleksi client" value={clients.length} tone="bg-adm-primary/10 text-adm-primary" />
                  <StatCard icon="palette" label="Tema katalog" value={themes.length} tone="bg-adm-ok/10 text-adm-ok" />
                  <StatCard icon="star" label="Unggulan di beranda" value={featured} tone="bg-adm-warn/30 text-adm-fg" />
                  <StatCard icon="eyeOff" label="Disembunyikan" value={hidden} tone="bg-adm-fg/10 text-adm-fg" />
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-adm-line p-6">
                    <h3 className="font-bold text-lg mb-4">Terakhir ditambahkan</h3>
                    {loading ? (
                      <p className="text-adm-sec text-sm flex items-center gap-2"><Spinner /> Memuat…</p>
                    ) : items.length === 0 ? (
                      <p className="text-adm-sec text-sm">Belum ada data dari dashboard. Mulai dengan tombol di atas.</p>
                    ) : (
                      <ul className="divide-y divide-adm-line">
                        {items.slice(-5).reverse().map((it) => (
                          <li key={it.id} className="flex items-center gap-4 py-3">
                            <div className="size-12 rounded-xl bg-adm-muted overflow-hidden shrink-0 grid place-items-center text-adm-sec">
                              {it.img || it.shot1 ? (
                                <img src={it.img || it.shot1} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Icon name="image" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate">{it.name}</p>
                              <p className="text-xs text-adm-sec truncate">
                                {it.type === "client" ? "Client" : "Tema"} · {it.tag} · {fmtDate(it.date)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setForm({ type: it.type, item: it })}
                              className="text-sm font-semibold text-adm-primary hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="bg-white rounded-2xl border border-adm-line p-6">
                    <h3 className="font-bold text-lg mb-2">Data bawaan di kode</h3>
                    <p className="text-sm text-adm-sec leading-relaxed">
                      {STATIC.filter((d) => d.client).length} client dan {STATIC.filter((d) => !d.client).length} tema
                      tertulis di <code>src/config.js</code>. Itu tetap tampil di situs dan hanya bisa diubah lewat
                      kode. Data dari dashboard ini ditambahkan setelahnya.
                    </p>
                  </div>
                </div>
              </>
            )}

            {view !== "ringkasan" && (
              <>
                {/* pencarian untuk layar kecil */}
                <div className={`${view === "promo" ? "hidden" : "sm:hidden flex"} items-center gap-2 bg-white rounded-xl px-3 ring-1 ring-adm-line mb-5`}>
                  <Icon name="search" className="size-4 text-adm-sec" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari nama, tag, link…"
                    className={`${inputCls} !bg-transparent !px-1`}
                  />
                </div>

                {view === "kategori" && (
                  <CategoryPanel
                    cats={allCats}
                    countOf={themeCount}
                    loading={loading}
                    query={query}
                    busyId={catBusy}
                    onAdd={() => setCatForm({})}
                    onEdit={(c) => setCatForm({ item: c })}
                    onToggle={toggleCat}
                    onDelete={setCatDel}
                  />
                )}

                {view === "promo" && (
                  <PromoPanel
                    promo={promo}
                    loading={loading}
                    token={token}
                    onExpired={onExpired}
                    onSaved={(p) => {
                      setPromo(p);
                      refreshDesigns(); // situs di tab ini ikut memakai data terbaru
                      say("Promo disimpan.");
                    }}
                  />
                )}

                {view === "testimoni" && (
                  <TestimoniPanel
                    items={testi}
                    loading={loading}
                    filter={testiFilter}
                    setFilter={setTestiFilter}
                    query={query}
                    busyId={testiBusy}
                    onStatus={setTestiStatus}
                    onDelete={setTestiDel}
                  />
                )}

                {view === "tema" && (
                  <div className="overflow-x-auto mb-8">
                    <div className="flex gap-3 min-w-max pb-2">
                      {[{ id: "semua", label: "Semua Tema" }, ...allCats].map((c) => {
                        const n = c.id === "semua" ? themes.length : themes.filter((t) => t.cat === c.id).length;
                        const on = catFilter === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCatFilter(c.id)}
                            className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all cursor-pointer ${
                              on
                                ? "bg-adm-fg text-white shadow-sm"
                                : "bg-white ring-1 ring-adm-line text-adm-sec hover:ring-adm-primary hover:text-adm-primary"
                            }`}
                          >
                            {c.label} ({n})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {view === "testimoni" || view === "kategori" || view === "promo" ? null : loading ? (
                  <p className="text-adm-sec flex items-center gap-2"><Spinner /> Memuat…</p>
                ) : listItems.length === 0 ? (
                  <div className="bg-white rounded-3xl border-2 border-dashed border-adm-line p-10 text-center">
                    <p className="font-bold text-lg">
                      {query || catFilter !== "semua" ? "Tidak ada yang cocok" : "Belum ada data"}
                    </p>
                    <p className="text-adm-sec text-sm mt-1 mb-6">
                      {query || catFilter !== "semua"
                        ? "Coba kata kunci atau filter lain."
                        : view === "tema"
                          ? "Tambahkan tema pertama Anda dari dashboard."
                          : "Tambahkan undangan client pertama Anda dari dashboard."}
                    </p>
                    {!query && catFilter === "semua" && (
                      <button
                        type="button"
                        onClick={() => setForm({ type: addType })}
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-adm-primary text-white font-semibold hover:bg-adm-hover transition-colors cursor-pointer"
                      >
                        <Icon name="plus" className="size-5" /> {addType === "tema" ? "Tambah Tema" : "Tambah Client"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listItems.map((it) => (
                      <ItemCard
                        key={it.id}
                        it={it}
                        busy={busyId === it.id}
                        onEdit={(x) => setForm({ type: x.type, item: x })}
                        onToggle={toggleVisible}
                        onDelete={setDel}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {catForm && (
        <CategoryForm
          item={catForm.item}
          existing={allCats}
          token={token}
          onClose={() => setCatForm(null)}
          onSaved={onCatSaved}
          onExpired={onExpired}
        />
      )}

      {catDel && (
        <Modal onClose={catDelBusy ? () => {} : () => setCatDel(null)} label="Hapus kategori" size="max-w-md">
          <div className="p-8">
            <div className="size-12 rounded-xl bg-adm-err/10 text-adm-err flex items-center justify-center mb-4">
              <Icon name="trash" className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Hapus kategori “{catDel.label}”?</h3>
            <p className="text-sm text-adm-sec mb-6">
              Kategori dihapus dari Google Sheet dan hilang dari katalog. Kategori yang masih dipakai tema tidak bisa
              dihapus. Jika hanya ingin menyembunyikan, gunakan ikon mata.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setCatDel(null)}
                disabled={catDelBusy}
                className="px-6 py-3 rounded-full ring-1 ring-adm-line font-semibold hover:ring-adm-primary hover:text-adm-primary transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmCatDelete}
                disabled={catDelBusy}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-adm-err text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
              >
                {catDelBusy && <Spinner />} Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

      {form && (
        <ItemForm
          type={form.type}
          item={form.item}
          token={token}
          cats={allCats}
          tagOptions={tagOptions}
          onClose={() => setForm(null)}
          onSaved={onSaved}
          onExpired={onExpired}
        />
      )}

      {del && (
        <Modal onClose={delBusy ? () => {} : () => setDel(null)} label="Hapus koleksi" size="max-w-md">
          <div className="p-8">
            <div className="size-12 rounded-xl bg-adm-err/10 text-adm-err flex items-center justify-center mb-4">
              <Icon name="trash" className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Hapus “{del.name}”?</h3>
            <p className="text-sm text-adm-sec mb-6">
              Data akan dihapus dari Google Sheet dan hilang dari situs. Tindakan ini tidak bisa dibatalkan. Jika hanya
              ingin menyembunyikan, gunakan ikon mata.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setDel(null)}
                disabled={delBusy}
                className="px-6 py-3 rounded-full ring-1 ring-adm-line font-semibold hover:ring-adm-primary hover:text-adm-primary transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={delBusy}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-adm-err text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
              >
                {delBusy && <Spinner />} Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

      {testiDel && (
        <Modal onClose={testiDelBusy ? () => {} : () => setTestiDel(null)} label="Hapus testimoni" size="max-w-md">
          <div className="p-8">
            <div className="size-12 rounded-xl bg-adm-err/10 text-adm-err flex items-center justify-center mb-4">
              <Icon name="trash" className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Hapus testimoni “{testiDel.name}”?</h3>
            <p className="text-sm text-adm-sec mb-6">
              Baris akan dihapus dari Google Sheet dan hilang dari situs. Tindakan ini tidak bisa dibatalkan. Jika hanya
              tidak ingin menampilkannya, gunakan <b>Tolak</b> atau <b>Batalkan persetujuan</b>.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setTestiDel(null)}
                disabled={testiDelBusy}
                className="px-6 py-3 rounded-full ring-1 ring-adm-line font-semibold hover:ring-adm-primary hover:text-adm-primary transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmTestiDelete}
                disabled={testiDelBusy}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-adm-err text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
              >
                {testiDelBusy && <Spinner />} Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}

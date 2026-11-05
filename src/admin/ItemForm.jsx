import { useState } from "react";
import { SITE } from "../config";
import { api } from "./api";
import ImageField from "./ImageField";
import { Field, Icon, Modal, Spinner, inputCls } from "./ui";

const TITLES = {
  client: ["Tambah Koleksi Client", "Edit Koleksi Client"],
  tema: ["Tambah Tema Baru", "Edit Tema"],
};
const isPrice = (v) => /^[0-9.,]{1,12}$/.test(v.trim());
const isHttps = (v) => /^https:\/\/\S+$/i.test(v.trim());

/** Form tambah / ubah satu koleksi (client atau tema). */
export default function ItemForm({ type, item, token, tagOptions, cats, onClose, onSaved, onExpired }) {
  const edit = Boolean(item);
  const [f, setF] = useState(() => ({
    id: item?.id || "",
    name: item?.name || "",
    date: item?.date || "",
    tag: item?.tag || "",
    cat: item?.cat || cats.find((c) => c.visible !== false)?.id || "",
    url: item?.url || "",
    img: item?.img || "",
    shot1: item?.shot1 || "",
    shot2: item?.shot2 || "",
    featured: item?.featured ?? false,
    visible: item?.visible ?? true,
    noText: item?.noText ?? false,
    was: item?.was || "",
    now: item?.now || "",
    title: item?.title || "",
  }));
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const setVal = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const toggle = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.checked }));

  const validate = () => {
    const v = {};
    if (!f.name.trim()) v.name = "Wajib diisi";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) v.date = "Pilih tanggal";
    if (type === "client" && !f.tag.trim()) v.tag = "Wajib diisi";
    if (type === "tema" && !f.cat) v.cat = "Pilih kategori";
    if (type === "tema" && f.title.trim().length > 80) v.title = "Maksimal 80 karakter";
    if (!isHttps(f.url)) v.url = "Harus berupa link https://";
    for (const k of ["img", "shot1", "shot2"]) {
      if (f[k].trim() && !isHttps(f[k])) v[k] = "Harus berupa link https://";
    }
    if (!!f.shot1.trim() !== !!f.shot2.trim()) v.shot2 = "Isi kedua screenshot atau kosongkan keduanya";
    if (type === "tema") {
      if (f.was.trim() && !isPrice(f.was)) v.was = "Hanya angka, mis. 299.000";
      if (f.now.trim() && !isPrice(f.now)) v.now = "Hanya angka, mis. 149.000";
      if (!v.was && !v.now && !!f.was.trim() !== !!f.now.trim())
        v.now = "Isi harga coret dan harga sekaligus, atau kosongkan keduanya";
    }
    return v;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrs(v);
    setServerErr("");
    if (Object.keys(v).length) return;

    setBusy(true);
    const payload = {
      id: f.id || undefined,
      type,
      name: f.name.trim(),
      date: f.date,
      tag: type === "tema" ? cats.find((c) => c.id === f.cat)?.label || "" : f.tag.trim(),
      cat: type === "tema" ? f.cat : "",
      url: f.url.trim(),
      img: f.img.trim(),
      shot1: f.shot1.trim(),
      shot2: f.shot2.trim(),
      featured: type === "client" ? f.featured : false,
      visible: f.visible,
      noText: f.noText,
      title: type === "tema" ? f.title.trim() : "",
      was: type === "tema" ? f.was.trim() : "",
      now: type === "tema" ? f.now.trim() : "",
    };
    const out = await api.save(token, payload);
    setBusy(false);
    if (out.code === 401) return onExpired();
    if (!out.ok) return setServerErr(out.error || "Gagal menyimpan.");
    onSaved(out.item, edit);
  };

  const label = TITLES[type][edit ? 1 : 0];

  return (
    <Modal onClose={busy ? () => {} : onClose} label={label} size="max-w-3xl">
      <form onSubmit={submit} noValidate className="p-6 md:p-10">
        <span className="inline-block px-3 py-1 bg-adm-primary/10 text-adm-primary text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          {type === "client" ? "Koleksi Client" : "Tema Katalog"}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold mb-8">{label}</h2>

        <div className="grid md:grid-cols-2 gap-5">
          <Field
            label={type === "client" ? "Nama mempelai" : "Nama contoh mempelai"}
            hint='Contoh: "Rere & Jabal"'
            error={errs.name}
          >
            <input value={f.name} onChange={set("name")} maxLength={80} className={inputCls} placeholder="Nama & Nama" />
          </Field>
          <Field
            label={type === "client" ? "Tanggal nikah" : "Tanggal contoh"}
            error={errs.date}
          >
            <input type="date" value={f.date} onChange={set("date")} className={inputCls} />
          </Field>

          {type === "client" ? (
            <Field label="Tema / template yang dipakai" hint='Label kecil di kartu, mis. "Navy Elegant"' error={errs.tag}>
              <input
                value={f.tag}
                onChange={set("tag")}
                maxLength={60}
                list="tag-options"
                className={inputCls}
                placeholder="Navy Elegant"
              />
              <datalist id="tag-options">
                {tagOptions.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </Field>
          ) : (
            <>
              <Field label="Kategori tema" hint="Belum ada yang cocok? Tambahkan di menu Kategori Tema." error={errs.cat}>
                <select value={f.cat} onChange={set("cat")} className={inputCls}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                      {c.visible === false ? " (disembunyikan)" : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Nama tema (opsional)" hint='Judul di kartu katalog, mis. "Rustic Garden". Kosongkan untuk otomatis "Kategori 01, 02, …".' error={errs.title}>
                <input value={f.title} onChange={set("title")} maxLength={80} className={inputCls} placeholder="mis. Rustic Garden" />
              </Field>
            </>
          )}

          <Field
            label={type === "client" ? "Link undangan" : "Link demo tema"}
            hint="Harus diawali https://"
            error={errs.url}
          >
            <input
              value={f.url}
              onChange={set("url")}
              inputMode="url"
              className={inputCls}
              placeholder={`${SITE}/nama-undangan/`}
            />
          </Field>
        </div>

        <div className="mt-6 space-y-6">
          <ImageField
            label={type === "client" ? "Foto cover undangan" : "Foto cover (cadangan)"}
            hint="Dipakai sebagai latar kartu. Foto otomatis diperkecil sebelum diunggah."
            value={f.img}
            onChange={setVal("img")}
            token={token}
            onExpired={onExpired}
            error={errs.img}
          />
          {type === "tema" && (
            <div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Harga coret khusus tema ini (opsional)" hint="Contoh: 299.000" error={errs.was}>
                  <input value={f.was} onChange={set("was")} inputMode="decimal" maxLength={12} className={inputCls} placeholder="299.000" />
                </Field>
                <Field label="Harga khusus tema ini (opsional)" hint="Contoh: 149.000" error={errs.now}>
                  <input value={f.now} onChange={set("now")} inputMode="decimal" maxLength={12} className={inputCls} placeholder="149.000" />
                </Field>
              </div>
              <p className="text-xs text-adm-sec mt-2">
                Kosongkan keduanya untuk memakai harga kategori. Selama promo berjalan, harga promo tetap menggantikan harga ini.
              </p>
            </div>
          )}
          <label className="flex items-start gap-3 cursor-pointer text-sm">
            <input type="checkbox" checked={f.noText} onChange={toggle("noText")} className="mt-0.5 size-5 shrink-0 accent-adm-primary" />
            <span>
              <span className="font-medium">Gambar cover sudah berisi tulisan (screenshot)</span>
              <span className="block text-adm-sec mt-0.5">
                Centang jika yang diunggah screenshot undangan, bukan foto polos. Teks nama, “Kepada Yth.”, dan tombol di
                kartu akan disembunyikan agar gambar terlihat utuh. Tidak perlu dicentang jika Anda mengisi kedua
                screenshot di bawah.
              </span>
            </span>
          </label>
          <div>
            <div className="grid md:grid-cols-2 gap-6">
              <ImageField
                label="Screenshot 1 (cover)"
                hint="Tampil di ponsel kiri pada kartu katalog."
                value={f.shot1}
                onChange={setVal("shot1")}
                token={token}
                onExpired={onExpired}
                error={errs.shot1}
              />
              <ImageField
                label="Screenshot 2 (halaman lain)"
                hint="Tampil di ponsel kanan, mis. galeri."
                value={f.shot2}
                onChange={setVal("shot2")}
                token={token}
                onExpired={onExpired}
                error={errs.shot2}
              />
            </div>
            <p className="text-xs text-adm-sec mt-2">
              Opsional. Jika <b>kedua</b> screenshot diisi, kartu di katalog tampil dengan <b>dua ponsel</b> berisi
              screenshot apa adanya (tanpa teks tambahan), seperti koleksi client lainnya. Jika kosong, kartu memakai foto
              cover di atas.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <label className="inline-flex items-center gap-3 cursor-pointer text-sm font-medium">
            <input type="checkbox" checked={f.visible} onChange={toggle("visible")} className="size-5 accent-adm-primary" />
            Tampilkan di situs
          </label>
          {type === "client" && (
            <label className="inline-flex items-center gap-3 cursor-pointer text-sm font-medium">
              <input type="checkbox" checked={f.featured} onChange={toggle("featured")} className="size-5 accent-adm-primary" />
              Tampilkan di beranda (unggulan)
            </label>
          )}
        </div>

        {serverErr && (
          <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl bg-adm-err/10 text-adm-err text-sm px-4 py-3">
            <Icon name="alert" className="size-4 mt-0.5 shrink-0" />
            {serverErr}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-8 py-3.5 rounded-full ring-1 ring-adm-line font-semibold hover:ring-adm-primary hover:text-adm-primary transition-colors disabled:opacity-60 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-adm-primary text-white font-bold hover:bg-adm-hover transition-colors shadow-lg shadow-adm-primary/30 disabled:opacity-60 cursor-pointer"
          >
            {busy ? <Spinner /> : <Icon name="check" className="size-5" />}
            {busy ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

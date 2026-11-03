import { useState } from "react";
import { api } from "./api";
import { Field, Icon, Modal, Spinner, inputCls } from "./ui";

// "Syar'i" → "syari", "Modern Floral" → "modern-floral"
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/['’`]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

const isPrice = (v) => /^[0-9.,]{1,12}$/.test(v.trim());

/** Form tambah / ubah satu kategori tema. `existing` = semua kategori (bawaan kode + dashboard) untuk cek duplikat. */
export default function CategoryForm({ item, existing, token, onClose, onSaved, onExpired }) {
  const edit = Boolean(item);
  const [f, setF] = useState(() => ({
    id: item?.id || "",
    label: item?.label || "",
    desc: item?.desc || "",
    was: item?.was || "",
    now: item?.now || "",
    visible: item?.visible ?? true,
  }));
  const [idTouched, setIdTouched] = useState(false); // ID otomatis dari nama sampai diubah manual
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const setLabel = (e) => {
    const label = e.target.value;
    setF((s) => ({ ...s, label, ...(edit || idTouched ? {} : { id: slug(label) }) }));
  };
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    const v = {};
    const others = existing.filter((c) => c.id !== item?.id);
    if (!f.label.trim()) v.label = "Wajib diisi";
    else if (others.some((c) => c.label.toLowerCase() === f.label.trim().toLowerCase()))
      v.label = "Nama kategori sudah dipakai";
    if (!/^[a-z0-9-]{1,40}$/.test(f.id)) v.id = "Hanya huruf kecil, angka, dan tanda -";
    else if (!edit && existing.some((c) => c.id === f.id)) v.id = "ID sudah dipakai";
    if (f.was.trim() && !isPrice(f.was)) v.was = "Hanya angka, mis. 299.000";
    if (f.now.trim() && !isPrice(f.now)) v.now = "Hanya angka, mis. 149.000";
    if (!v.was && !v.now && !!f.was.trim() !== !!f.now.trim()) v.now = "Isi harga coret dan harga sekaligus, atau kosongkan keduanya";
    return v;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrs(v);
    setServerErr("");
    if (Object.keys(v).length) return;
    setBusy(true);
    const out = await api.catSave(token, {
      id: f.id,
      label: f.label.trim(),
      desc: f.desc.trim(),
      was: f.was.trim(),
      now: f.now.trim(),
      visible: f.visible,
      isEdit: edit,
    });
    setBusy(false);
    if (out.code === 401) return onExpired();
    if (!out.ok) return setServerErr(out.error || "Gagal menyimpan.");
    onSaved(out.item, edit);
  };

  const label = edit ? "Edit Kategori Tema" : "Tambah Kategori Tema";

  return (
    <Modal onClose={busy ? () => {} : onClose} label={label} size="max-w-xl">
      <form onSubmit={submit} noValidate className="p-6 md:p-10">
        <span className="inline-block px-3 py-1 bg-adm-primary/10 text-adm-primary text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          Kategori Tema
        </span>
        <h2 className="text-2xl md:text-3xl font-bold mb-8">{label}</h2>

        <div className="space-y-5">
          <Field label="Nama kategori" hint='Tampil di katalog, mis. "Modern Floral"' error={errs.label}>
            <input value={f.label} onChange={setLabel} maxLength={60} className={inputCls} placeholder="Nama kategori" />
          </Field>

          <Field
            label="ID (alamat kategori)"
            hint={edit ? "ID tidak bisa diubah setelah dibuat." : "Otomatis dari nama; dipakai di link katalog ?kategori=…"}
            error={errs.id}
          >
            <input
              value={f.id}
              onChange={(e) => {
                setIdTouched(true);
                setF((s) => ({ ...s, id: slug(e.target.value) }));
              }}
              disabled={edit}
              maxLength={40}
              className={`${inputCls} disabled:opacity-60`}
              placeholder="modern-floral"
            />
          </Field>

          <Field label="Deskripsi singkat" hint="Tampil di bawah judul kategori (opsional)" error={errs.desc}>
            <textarea
              value={f.desc}
              onChange={set("desc")}
              maxLength={200}
              rows={3}
              className={`${inputCls} resize-y`}
              placeholder="Desain dengan sentuhan bunga yang lembut dan romantis."
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Harga coret (opsional)" hint="Contoh: 299.000" error={errs.was}>
              <input value={f.was} onChange={set("was")} inputMode="decimal" maxLength={12} className={inputCls} placeholder="299.000" />
            </Field>
            <Field label="Harga (opsional)" hint="Contoh: 149.000" error={errs.now}>
              <input value={f.now} onChange={set("now")} inputMode="decimal" maxLength={12} className={inputCls} placeholder="149.000" />
            </Field>
          </div>
          <p className="text-xs text-adm-sec -mt-2">
            Selama promo aktif, harga promo otomatis menggantikan harga ini di semua kategori.
          </p>

          <label className="inline-flex items-center gap-3 cursor-pointer text-sm font-medium">
            <input
              type="checkbox"
              checked={f.visible}
              onChange={(e) => setF((s) => ({ ...s, visible: e.target.checked }))}
              className="size-5 accent-adm-primary"
            />
            Tampilkan di situs
          </label>
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

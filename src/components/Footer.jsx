export default function Footer({ className = "pt-8 pb-24 sm:pb-8" }) {
  return (
    <footer
      className={`${className} text-center text-xs text-sk-300/70 border-t border-sk-300/10`}
    >
      &copy; {new Date().getFullYear()} Aisyae Digital Invitation — Dibuat
      dengan cinta.
    </footer>
  );
}

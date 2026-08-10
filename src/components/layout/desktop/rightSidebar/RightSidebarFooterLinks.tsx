/** @format */

export default function RightSidebarFooterLinks() {
  const links = ["Про нас", "Конфіденційність", "Умови", "Допомога"];

  return (
    <div className="px-2 text-xs text-muted-foreground">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {links.map((link) => (
          <button key={link} className="hover:underline">
            {link}
          </button>
        ))}
      </div>

      <p className="mt-3">ASP.NET · TypeScript · React</p>
      <p className="mt-3">© {new Date().getFullYear()} Chirp</p>
    </div>
  );
}

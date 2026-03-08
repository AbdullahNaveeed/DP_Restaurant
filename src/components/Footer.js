import Link from "next/link";
import {
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
} from "react-icons/hi";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Our Menu" },
  { href: "/cart", label: "Cart" },
  { href: "/admin/login", label: "Admin" },
];

const HOURS = [
  { day: "Mon - Fri", time: "11am - 11pm" },
  { day: "Saturday", time: "10am - 12am" },
  { day: "Sunday", time: "10am - 10pm" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border-color bg-bg-secondary">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 min-[375px]:px-5 min-[480px]:px-6 md:px-8 md:py-14 lg:px-10 lg:py-16 min-[1440px]:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div>
            <Link href="/" className="font-serif text-2xl font-bold gold-text">
              Ghani Shinwari
            </Link>
            <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-text-muted">
              Traditional Shinwari dining focused on karahi, dum pukht, rosh, and authentic charcoal-grilled meat specialties.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition-colors hover:text-accent-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex items-start gap-2.5">
                <HiOutlineLocationMarker
                  size={16}
                  className="mt-0.5 shrink-0 text-accent-gold"
                />
                <span>123 Gourmet Avenue, NYC</span>
              </li>
              <li className="flex items-start gap-2.5">
                <HiOutlinePhone
                  size={16}
                  className="mt-0.5 shrink-0 text-accent-gold"
                />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="flex items-start gap-2.5">
                <HiOutlineMail
                  size={16}
                  className="mt-0.5 shrink-0 text-accent-gold"
                />
                <span>hello@ghanishinwari.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
              Hours
            </h4>
            <ul className="space-y-2.5 text-sm text-text-muted">
              {HOURS.map((row) => (
                <li key={row.day} className="flex items-center justify-between gap-4">
                  <span>{row.day}</span>
                  <span className="shrink-0 text-text-secondary">{row.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border-color">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-text-muted min-[375px]:px-5 min-[480px]:px-6 md:flex-row md:px-8 md:py-5 lg:px-10 min-[1440px]:px-12">
          <p>© {new Date().getFullYear()} Ghani Shinwari. All rights reserved.</p>
          <p>Crafted with passion.</p>
        </div>
      </div>
    </footer>
  );
}

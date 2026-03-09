"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/app/auth/auth-context";
import {
  HiOutlineMenuAlt3,
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiX,
} from "react-icons/hi";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/cart", label: "Cart" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { items } = useCart();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const navLinkClass = (href) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:px-4 ${
      pathname === href
        ? "bg-accent-gold/10 text-accent-gold"
        : "text-text-secondary hover:bg-bg-elevated/60 hover:text-text-primary"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto w-full max-w-7xl px-4 min-[375px]:px-5 min-[480px]:px-6 md:px-8 lg:px-10 min-[1440px]:px-12">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <Link
            href="/"
            className="shrink-0 font-serif text-xl font-bold gold-text sm:text-2xl"
            aria-label="Ghani Shinwari home"
          >
            Ghani Shinwari
          </Link>

          <div className="hidden items-center gap-1 md:flex lg:gap-2">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
            {user ? (
               <Link
                 href="/profile"
                 className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated/60 hover:text-accent-gold lg:px-4"
               >
                 <HiOutlineUser size={18} />
                 Profile
               </Link>
            ) : (
              <>
                <Link href="/auth/login" className={navLinkClass("/auth/login")}>
                  Login
                </Link>
                <Link href="/auth/signup" className={navLinkClass("/auth/signup")}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated/60 hover:text-accent-gold"
              aria-label={`Shopping cart${totalItems ? ` with ${totalItems} items` : ""}`}
            >
              <HiOutlineShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="gold-gradient absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-bg-primary">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-elevated/60 hover:text-text-primary md:hidden"
              aria-label="Open menu"
              aria-controls="mobile-menu-panel"
              aria-expanded={menuOpen}
            >
              <HiOutlineMenuAlt3 size={24} />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-overlay transition-opacity duration-300 md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="mobile-menu-panel"
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[85vw] flex-col border-l border-border-color bg-bg-secondary transition-transform duration-300 ease-out sm:max-w-sm md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex h-16 items-center justify-between border-b border-border-color px-4 sm:h-20 sm:px-5">
          <span className="font-serif text-lg font-bold gold-text">Menu</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-elevated/60 hover:text-text-primary"
            aria-label="Close menu"
          >
            <HiX size={22} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`flex min-h-11 items-center rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                pathname === link.href
                  ? "bg-accent-gold/10 text-accent-gold"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border-color p-4 space-y-3">
          {user ? (
            <Link
               href="/profile"
               onClick={() => setMenuOpen(false)}
               className="btn-secondary flex w-full items-center justify-center gap-2 rounded-lg"
            >
              <HiOutlineUser size={18} />
              Profile
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="btn-secondary w-full rounded-lg text-center"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMenuOpen(false)}
                className="btn-primary w-full rounded-lg text-center"
              >
                Sign Up
              </Link>
            </div>
          )}
          <Link
            href="/menu"
            onClick={() => setMenuOpen(false)}
            className="btn-primary w-full rounded-lg text-center"
          >
            Order Now
          </Link>
        </div>
      </aside>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions/new", label: "Isi Transaksi" },
  { href: "/transactions", label: "Rekap" },
  { href: "/workers", label: "Worker" },
  { href: "/admin-staff", label: "Admin CS" },
  { href: "/products", label: "Produk" },
];

export default function Nav({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-[rgba(10,10,18,0.85)] border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aura to-[#5b3fae] flex items-center justify-center shadow-[0_0_14px_rgba(155,107,255,0.4)]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3H18L22 9L12 21L2 9L6 3Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display font-semibold text-[16px]">Aura Store</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition ${
                  active ? "bg-panel2 text-white border border-aura" : "text-muted hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          {role === "OWNER" && (
            <Link
              href="/users"
              className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition ${
                pathname === "/users" ? "bg-panel2 text-white border border-aura" : "text-muted hover:text-white"
              }`}
            >
              Pengguna
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[12.5px] text-muted">{name}</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-secondary">
            Keluar
          </button>
        </div>
      </div>
      <div className="md:hidden flex gap-1 overflow-x-auto px-4 pb-3 max-w-6xl mx-auto">
        {links.concat(role === "OWNER" ? [{ href: "/users", label: "Pengguna" }] : []).map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] whitespace-nowrap ${
              pathname === l.href ? "bg-panel2 text-white border border-aura" : "text-muted"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

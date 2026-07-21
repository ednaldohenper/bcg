import { useClerk, useUser } from "@clerk/react";
import { useLocation } from "wouter";

export default function Header() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, navigate] = useLocation();
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  if (!isLoaded) return null;

  return (
    <header className="w-full border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <span className="text-gold font-outfit font-bold text-lg tracking-tight">
          Estratégia BCG
        </span>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <div className="flex items-center gap-2">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.firstName ?? ""}
                    className="w-8 h-8 rounded-full border border-zinc-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gold text-sm font-bold">
                    {user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <span className="text-zinc-300 text-sm hidden sm:block">
                  {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress}
                </span>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: `${base}/` })}
                className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-md transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate(`/sign-in`)}
              className="text-xs font-semibold bg-gold text-black px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

import { useEffect, useState } from "react";

/** Strips the leading `#` from `window.location.hash`, defaulting to `"/"`. */
function getHashPath(): string {
  return window.location.hash.replace(/^#/, "") || "/";
}

/**
 * useRouter — minimal hash-based router for the catalogue demo.
 *
 * Returns the current path (hash without `#`) and a `navigate` function that
 * updates the hash, triggering `hashchange` to re-render the active view.
 *
 * Routes are plain strings like `"/demo"` or `"/demo/datasets/DS-001"`.
 */
export function useRouter(): { path: string; navigate: (path: string) => void } {
  const [path, setPath] = useState<string>(getHashPath);

  useEffect(() => {
    const handler = (): void => setPath(getHashPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  function navigate(p: string): void {
    window.location.hash = p;
  }

  return { path, navigate };
}

import { isAbsolute, relative, resolve } from "node:path";

export function resolveStoragePath(storageRoot: string, relativePath: string): string {
  const root = resolve(storageRoot);
  const candidate = resolve(root, relativePath);
  const fromRoot = relative(root, candidate);
  if (isAbsolute(relativePath) || fromRoot === ".." || fromRoot.startsWith(`..\\`) || fromRoot.startsWith("../") || isAbsolute(fromRoot)) {
    throw new Error("STORAGE_PATH_OUTSIDE_ROOT");
  }
  return candidate;
}

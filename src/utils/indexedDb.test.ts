import { afterEach, describe, expect, it, vi } from "vitest";
import { createIndexedDbStore } from "@/utils/indexedDb";

function harness() {
  const request = {
    result: "saved",
    onsuccess: null as (() => void) | null,
    onerror: null as (() => void) | null,
    error: new Error("request failed"),
  };
  const transaction = {
    objectStore: vi.fn().mockReturnValue({}),
    oncomplete: null as (() => void) | null,
    onabort: null as (() => void) | null,
    onerror: null as (() => void) | null,
    error: new Error("commit failed"),
  };
  const database = {
    transaction: vi.fn().mockReturnValue(transaction),
    close: vi.fn(),
  };
  const opening = { result: database, onsuccess: null as (() => void) | null };
  vi.stubGlobal("indexedDB", { open: vi.fn().mockReturnValue(opening) });
  const run = createIndexedDbStore({
    database: "test",
    store: "items",
    version: 1,
  });
  const promise = run(
    "readwrite",
    () => request as unknown as IDBRequest<string>,
  );
  return { request, transaction, database, opening, promise };
}
afterEach(() => vi.unstubAllGlobals());
describe("IndexedDB transaction completion", () => {
  it("waits for commit after request success and closes the connection", async () => {
    const test = harness();
    const settled = vi.fn();
    void test.promise.then(settled);
    test.opening.onsuccess?.();
    await Promise.resolve();
    test.request.onsuccess?.();
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    expect(test.database.close).not.toHaveBeenCalled();
    test.transaction.oncomplete?.();
    await expect(test.promise).resolves.toBe("saved");
    expect(test.database.close).toHaveBeenCalledOnce();
  });
  it("rejects a transaction that aborts after its request succeeded", async () => {
    const test = harness();
    const rejection = expect(test.promise).rejects.toThrow("commit failed");
    test.opening.onsuccess?.();
    await Promise.resolve();
    test.request.onsuccess?.();
    test.transaction.onabort?.();
    await rejection;
    expect(test.database.close).toHaveBeenCalledOnce();
  });
});

interface StoreConfig {
  database: string;
  store: string;
  version: number;
  options?: IDBObjectStoreParameters;
}

/** A request succeeds only once its transaction has committed. */
export function createIndexedDbStore(config: StoreConfig) {
  const open = () =>
    new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(config.database, config.version);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(config.store))
          database.createObjectStore(config.store, config.options);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  return async function transaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const database = await open();
    try {
      return await new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(config.store, mode);
        let result: T;
        transaction.oncomplete = () => resolve(result);
        transaction.onabort = () =>
          reject(
            transaction.error ?? new Error("IndexedDB transaction aborted"),
          );
        transaction.onerror = () => reject(transaction.error);
        const request = operation(transaction.objectStore(config.store));
        request.onsuccess = () => {
          result = request.result;
        };
        request.onerror = () => reject(request.error);
      });
    } finally {
      database.close();
    }
  };
}

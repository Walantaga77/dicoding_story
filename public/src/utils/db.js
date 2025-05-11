// Gunakan versi ESM dari idb via unpkg
import { openDB } from 'https://unpkg.com/idb?module';

const DB_NAME = 'story-app';
const STORE_NAME = 'stories';

export const StoryDB = {
    async init() {
        return openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            },
        });
    },

    async saveStories(stories) {
        const db = await this.init();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        stories.forEach(story => store.put(story));
        await tx.done;
    },

    async getAllStories() {
        const db = await this.init();
        return db.getAll(STORE_NAME);
    },

    async clearStories() {
        const db = await this.init();
        return db.clear(STORE_NAME);
    }
};

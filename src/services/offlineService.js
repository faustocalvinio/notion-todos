// Servicio simple para cache local y cola offline usando localStorage
// Claves de almacenamiento
const KEYS = {
    TODOS_CACHE: 'nt.todosCache',
    QUEUE: 'nt.queue',
    ID_MAP: 'nt.idMap',
};

function safeParse(json, fallback) {
    try {
        return json ? JSON.parse(json) : fallback;
    } catch {
        return fallback;
    }
}

export const offlineService = {
    isOnline() {
        return typeof navigator !== 'undefined' ? navigator.onLine : true;
    },

    // Cache de todos
    getTodosCache() {
        return safeParse(localStorage.getItem(KEYS.TODOS_CACHE), []);
    },
    setTodosCache(todos) {
        localStorage.setItem(KEYS.TODOS_CACHE, JSON.stringify(todos));
    },
    upsertTodoInCache(todo) {
        const cache = this.getTodosCache();
        const idx = cache.findIndex((t) => t.id === todo.id);
        if (idx >= 0) {
            cache[idx] = { ...cache[idx], ...todo };
        } else {
            cache.unshift(todo);
        }
        this.setTodosCache(cache);
    },
    replaceTodoIdInCache(oldId, newId) {
        const cache = this.getTodosCache();
        const idx = cache.findIndex((t) => t.id === oldId);
        if (idx >= 0) {
            cache[idx].id = newId;
            cache[idx].pending = false;
            this.setTodosCache(cache);
        }
    },
    removeTodoFromCache(id) {
        const cache = this.getTodosCache().filter((t) => t.id !== id);
        this.setTodosCache(cache);
    },

    // Mapeo de IDs temporales -> reales
    getIdMap() {
        return safeParse(localStorage.getItem(KEYS.ID_MAP), {});
    },
    setIdMap(map) {
        localStorage.setItem(KEYS.ID_MAP, JSON.stringify(map));
    },
    setIdMapping(tempId, realId) {
        const map = this.getIdMap();
        map[tempId] = realId;
        this.setIdMap(map);
    },
    resolveId(id) {
        const map = this.getIdMap();
        return map[id] || id;
    },

    // Cola offline
    getQueue() {
        return safeParse(localStorage.getItem(KEYS.QUEUE), []);
    },
    setQueue(queue) {
        localStorage.setItem(KEYS.QUEUE, JSON.stringify(queue));
    },
    enqueue(op) {
        const q = this.getQueue();
        q.push({ ...op, enqueuedAt: Date.now() });
        this.setQueue(q);
    },
    dequeue() {
        const q = this.getQueue();
        const op = q.shift();
        this.setQueue(q);
        return op;
    },
    updatePendingRefs(oldId, newId) {
        const q = this.getQueue();
        const updated = q.map((op) => {
            if (op.targetId === oldId) return { ...op, targetId: newId };
            if (op.tempId === oldId) return { ...op, tempId: newId };
            return op;
        });
        this.setQueue(updated);
    },
};

export default offlineService;

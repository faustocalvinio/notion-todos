import offlineService from './offlineService';

class NotionService {
    constructor() {
        this.apiKey = import.meta.env.VITE_NOTION_API_KEY;
        this.databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
        // Permite override explícito para entorno preview/local
        const functionsUrlOverride = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL; // e.g., http://localhost:8888/.netlify/functions/notion-proxy
        if (import.meta.env.DEV) {
            this.baseURL = '/api/notion';
        } else if (functionsUrlOverride) {
            this.baseURL = functionsUrlOverride;
        } else {
            this.baseURL = '/.netlify/functions/notion-proxy';
        }
        this.isProduction = !import.meta.env.DEV;

        // Sync en reconexión
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.syncQueue().catch((e) => console.error('Sync failed:', e));
            });
        }
    }

    async makeRequest(endpoint, options = {}) {
        if (this.isProduction) {
            const url = this.baseURL;
            const body = {
                path: endpoint,
                method: options.method || 'GET',
                body: options.body ? JSON.parse(options.body) : undefined
            };

            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            };

            try {
                const response = await fetch(url, config);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Notion API error: ${response.status} - ${errorData.message || response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Notion API request failed:', error, '\nURL:', url, '\nMode:', this.isProduction ? 'prod' : 'dev');
                throw error;
            }
        } else {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28',
                    ...options.headers
                },
                ...options
            };

            try {
                const response = await fetch(url, config);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`Notion API error: ${response.status} - ${errorData.message || response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Notion API request failed:', error, '\nURL:', url, '\nMode:', this.isProduction ? 'prod' : 'dev');
                throw error;
            }
        }
    }

    generateTempId() {
        return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    async addTodo(title, tags = [], dueDate = null) {
        try {
            // Si offline: encolamos y actualizamos cache inmediata
            if (!offlineService.isOnline()) {
                const tempId = this.generateTempId();
                const offlineTodo = {
                    id: tempId,
                    title,
                    tags,
                    dueDate,
                    completed: false,
                    pending: true,
                };
                offlineService.upsertTodoInCache(offlineTodo);
                offlineService.enqueue({
                    type: 'add',
                    payload: { title, tags, dueDate },
                    tempId,
                });
                return { success: true, data: offlineTodo, offline: true };
            }

            const properties = {
                'Task name': {
                    title: [
                        {
                            text: {
                                content: title,
                            },
                        },
                    ],
                },
            };

            if (tags.length > 0) {
                properties['Tags'] = {
                    multi_select: tags.map(tag => ({ name: tag })),
                };
            }

            if (dueDate) {
                properties['Due'] = {
                    date: {
                        start: dueDate,
                    },
                };
            }

            const response = await this.makeRequest('/pages', {
                method: 'POST',
                body: JSON.stringify({
                    parent: {
                        database_id: this.databaseId,
                    },
                    properties,
                })
            });

            return {
                success: true,
                data: response,
            };
        } catch (error) {
            console.error('Error adding todo to Notion:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async getTodos() {
        try {
            // Si offline, devolvemos cache
            if (!offlineService.isOnline()) {
                const cached = offlineService.getTodosCache();
                return { success: true, data: cached, offline: true };
            }

            const response = await this.makeRequest(`/databases/${this.databaseId}/query`, {
                method: 'POST',
                body: JSON.stringify({})
            });

            const todos = response.results.map(page => {
                let completed = false;
                const statusProperty = page.properties['Status'];

                if (statusProperty?.status?.name) {
                    const statusName = statusProperty.status.name.toLowerCase();
                    completed = statusName === 'done' || statusName === 'completed' || statusName === 'complete' || statusName === 'finished';
                }

                return {
                    id: page.id,
                    title: page.properties['Task name']?.title[0]?.text?.content || '',
                    tags: page.properties['Tags']?.multi_select?.map(tag => tag.name) || [],
                    dueDate: page.properties['Due']?.date?.start || null,
                    completed: completed,
                };
            });

            // Actualizamos cache
            offlineService.setTodosCache(todos);

            return {
                success: true,
                data: todos,
            };
        } catch (error) {
            console.error('Error fetching todos from Notion:', error);
            // fallback cache en error
            const cached = offlineService.getTodosCache();
            if (cached.length) {
                return { success: true, data: cached, offline: true };
            }
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async getDatabaseSchema() {
        try {
            const response = await this.makeRequest(`/databases/${this.databaseId}`);
            return {
                success: true,
                data: response.properties,
            };
        } catch (error) {
            console.error('Error fetching database schema:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async updateTodoStatus(todoId, completed = true) {
        try {
            // Resolver tempId si fuese el caso
            const realOrTempId = offlineService.resolveId(todoId);

            if (!offlineService.isOnline()) {
                // Optimistic update en cache
                offlineService.upsertTodoInCache({ id: realOrTempId, completed });
                offlineService.enqueue({
                    type: 'updateStatus',
                    targetId: realOrTempId,
                    payload: { completed },
                });
                return { success: true, data: { id: realOrTempId, completed }, offline: true };
            }

            const statusValues = completed
                ? ['Done', 'Completed', 'Complete', 'Finished']
                : ['Not started', 'To do', 'Todo', 'Pending', 'In progress'];

            for (const statusValue of statusValues) {
                try {
                    const response = await this.makeRequest(`/pages/${realOrTempId}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            properties: {
                                'Status': {
                                    status: {
                                        name: statusValue
                                    }
                                },
                            },
                        })
                    });
                    console.log(`Status updated successfully with: "${statusValue}"`);
                    return {
                        success: true,
                        data: response,
                    };
                } catch (statusError) {
                    console.log(`Status "${statusValue}" failed:`, statusError.message);
                    continue;
                }
            }

            throw new Error('No se pudo actualizar el status. Verifica las opciones disponibles en tu base de datos de Notion.');
        } catch (error) {
            console.error('Error updating todo status:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async deleteTodo(todoId) {
        try {
            const realOrTempId = offlineService.resolveId(todoId);

            if (!offlineService.isOnline()) {
                // Eliminamos de cache y encolamos
                offlineService.removeTodoFromCache(realOrTempId);
                offlineService.enqueue({ type: 'delete', targetId: realOrTempId });
                return { success: true, data: { id: realOrTempId }, offline: true };
            }

            const response = await this.makeRequest(`/pages/${realOrTempId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    archived: true,
                })
            });

            return {
                success: true,
                data: response,
            };
        } catch (error) {
            console.error('Error deleting todo:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async syncQueue() {
        const queue = offlineService.getQueue();
        if (!queue.length || !offlineService.isOnline()) return { synced: 0 };

        let synced = 0;
        while (offlineService.getQueue().length && offlineService.isOnline()) {
            const op = offlineService.dequeue();
            try {
                if (op.type === 'add') {
                    const res = await this.addTodo(op.payload.title, op.payload.tags, op.payload.dueDate);
                    if (res.success && !res.offline) {
                        const realId = res.data?.id;
                        if (realId && op.tempId) {
                            offlineService.setIdMapping(op.tempId, realId);
                            offlineService.replaceTodoIdInCache(op.tempId, realId);
                            offlineService.updatePendingRefs(op.tempId, realId);
                        }
                    } else {
                        // Si seguimos offline, re-encolar y salir
                        offlineService.enqueue(op);
                        break;
                    }
                } else if (op.type === 'updateStatus') {
                    await this.updateTodoStatus(op.targetId, op.payload.completed);
                } else if (op.type === 'delete') {
                    await this.deleteTodo(op.targetId);
                }
                synced++;
            } catch (e) {
                console.warn('Failed to process op from queue, re-enqueueing:', e);
                offlineService.enqueue(op);
                break; // Evitar loop en errores persistentes
            }
        }
        return { synced };
    }
}

export default new NotionService();

class NotionService {
    constructor() {
        this.apiKey = import.meta.env.VITE_NOTION_API_KEY;
        this.databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
        this.baseURL = import.meta.env.DEV ? '/api/notion' : '/.netlify/functions/notion-proxy';
        this.isProduction = !import.meta.env.DEV;
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
                console.error('Notion API request failed:', error);
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
                console.error('Notion API request failed:', error);
                throw error;
            }
        }
    }

    async addTodo(title, tags = [], dueDate = null, content = null, iconEmoji = null) {
        try {
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

            // Preparar children si llega contenido
            let children;
            if (content) {
                if (Array.isArray(content)) {
                    children = content;
                } else if (typeof content === 'string') {
                    // Separar por doble salto de línea para crear múltiples párrafos
                    const paragraphs = content
                        .split(/\n{2,}/)
                        .map((text) => text.trim())
                        .filter(Boolean)
                        .map((text) => ({
                            type: 'paragraph',
                            paragraph: {
                                rich_text: [
                                    {
                                        type: 'text',
                                        text: { content: text },
                                    },
                                ],
                            },
                        }));

                    // Si el usuario no puso doble salto de línea, crea un único párrafo
                    children = paragraphs.length > 0 ? paragraphs : [
                        {
                            type: 'paragraph',
                            paragraph: {
                                rich_text: [
                                    { type: 'text', text: { content } },
                                ],
                            },
                        },
                    ];
                }
            }

            const response = await this.makeRequest('/pages', {
                method: 'POST',
                body: JSON.stringify({
                    parent: {
                        database_id: this.databaseId,
                    },
                    properties,
                    ...(children ? { children } : {}),
                    ...(iconEmoji ? { icon: { type: 'emoji', emoji: iconEmoji } } : {}),
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
                    icon: page.icon?.type === 'emoji' ? page.icon.emoji : null,
                    completed: completed,
                };
            });

            return {
                success: true,
                data: todos,
            };
        } catch (error) {
            console.error('Error fetching todos from Notion:', error);
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
            const statusValues = completed
                ? ['Done', 'Completed', 'Complete', 'Finished']
                : ['Not started', 'To do', 'Todo', 'Pending', 'In progress'];

            for (const statusValue of statusValues) {
                try {
                    const response = await this.makeRequest(`/pages/${todoId}`, {
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
            const response = await this.makeRequest(`/pages/${todoId}`, {
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

    async updateTodoIcon(todoId, emoji = null) {
        try {
            const payload = emoji
                ? { icon: { type: 'emoji', emoji } }
                : { icon: null };

            const response = await this.makeRequest(`/pages/${todoId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });

            return { success: true, data: response };
        } catch (error) {
            console.error('Error updating todo icon:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new NotionService();

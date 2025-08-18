class CinemaService {
    constructor() {
        this.apiKey = import.meta.env.VITE_NOTION_API_KEY;
        this.databaseId = import.meta.env.VITE_NOTION_CINEMA_DATABASE_ID;
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

    async addCinemaContent(nombre, plataforma = null, minuto = null, iconEmoji = null, content = null) {
        try {
            const properties = {
                'Nombre': {
                    title: [
                        {
                            text: {
                                content: nombre,
                            },
                        },
                    ],
                },
            };

            if (plataforma) {
                properties['Plataforma'] = {
                    select: {
                        name: plataforma
                    }
                };
            }

            if (minuto && !isNaN(minuto)) {
                properties['Minuto'] = {
                    number: parseInt(minuto)
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
            console.error('Error adding cinema content to Notion:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async getCinemaContent() {
        try {
            const response = await this.makeRequest(`/databases/${this.databaseId}/query`, {
                method: 'POST',
                body: JSON.stringify({})
            });

            const content = response.results.map(page => {
                return {
                    id: page.id,
                    nombre: page.properties['Nombre']?.title[0]?.text?.content || '',
                    plataforma: page.properties['Plataforma']?.select?.name || null,
                    minuto: page.properties['Minuto']?.number || null,
                    icon: page.icon?.type === 'emoji' ? page.icon.emoji : null,
                };
            });

            return {
                success: true,
                data: content,
            };
        } catch (error) {
            console.error('Error fetching cinema content from Notion:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async deleteCinemaContent(contentId) {
        try {
            const response = await this.makeRequest(`/pages/${contentId}`, {
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
            console.error('Error deleting cinema content:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

export default new CinemaService();

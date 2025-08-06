exports.handler = async (event, context) => {
    // Configurar CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    };

    // Manejar preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { path, method = 'GET', body } = JSON.parse(event.body || '{}');

        if (!path) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Path is required' })
            };
        }

        const notionApiKey = process.env.VITE_NOTION_API_KEY;

        if (!notionApiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Notion API key not configured' })
            };
        }

        const url = `https://api.notion.com/v1${path}`;

        const requestOptions = {
            method,
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            }
        };

        if (body && (method === 'POST' || method === 'PATCH')) {
            requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, requestOptions);
        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify(data)
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Notion proxy error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

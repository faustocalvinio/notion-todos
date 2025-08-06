# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
This is a React application built with Vite that integrates with the Notion API to add and manage todos in a Notion database.

## Key Technologies
- React with Vite for the frontend
- Notion API (@notionhq/client) for database integration
- Axios for HTTP requests
- CSS modules or styled-components for styling

## Code Guidelines
- Use functional components with React hooks
- Implement proper error handling for API calls
- Use environment variables for sensitive data like API keys
- Follow React best practices for state management
- Implement loading states and user feedback for async operations

## Notion Integration Notes
- The app connects to a Notion database with tasks/todos
- Each todo should have at minimum: title, tags, and due date properties
- Use the Notion API to create new pages in the database
- Handle Notion API rate limiting and errors gracefully

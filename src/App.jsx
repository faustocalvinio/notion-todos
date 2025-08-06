import { useState } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import "./App.css";

export function App() {
   const [refreshTrigger, setRefreshTrigger] = useState(0);

   const handleTodoAdded = () => {
      // Trigger a refresh of the todo list
      setRefreshTrigger((prev) => prev + 1);
   };

   return (
      <div className="app">
         <header className="app-header">
            <h1>📝 Notion Todo Manager</h1>
            <p>
               Gestiona tus tareas directamente desde tu base de datos de Notion
            </p>
         </header>

         <main className="app-main">
            <TodoForm onTodoAdded={handleTodoAdded} />
            <TodoList refreshTrigger={refreshTrigger} />
         </main>

         <footer className="app-footer">
            <p>Construido con ❤️ usando React + Vite + Notion API</p>
         </footer>
      </div>
   );
}

import { useState, useEffect } from "react";
import notionService from "../services/notionService";
import "./TodoList.css";

const TodoList = ({ refreshTrigger }) => {
   const [todos, setTodos] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");
   const [updatingTodos, setUpdatingTodos] = useState(new Set());

   const fetchTodos = async () => {
      setIsLoading(true);
      setError("");

      try {
         const result = await notionService.getTodos();

         if (result.success) {
            setTodos(result.data);
         } else {
            setError(`Error: ${result.error}`);
         }
      } catch (err) {
         setError(`Error inesperado: ${err.message}`);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchTodos();
   }, [refreshTrigger]);

   const formatDate = (dateString) => {
      if (!dateString) return "Sin fecha";
      return new Date(dateString).toLocaleDateString("es-ES");
   };

   const handleCompleteToggle = async (todoId, currentStatus) => {
      setUpdatingTodos((prev) => new Set([...prev, todoId]));

      try {
         const result = await notionService.updateTodoStatus(
            todoId,
            !currentStatus
         );

         if (result.success) {
            // Actualizar el estado local
            setTodos((prevTodos) =>
               prevTodos.map((todo) =>
                  todo.id === todoId
                     ? { ...todo, completed: !currentStatus }
                     : todo
               )
            );
         } else {
            setError(`Error al actualizar: ${result.error}`);
         }
      } catch (err) {
         setError(`Error inesperado: ${err.message}`);
      } finally {
         setUpdatingTodos((prev) => {
            const newSet = new Set(prev);
            newSet.delete(todoId);
            return newSet;
         });
      }
   };

   const handleDelete = async (todoId) => {
      if (!confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
         return;
      }

      setUpdatingTodos((prev) => new Set([...prev, todoId]));

      try {
         const result = await notionService.deleteTodo(todoId);

         if (result.success) {
            // Remover del estado local
            setTodos((prevTodos) =>
               prevTodos.filter((todo) => todo.id !== todoId)
            );
         } else {
            setError(`Error al eliminar: ${result.error}`);
         }
      } catch (err) {
         setError(`Error inesperado: ${err.message}`);
      } finally {
         setUpdatingTodos((prev) => {
            const newSet = new Set(prev);
            newSet.delete(todoId);
            return newSet;
         });
      }
   };

   const handleDiagnostic = async () => {
      try {
         const schemaResult = await notionService.getDatabaseSchema();
         if (schemaResult.success) {
            console.log("Database Schema:", schemaResult.data);
            const statusField = schemaResult.data.Status;
            console.log("Status field type:", statusField?.type);
            console.log("Status field options:", statusField);

            if (statusField?.status?.options) {
               const statusOptions = statusField.status.options
                  .map((opt) => opt.name)
                  .join(", ");
               console.log("Available status options:", statusOptions);
               alert(
                  `Status field type: ${statusField?.type}\nAvailable options: ${statusOptions}\nCheck console for full details.`
               );
            } else {
               alert(
                  `Status field type: ${statusField?.type}\nCheck console for full details.`
               );
            }
         }
      } catch (err) {
         console.error("Diagnostic error:", err);
      }
   };

   if (isLoading) {
      return (
         <div className="todo-list-container">
            <h3>Tus Tareas en Notion</h3>
            <div className="loading">Cargando tareas...</div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="todo-list-container">
            <h3>Tus Tareas en Notion</h3>
            <div className="error-message">{error}</div>
            <button onClick={fetchTodos} className="retry-button">
               Reintentar
            </button>
         </div>
      );
   }

   return (
      <div className="todo-list-container">
         <div className="header">
            <h3>Tus Tareas en Notion</h3>
            <div className="header-buttons">
               <button onClick={handleDiagnostic} className="diagnostic-button">
                  🔍 Diagnosticar DB
               </button>
               <button onClick={fetchTodos} className="refresh-button">
                  🔄 Actualizar
               </button>
            </div>
         </div>

         {todos.length === 0 ? (
            <div className="empty-state">
               <p>No hay tareas en tu base de datos de Notion.</p>
               <p>¡Agrega tu primera tarea usando el formulario arriba!</p>
            </div>
         ) : (
            <div className="todos-grid">
               {todos.map((todo) => (
                  <div
                     key={todo.id}
                     className={`todo-card ${
                        todo.completed ? "completed" : ""
                     }`}
                  >
                     <h4 className="todo-title">{todo.title}</h4>

                     {todo.tags.length > 0 && (
                        <div className="todo-tags">
                           {todo.tags.map((tag) => (
                              <span key={tag} className="tag">
                                 {tag}
                              </span>
                           ))}
                        </div>
                     )}

                     <div className="todo-meta">
                        <span className="due-date">
                           📅 {formatDate(todo.dueDate)}
                        </span>
                        {todo.completed && (
                           <span className="completed-badge">
                              ✅ Completada
                           </span>
                        )}
                     </div>

                     <div className="todo-actions">
                        <button
                           onClick={() =>
                              handleCompleteToggle(todo.id, todo.completed)
                           }
                           disabled={updatingTodos.has(todo.id)}
                           className={`action-button ${
                              todo.completed
                                 ? "uncomplete-button"
                                 : "complete-button"
                           }`}
                        >
                           {updatingTodos.has(todo.id)
                              ? "⏳"
                              : todo.completed
                              ? "↩️ Desmarcar"
                              : "✅ Completar"}
                        </button>

                        <button
                           onClick={() => handleDelete(todo.id)}
                           disabled={updatingTodos.has(todo.id)}
                           className="action-button delete-button"
                        >
                           {updatingTodos.has(todo.id) ? "⏳" : "🗑️ Eliminar"}
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default TodoList;

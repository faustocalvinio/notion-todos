import { useState } from "react";
import notionService from "../services/notionService";
import "./TodoForm.css";

const TodoForm = ({ onTodoAdded }) => {
   const defaultTags = [
      "CurateHub",
      "Aprendizaje",
      "Programación",
      "Casa",
      "Trabajo",
   ];

   const [availableTags, setAvailableTags] = useState(defaultTags);
   const [newTag, setNewTag] = useState("");
   const [formData, setFormData] = useState({
      title: "",
      tags: [],
      dueDate: "",
   });
   const [isLoading, setIsLoading] = useState(false);
   const [message, setMessage] = useState("");

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleTagChange = (tag) => {
      setFormData((prev) => ({
         ...prev,
         tags: prev.tags.includes(tag)
            ? prev.tags.filter((t) => t !== tag)
            : [...prev.tags, tag],
      }));
   };

   const handleAddCustomTag = () => {
      const trimmedTag = newTag.trim();

      if (!trimmedTag) {
         setMessage("⚠️ Por favor escribe una etiqueta válida");
         return;
      }

      if (availableTags.includes(trimmedTag)) {
         setMessage("⚠️ Esta etiqueta ya existe");
         return;
      }

      setAvailableTags((prev) => [...prev, trimmedTag]);
      setNewTag("");
      setMessage("✅ Etiqueta agregada exitosamente");

      // Limpiar mensaje después de 2 segundos
      setTimeout(() => setMessage(""), 2000);
   };

   const handleRemoveCustomTag = (tagToRemove) => {
      // Solo permitir eliminar etiquetas que no estén en la lista por defecto
      if (!defaultTags.includes(tagToRemove)) {
         setAvailableTags((prev) => prev.filter((tag) => tag !== tagToRemove));
         setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
         }));
      }
   };

   const handleKeyPress = (e) => {
      if (e.key === "Enter") {
         e.preventDefault();
         handleAddCustomTag();
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.title.trim()) {
         setMessage("El título es obligatorio");
         return;
      }

      setIsLoading(true);
      setMessage("");

      try {
         const tags = formData.tags || [];

         const dueDate = formData.dueDate || null;

         const result = await notionService.addTodo(
            formData.title.trim(),
            tags,
            dueDate
         );

         if (result.success) {
            setMessage("✅ Tarea agregada exitosamente a Notion!");
            setFormData({ title: "", tags: [], dueDate: "" });

            if (onTodoAdded) {
               onTodoAdded(result.data);
            }
         } else {
            setMessage(`❌ Error: ${result.error}`);
         }
      } catch (error) {
         setMessage(`❌ Error inesperado: ${error.message}`);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="todo-form-container">
         <h2>Agregar Nueva Tarea a Notion</h2>

         <form onSubmit={handleSubmit} className="todo-form">
            <div className="form-group">
               <label htmlFor="title">Título de la tarea *</label>
               <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej: Completar proyecto React"
                  required
                  disabled={isLoading}
               />
            </div>

            <div className="form-group">
               <label>Etiquetas</label>

               {/* Campo para agregar nuevas etiquetas */}
               <div className="add-tag-container">
                  <input
                     type="text"
                     value={newTag}
                     onChange={(e) => setNewTag(e.target.value)}
                     onKeyPress={handleKeyPress}
                     placeholder="Escribe una nueva etiqueta..."
                     className="new-tag-input"
                     disabled={isLoading}
                  />
                  <button
                     type="button"
                     onClick={handleAddCustomTag}
                     className="add-tag-button"
                     disabled={isLoading || !newTag.trim()}
                  >
                     ➕ Agregar
                  </button>
               </div>

               {/* Lista de etiquetas disponibles */}
               <div className="tags-container">
                  {availableTags.map((tag) => (
                     <div key={tag} className="tag-option">
                        <input
                           type="checkbox"
                           id={`tag-${tag}`}
                           checked={formData.tags.includes(tag)}
                           onChange={() => handleTagChange(tag)}
                           disabled={isLoading}
                        />
                        <label htmlFor={`tag-${tag}`} className="tag-label">
                           {tag}
                        </label>
                        {/* Botón para eliminar etiquetas personalizadas */}
                        {!defaultTags.includes(tag) && (
                           <button
                              type="button"
                              onClick={() => handleRemoveCustomTag(tag)}
                              className="remove-tag-button"
                              title="Eliminar etiqueta personalizada"
                              disabled={isLoading}
                           >
                              ❌
                           </button>
                        )}
                     </div>
                  ))}
               </div>
               {formData.tags.length > 0 && (
                  <div className="selected-tags">
                     Seleccionadas: {formData.tags.join(", ")}
                  </div>
               )}
            </div>

            <div className="form-group">
               <label htmlFor="dueDate">Fecha de vencimiento</label>
               <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  disabled={isLoading}
               />
            </div>

            <button
               type="submit"
               className="submit-button"
               disabled={isLoading}
            >
               {isLoading ? "Agregando..." : "Agregar a Notion"}
            </button>
         </form>

         {message && (
            <div
               className={`message ${
                  message.includes("Error") ? "error" : "success"
               }`}
            >
               {message}
            </div>
         )}
      </div>
   );
};

export default TodoForm;

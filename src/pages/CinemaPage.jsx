import { useState, useEffect } from "react";
import CinemaForm from "../components/CinemaForm";
import cinemaService from "../services/cinemaService";
import "./CinemaPage.css";

export const CinemaPage = () => {
   const [content, setContent] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");
   const [deletingItems, setDeletingItems] = useState(new Set());
   const [editingItem, setEditingItem] = useState(null);
   const [editFormData, setEditFormData] = useState({});
   const [updatingItems, setUpdatingItems] = useState(new Set());

   const handleContentAdded = (newContent) => {
      loadContent();
   };

   const loadContent = async () => {
      setIsLoading(true);
      setError("");
      try {
         const result = await cinemaService.getCinemaContent();
         if (result.success) {
            setContent(result.data);
         } else {
            setError(`Error: ${result.error}`);
         }
      } catch (error) {
         console.error("Error loading cinema content:", error);
         setError(`Error inesperado: ${error.message}`);
      } finally {
         setIsLoading(false);
      }
   };

   const handleDeleteItem = async (itemId, itemName) => {
      if (!confirm(`¿Estás seguro de que quieres eliminar "${itemName}"?`)) {
         return;
      }

      setDeletingItems((prev) => new Set(prev).add(itemId));

      try {
         const result = await cinemaService.deleteCinemaContent(itemId);

         if (result.success) {
            setContent((prev) => prev.filter((item) => item.id !== itemId));
         } else {
            setError(`Error al eliminar: ${result.error}`);
         }
      } catch (error) {
         console.error("Error deleting item:", error);
         setError(`Error inesperado al eliminar: ${error.message}`);
      } finally {
         setDeletingItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
         });
      }
   };

   const handleEditItem = (item) => {
      setEditingItem(item.id);
      setEditFormData({
         nombre: item.nombre || "",
         plataforma: item.plataforma || "",
         minuto: item.minuto || "",
         iconEmoji: item.icon || "",
      });
   };

   const handleCancelEdit = () => {
      setEditingItem(null);
      setEditFormData({});
   };

   const handleEditInputChange = (e) => {
      const { name, value } = e.target;
      setEditFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleSaveEdit = async (itemId) => {
      if (!editFormData.nombre.trim()) {
         setError("El nombre es obligatorio");
         return;
      }

      setUpdatingItems((prev) => new Set(prev).add(itemId));

      try {
         const updates = {
            nombre: editFormData.nombre.trim(),
            plataforma: editFormData.plataforma.trim() || null,
            minuto: editFormData.minuto.trim() || null,
            iconEmoji: editFormData.iconEmoji.trim() || null,
         };

         const result = await cinemaService.updateCinemaContent(
            itemId,
            updates
         );

         if (result.success) {
            // Actualizar el item en la lista local
            setContent((prev) =>
               prev.map((item) =>
                  item.id === itemId
                     ? {
                          ...item,
                          nombre: updates.nombre,
                          plataforma: updates.plataforma,
                          minuto: updates.minuto
                             ? parseInt(updates.minuto)
                             : null,
                          icon: updates.iconEmoji,
                       }
                     : item
               )
            );

            setEditingItem(null);
            setEditFormData({});
            setError("");
         } else {
            setError(`Error al actualizar: ${result.error}`);
         }
      } catch (error) {
         console.error("Error updating item:", error);
         setError(`Error inesperado al actualizar: ${error.message}`);
      } finally {
         setUpdatingItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
         });
      }
   };

   useEffect(() => {
      loadContent();
   }, []);

   return (
      <div className="cinema-page">
         <h1>🎬 Cinema</h1>
         <p
            style={{
               textAlign: "center",
               color: "var(--text-secondary)",
               marginBottom: "2rem",
            }}
         >
            Agrega películas, series y contenido audiovisual
         </p>

         <CinemaForm onContentAdded={handleContentAdded} />

         <div className="content-section">
            <div className="section-header">
               <h2>Contenido agregado</h2>
               <button
                  className="refresh-button"
                  onClick={loadContent}
                  disabled={isLoading}
               >
                  {isLoading ? "Cargando..." : "🔄 Refrescar lista"}
               </button>
            </div>

            {error && (
               <div className="error-message">
                  {error}
                  <button onClick={() => setError("")} className="retry-button">
                     Cerrar
                  </button>
               </div>
            )}

            {isLoading && content.length === 0 ? (
               <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Cargando contenido...</p>
               </div>
            ) : content.length > 0 ? (
               <div className="content-grid">
                  {content.map((item) => (
                     <div
                        key={item.id}
                        className={`content-card ${
                           deletingItems.has(item.id) ? "deleting" : ""
                        } ${editingItem === item.id ? "editing" : ""}`}
                     >
                        {editingItem === item.id ? (
                           // Modo edición
                           <div className="edit-form">
                              <div className="edit-header">
                                 <input
                                    type="text"
                                    name="iconEmoji"
                                    value={editFormData.iconEmoji}
                                    onChange={handleEditInputChange}
                                    placeholder="🎬"
                                    maxLength={2}
                                    className="edit-emoji-input"
                                 />
                                 <input
                                    type="text"
                                    name="nombre"
                                    value={editFormData.nombre}
                                    onChange={handleEditInputChange}
                                    placeholder="Nombre"
                                    className="edit-title-input"
                                    required
                                 />
                              </div>
                              <div className="edit-details">
                                 <input
                                    type="text"
                                    name="plataforma"
                                    value={editFormData.plataforma}
                                    onChange={handleEditInputChange}
                                    placeholder="Plataforma"
                                    className="edit-platform-input"
                                 />
                                 <input
                                    type="text"
                                    name="minuto"
                                    value={editFormData.minuto}
                                    onChange={handleEditInputChange}
                                    placeholder="Minutos"
                                    className="edit-duration-input"
                                 />
                              </div>
                              <div className="edit-actions">
                                 <button
                                    className="save-button"
                                    onClick={() => handleSaveEdit(item.id)}
                                    disabled={updatingItems.has(item.id)}
                                 >
                                    {updatingItems.has(item.id)
                                       ? "Guardando..."
                                       : "✓ Guardar"}
                                 </button>
                                 <button
                                    className="cancel-button"
                                    onClick={handleCancelEdit}
                                    disabled={updatingItems.has(item.id)}
                                 >
                                    ✕ Cancelar
                                 </button>
                              </div>
                           </div>
                        ) : (
                           // Modo vista
                           <>
                              <div className="content-header">
                                 {item.icon && (
                                    <span className="content-icon">
                                       {item.icon}
                                    </span>
                                 )}
                                 <h3 className="content-title">
                                    {item.nombre}
                                 </h3>
                                 <div className="action-buttons">
                                    <button
                                       className="edit-button"
                                       onClick={() => handleEditItem(item)}
                                       title="Editar item"
                                    >
                                       ✏️
                                    </button>
                                    <button
                                       className="delete-button"
                                       onClick={() =>
                                          handleDeleteItem(item.id, item.nombre)
                                       }
                                       disabled={deletingItems.has(item.id)}
                                       title="Eliminar item"
                                    >
                                       {deletingItems.has(item.id)
                                          ? "..."
                                          : "×"}
                                    </button>
                                 </div>
                              </div>
                              <div className="content-details">
                                 {item.plataforma && (
                                    <span className="content-platform">
                                       {item.plataforma}
                                    </span>
                                 )}
                                 {item.minuto && (
                                    <span className="content-duration">
                                       {item.minuto} min
                                    </span>
                                 )}
                              </div>
                           </>
                        )}
                     </div>
                  ))}
               </div>
            ) : (
               <div className="empty-state">
                  <h3>No hay contenido aún</h3>
                  <p>
                     Agrega tu primera película o serie usando el formulario de
                     arriba
                  </p>
               </div>
            )}
         </div>
      </div>
   );
};

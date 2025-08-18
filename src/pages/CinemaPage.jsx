import { useState } from "react";
import CinemaForm from "../components/CinemaForm";
import cinemaService from "../services/cinemaService";
import "./CinemaPage.css";

export const CinemaPage = () => {
   const [content, setContent] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   const handleContentAdded = (newContent) => {
      // Refrescar la lista o añadir el nuevo contenido
      loadContent();
   };

   const loadContent = async () => {
      setIsLoading(true);
      try {
         const result = await cinemaService.getCinemaContent();
         if (result.success) {
            setContent(result.data);
         }
      } catch (error) {
         console.error("Error loading cinema content:", error);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="cinema-page">
         <h1>🎬 Cinema</h1>
         <p
            style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}
         >
            Agrega películas, series y contenido audiovisual
         </p>

         <CinemaForm onContentAdded={handleContentAdded} />

         {content.length > 0 && (
            <div>
               <h2>Contenido agregado</h2>
               <button
                  className="refresh-button"
                  onClick={loadContent}
                  disabled={isLoading}
               >
                  {isLoading ? "Cargando..." : "🔄 Refrescar lista"}
               </button>
               <div className="content-grid">
                  {content.map((item) => (
                     <div key={item.id} className="content-card">
                        <div className="content-header">
                           {item.icon && (
                              <span className="content-icon">{item.icon}</span>
                           )}
                           <h3 className="content-title">{item.nombre}</h3>
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
                     </div>
                  ))}
               </div>
            </div>
         )}

         {content.length === 0 && !isLoading && (
            <div className="empty-state">
               <h3>No hay contenido aún</h3>
               <p>
                  Agrega tu primera película o serie usando el formulario de
                  arriba
               </p>
            </div>
         )}
      </div>
   );
};

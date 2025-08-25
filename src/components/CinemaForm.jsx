import { useState } from "react";
import cinemaService from "../services/cinemaService";
import "./CinemaForm.css";

const CinemaForm = ({ onContentAdded }) => {
   const [formData, setFormData] = useState({
      nombre: "",
      plataforma: "",
      minuto: "",
      iconEmoji: "",
      content: "",
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

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.nombre.trim()) {
         setMessage("El nombre es obligatorio");
         return;
      }

      setIsLoading(true);
      setMessage("");

      try {
         const result = await cinemaService.addCinemaContent(
            formData.nombre.trim(),
            formData.plataforma || null,
            formData.minuto || null,
            formData.iconEmoji.trim() || null,
            formData.content.trim() || null
         );

         if (result.success) {
            setMessage("✅ Contenido agregado exitosamente a Notion!");
            setFormData({
               nombre: "",
               plataforma: "",
               minuto: "",
               iconEmoji: "",
               content: "",
            });

            if (onContentAdded) {
               onContentAdded(result.data);
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
      <div className="cinema-form-container">
         <form onSubmit={handleSubmit} className="cinema-form">
            <div className="form-group">
               <label htmlFor="nombre">Nombre *</label>
               <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Inception, Breaking Bad..."
                  required
                  disabled={isLoading}
               />
            </div>

            <div className="form-group">
               <label htmlFor="plataforma">Plataforma</label>
               <input
                  type="text"
                  id="plataforma"
                  name="plataforma"
                  value={formData.plataforma}
                  onChange={handleInputChange}
                  placeholder="Ej: Netflix, Amazon Prime, Disney+..."
                  disabled={isLoading}
               />
               <small>Escribe el nombre de la plataforma (opcional)</small>
            </div>

            <div className="form-group">
               <label htmlFor="minuto">Minuto</label>
               <input
                  type="text"
                  id="minuto"
                  name="minuto"
                  value={formData.minuto}
                  onChange={handleInputChange}
                  placeholder="Ej: 120"
                  disabled={isLoading}
               />
               <small>Duración en minutos (opcional)</small>
            </div>

            <div className="form-group">
               <label htmlFor="iconEmoji">Emoji</label>
               <input
                  type="text"
                  id="iconEmoji"
                  name="iconEmoji"
                  maxLength={2}
                  value={formData.iconEmoji}
                  onChange={handleInputChange}
                  placeholder="Ej: 🎬"
                  disabled={isLoading}
               />
               <small>
                  Deja vacío si no quieres ícono. Pega un emoji (1 carácter).
               </small>
            </div>

            <div className="form-group">
               <label htmlFor="content">Notas adicionales</label>
               <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Notas, reseña, comentarios... Usa doble Enter para separar párrafos."
                  rows={5}
                  disabled={isLoading}
               />
            </div>

            <button
               type="submit"
               className="submit-button"
               disabled={isLoading}
            >
               {isLoading ? "Agregando..." : "Agregar a Cinema"}
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

export default CinemaForm;

import { authService } from "../services/authService";
import "./Header.css";

const Header = ({ user, onLogout }) => {
   const handleLogout = async () => {
      try {
         await authService.signOut();
         onLogout();
      } catch (error) {
         console.error("Error al cerrar sesión:", error);
      }
   };

   return (
      <header className="app-header">
         <div className="header-content">
            <h1 className="app-title">Notion Todos</h1>

            <div className="user-section">
               <div className="user-info">
                  <img
                     src={user.photoURL || "/default-avatar.png"}
                     alt="Avatar"
                     className="user-avatar"
                  />
                  <span className="user-name">{user.displayName}</span>
               </div>

               <button
                  className="logout-btn"
                  onClick={handleLogout}
                  title="Cerrar sesión"
               >
                  <svg viewBox="0 0 24 24" className="logout-icon">
                     <path
                        fill="currentColor"
                        d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
                     />
                  </svg>
               </button>
            </div>
         </div>
      </header>
   );
};

export default Header;

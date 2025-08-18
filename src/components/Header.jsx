import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import "./Header.css";

const Header = () => {
   

   return (
      <header className="app-header">
         
            
            <ul className="nav-links">
               <li>
                  <Link to="/">Inicio</Link>
               </li>
               <li>
                  <Link to="/cinema">Cine</Link>
               </li>
                
            </ul>
         
        
      </header>
   );
};

export default Header;

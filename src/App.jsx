import { useState, useEffect } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import Login from "./components/Login";
import Header from "./components/Header";
import { authService } from "./services/authService";
import "./App.css";

export function App() {
   const [refreshTrigger, setRefreshTrigger] = useState(0);
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const unsubscribe = authService.onAuthStateChanged((user) => {
         if (user && authService.isAuthorizedUser(user)) {
            setUser(user);
         } else {
            setUser(null);
         }
         setLoading(false);
      });

      return () => unsubscribe();
   }, []);

   const handleTodoAdded = () => {
      setRefreshTrigger((prev) => prev + 1);
   };

   const handleLoginSuccess = (user) => {
      setUser(user);
   };

   const handleLogout = () => {
      setUser(null);
   };

   if (loading) {
      return (
         <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Verificando autenticación...</p>
         </div>
      );
   }

   if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
   }

   return (
      <div className="app">
         <main className="app-main">
            <TodoForm onTodoAdded={handleTodoAdded} />
            <TodoList refreshTrigger={refreshTrigger} />
         </main>
      </div>
   );
}

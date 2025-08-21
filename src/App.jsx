import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import { CinemaPage, Homepage } from "./pages";
import Header from "./components/Header";
import { useDarkMode } from "./hooks/useDarkMode";
import { useEffect } from "react";

export const App = () => {
   const isDarkMode = useDarkMode();

   useEffect(() => {
      // Agregar clase al body para debugging si es necesario
      document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
   }, [isDarkMode]);

   return (
      <BrowserRouter>
         <Header />
         <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/cinema" element={<CinemaPage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
         </Routes>
      </BrowserRouter>
   );
};

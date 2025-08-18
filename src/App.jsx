import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import { CinemaPage, Homepage } from "./pages";
import Header from "./components/Header";

export const App = () => {
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

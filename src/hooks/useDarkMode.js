import { useEffect, useState } from 'react';

export const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(
        () => window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e) => {
            setIsDarkMode(e.matches);
        };

        // Escuchar cambios en la preferencia del sistema
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return isDarkMode;
};

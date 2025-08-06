import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AUTHORIZED_EMAIL = import.meta.env.VITE_AUTHORIZED_EMAIL || "master@yoda.star";

export const authService = {
    signInWithGoogle: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            if (user.email !== AUTHORIZED_EMAIL) {
                await signOut(auth);
                throw new Error('Usuario no autorizado. Solo el propietario puede acceder.');
            }

            return user;
        } catch (error) {
            console.error('Error en el login:', error);
            throw error;
        }
    },

    signOut: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    },

    isAuthorizedUser: (user) => {
        return user && user.email === AUTHORIZED_EMAIL;
    },

    getCurrentUser: () => {
        return auth.currentUser;
    },

    onAuthStateChanged: (callback) => {
        return onAuthStateChanged(auth, callback);
    }
};

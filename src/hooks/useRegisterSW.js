import { useState, useEffect, useCallback, useRef } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Hook pour gérer la mise à jour automatique du Service Worker PWA
 * Détecte quand une nouvelle version est disponible et permet de recharger l'app
 */
export function useRegisterSW() {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [offlineReady, setOfflineReady] = useState(false);
    const updateSWRef = useRef(null);

    useEffect(() => {
        const updateServiceWorker = registerSW({
            onNeedRefresh() {
                setNeedRefresh(true);
            },
            onOfflineReady() {
                setOfflineReady(true);
            },
            onRegisteredSW(swUrl, registration) {
                // Vérifier périodiquement les mises à jour (toutes les heures)
                if (registration) {
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000);
                }
            }
        });

        updateSWRef.current = updateServiceWorker;

        return () => {
            // Cleanup if needed
        };
    }, []);

    const updateApp = useCallback(() => {
        if (updateSWRef.current) {
            updateSWRef.current(true);
        }
    }, []);

    const closePrompt = useCallback(() => {
        setNeedRefresh(false);
        setOfflineReady(false);
    }, []);

    return {
        needRefresh,
        offlineReady,
        updateApp,
        closePrompt
    };
}

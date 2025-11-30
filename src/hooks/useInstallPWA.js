import { useState, useEffect } from 'react';

/**
 * Hook pour gérer l'installation PWA
 * Capture l'événement beforeinstallprompt et fournit une fonction pour installer
 */
export function useInstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Vérifier si l'app est déjà installée (mode standalone)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Capturer l'événement beforeinstallprompt
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        // Détecter quand l'app est installée
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    // Fonction pour déclencher l'installation
    const installApp = async () => {
        if (!deferredPrompt) return false;

        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                setIsInstalled(true);
                setIsInstallable(false);
            }
            
            setDeferredPrompt(null);
            return outcome === 'accepted';
        } catch (error) {
            console.error('Erreur installation PWA:', error);
            return false;
        }
    };

    return { isInstallable, isInstalled, installApp };
}

import { useRegisterSW } from '../hooks/useRegisterSW';
import './UpdatePrompt.css';

/**
 * Composant affichant une notification quand une mise à jour est disponible
 * Permet à l'utilisateur de recharger l'app pour appliquer la mise à jour
 */
function UpdatePrompt() {
    const { needRefresh, offlineReady, updateApp, closePrompt } = useRegisterSW();

    if (!needRefresh && !offlineReady) {
        return null;
    }

    return (
        <div className="update-prompt">
            <div className="update-prompt-content">
                {offlineReady ? (
                    <>
                        <span className="update-prompt-message">
                            ✅ L&apos;application est prête à fonctionner hors-ligne
                        </span>
                        <button
                            className="update-prompt-close"
                            onClick={closePrompt}
                        >
                            OK
                        </button>
                    </>
                ) : (
                    <>
                        <span className="update-prompt-message">
                            🔄 Une nouvelle version est disponible
                        </span>
                        <button
                            className="update-prompt-button"
                            onClick={updateApp}
                        >
                            Mettre à jour
                        </button>
                        <button
                            className="update-prompt-close"
                            onClick={closePrompt}
                        >
                            Plus tard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default UpdatePrompt;

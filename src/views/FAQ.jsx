import '../styles/faq.css';

/**
 * Page FAQ - Questions fréquentes
 */
export default function FAQ() {
    const faqs = [
        {
            question: "À quoi sert cette application ?",
            answer: "Le Carnet de Dressage permet de suivre l'entraînement de votre chien de recherche. Vous pouvez créer des fiches pour chaque séance (recherche de substances, obéissance, exercices divers) et les consulter à tout moment."
        },
        {
            question: "Mes données sont-elles sécurisées ?",
            answer: "Oui ! Toutes vos données sont stockées uniquement sur votre appareil. Rien n'est envoyé sur internet. Pensez à faire des sauvegardes régulières via les Paramètres > Données."
        },
        {
            question: "Comment sauvegarder mes fiches ?",
            answer: "Allez dans Paramètres > Données > Exporter. Un fichier sera téléchargé sur votre appareil. Conservez-le précieusement pour pouvoir restaurer vos données si besoin."
        },
        {
            question: "Comment restaurer une sauvegarde ?",
            answer: "Allez dans Paramètres > Données > Importer, puis sélectionnez votre fichier de sauvegarde. Attention : cela remplacera toutes vos données actuelles."
        },
        {
            question: "Comment ajouter une substance ou un poseur ?",
            answer: "Allez dans Paramètres, puis cliquez sur Substances ou Poseurs. Utilisez le bouton + Ajouter pour créer un nouvel élément, puis enregistrez."
        },
        {
            question: "À quoi sert l'Ordre de passage ?",
            answer: "Cet outil permet de tirer au sort l'ordre de passage des participants lors d'un entraînement collectif. Il garde aussi des statistiques pour montrer que le tirage est équitable !"
        },
        {
            question: "Puis-je utiliser l'application sans internet ?",
            answer: "Oui ! Une fois l'application installée, elle fonctionne entièrement hors-ligne. Vos données sont stockées sur votre appareil."
        },
        {
            question: "Comment installer l'application sur mon téléphone ?",
            answer: "Sur iPhone (Safari) : appuyez sur le bouton Partager puis \"Sur l'écran d'accueil\". Sur Android (Chrome) : appuyez sur les 3 points puis \"Installer l'application\"."
        },
        {
            question: "Comment imprimer une fiche ?",
            answer: "Ouvrez la fiche que vous souhaitez imprimer, puis utilisez la fonction d'impression de votre navigateur (Ctrl+P ou Cmd+P). La mise en page est optimisée pour l'impression."
        },
        {
            question: "J'ai perdu mes données, que faire ?",
            answer: "Si vous avez une sauvegarde, vous pouvez la restaurer via Paramètres > Données > Importer. Sans sauvegarde, malheureusement les données ne peuvent pas être récupérées."
        }
    ];

    return (
        <div className="faq-page">
            <div className="container">
                <div className="header">
                    <span className="icon">💡</span>
                    <h1>Aide & FAQ</h1>
                </div>

                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <details key={index} className="faq-item">
                            <summary className="faq-question">
                                <span className="q-icon">?</span>
                                <span className="q-text">{faq.question}</span>
                                <span className="q-arrow">▼</span>
                            </summary>
                            <div className="faq-answer">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>

                <div className="faq-footer">
                    <p>
                        Une autre question ?
                        {" "}
                        <a
                            href="https://github.com/btlspace/carnet-dressage/issues/new/choose"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Ouvrez une issue
                        </a>
                        {" "}
                        ou
                        {" "}
                        <a
                            href="https://github.com/btlspace/carnet-dressage/discussions/new/choose"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            démarrez une discussion
                        </a>
                        {" "}
                        sur GitHub.
                    </p>
                </div>
            </div>
        </div>
    );
}

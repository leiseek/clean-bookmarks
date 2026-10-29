# Nettoyeur de favoris

Vérifiez les liens de vos favoris dans Chrome et Microsoft Edge. Les favoris sélectionnés et confirmés ne sont supprimés qu’après le téléchargement complet d’une sauvegarde HTML.

[简体中文](README.md) · [English](README-en.md) · [日本語](README-ja.md) · [한국어](README-ko.md) · **Français** · [Español](README-es.md)

## Installation

Installez l’extension depuis [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna), ou chargez le code source. La version du magasin peut différer de la branche principale.

Le chargement local nécessite Chrome 102+ ou une version récente d’Edge compatible avec les mêmes API Manifest V3. Téléchargez le dépôt, ouvrez `chrome://extensions/` ou `edge://extensions/`, activez le mode développeur, puis chargez l’extension non empaquetée en sélectionnant le dossier contenant `manifest.json`. Aucune compilation n’est nécessaire.

## Utilisation et résultats

1. Lancez l’analyse depuis l’icône de l’extension. Vous pouvez fermer puis rouvrir la fenêtre pendant l’analyse.
2. Consultez les résultats par dossier. Cliquez sur une ligne pour vérifier le lien d’origine.
3. Sélectionnez les candidats invalides et confirmez le nettoyage. Tous les favoris sont sauvegardés avant la suppression.

| État | Règle | Suppression possible |
| --- | --- | --- |
| Valide | Réponse HTTP(S) 2xx | Non |
| Invalide | Réponse HTTP(S) 404/410 | Après sélection et confirmation |
| Indéterminé | Erreur réseau, délai dépassé, 401/403, 429, 5xx, etc. | Non |
| Ignoré | Protocoles `chrome:`, `edge:`, `file:`, `javascript:`, etc. | Non |

Une connexion requise, une restriction géographique ou une panne temporaire peuvent affecter les résultats. Vérifiez les liens avant leur suppression. Les anciens résultats nécessitent une nouvelle analyse. Une analyse interrompue peut être relancée depuis le début.

## Sauvegarde et restauration

Les sauvegardes HTML importables sont enregistrées dans le **dossier de téléchargement configuré dans le navigateur**. Un téléchargement annulé ou échoué bloque la suppression. La page des résultats permet aussi une sauvegarde seule.

Pour restaurer les favoris, utilisez l’importation HTML du gestionnaire de favoris du navigateur. L’importation ajoute généralement des éléments et peut créer des doublons. Une erreur pendant la suppression peut laisser un nettoyage partiellement effectué, sans annulation automatique : consultez la sauvegarde et relancez une analyse.

## Confidentialité et contribution

Aucun compte, télémétrie ou serveur exploité par le développeur. Les résultats et tâches restent dans le stockage local de l’extension. L’analyse contacte directement les sites des favoris, sans cookies de connexion. Protégez vos sauvegardes et retirez les URL privées et jetons des rapports de problème.

Avec Node.js 22+, exécutez `npm test` et `npm run check`, sans dépendances externes. Vérifiez la suppression et la restauration dans un profil de navigateur séparé. Les [rapports de problème](https://github.com/leiseek/clean-bookmarks/issues), traductions et contributions sont les bienvenus.

Consultez le [README anglais](README-en.md) pour plus de détails. Licence : [MulanPSL-2.0](LICENSE).

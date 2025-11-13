# Nettoyeur de favoris - Extension Chrome
Microsoft Edge Add-ons Store : [https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna](https://microsoftedge.microsoft.com/addons/detail/bfplmmnmgnfelmjdabmgjpfafnocnhna)

## Language Selection / Sélection de la langue
- [中文(简体)](README.md)
- [English](README-en.md)
- [日本語](README-ja.md)
- [한국어](README-ko.md)
- [Français](#nettoyeur-de-favoris---extension-chrome)
- [Español](README-es.md)

Une extension Chrome pratique pour vérifier et nettoyer les URL inaccessibles dans les favoris.

## Fonctionnalités

- 🔍 **Scan des favoris**: Détecte automatiquement si toutes les URL des favoris sont accessibles
- 📊 **Affichage des résultats**: Affiche clairement les résultats du scan, les liens invalides sont marqués avec un style visible
- ☑️ **Sélection intelligente**: Sélectionne automatiquement les liens invalides, prend en charge la sélection multiple et simple
- 💾 **Sauvegarde des données**: Sauvegarde automatiquement les données actuelles des favoris sur le bureau avant le nettoyage
- 🗑️ **Nettoyage sûr**: Nécessite une confirmation secondaire de l'utilisateur avant le nettoyage pour éviter les erreurs
- 🌐 **Support multilingue**: Support du chinois, de l'anglais, du japonais, du coréen, du français et de l'espagnol

## Méthode d'installation

1. Téléchargez ou clonez ce projet sur votre ordinateur
2. Ouvrez le navigateur Chrome, accédez à la page de gestion des extensions (`chrome://extensions/`)
3. Activez le "Mode développeur" en haut à droite
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier de ce projet
6. Installation terminée, vous pouvez voir l'icône de l'extension dans la barre d'outils du navigateur

## Mode d'emploi

1. **Scanner les favoris**
   - Cliquez sur l'icône de l'extension, cliquez sur le bouton "Scanner les favoris" dans la fenêtre contextuelle
   - Attendez la fin du scan, il affichera la progression du scan et le nombre de problèmes détectés

2. **Voir les résultats du scan**
   - Une fois le scan terminé, cliquez sur le bouton "Voir les résultats du scan"
   - Vous pouvez voir l'état de tous les favoris dans la page de résultats
   - Les liens invalides seront mis en évidence avec une bordure et un arrière-plan rouges

3. **Nettoyer les liens invalides**
   - Dans la page de résultats, les liens invalides seront automatiquement sélectionnés
   - Vous pouvez décocher les liens que vous ne souhaitez pas nettoyer
   - Cliquez sur le bouton "Nettoyer les liens sélectionnés"
   - Confirmez l'opération dans la boîte de dialogue de confirmation
   - Le système sauvegardera d'abord les favoris actuels sur le bureau, puis nettoiera les liens invalides sélectionnés

## Description des fichiers

- `manifest.json`: Fichier de configuration de l'extension, définissant les informations de base et les autorisations de l'extension
- `background.js`: Script en arrière-plan, traitant la logique de scan et de nettoyage des données
- `popup.html/popup.js`: Interface de la fenêtre contextuelle de l'extension et logique d'interaction
- `results.html/results.js`: Page d'affichage des résultats du scan et logique d'interaction
- `icons/`: Dossier des icônes de l'extension (il faut ajouter des fichiers d'icônes réels)

## Remarques

1. Le premier scan peut prendre un certain temps, en fonction du nombre d'URL dans les favoris
2. Veuillez ne pas fermer la fenêtre contextuelle de l'extension pendant le scan
3. L'opération de nettoyage créera automatiquement un fichier de sauvegarde, enregistré sur le bureau
4. Certains sites Web peuvent ne pas être détectés avec précision en raison de restrictions de politique de sécurité
5. Il est recommandé de scanner et de nettoyer régulièrement les favoris pour maintenir la validité des marque-pages

## Méthode de récupération des favoris

### Méthode de récupération des favoris

L'extension sauvegarde maintenant les favoris au format HTML, qui peut être directement importé par les navigateurs Chrome et Edge.

#### Récupération des favoris sur le navigateur Chrome
1. Ouvrez le navigateur Chrome, cliquez sur le menu à trois points en haut à droite → Favoris → Gestionnaire de favoris
2. Sur la page du gestionnaire de favoris, cliquez sur le menu à trois points en haut à droite → Importer des favoris et des paramètres
3. Dans la fenêtre d'importation qui s'ouvre, sélectionnez l'option "Importer à partir d'un fichier HTML"
4. Cliquez sur le bouton "Choisir un fichier", recherchez et sélectionnez le fichier HTML sauvegardé précédemment
5. Cliquez sur le bouton "Importer" pour terminer la récupération

#### Récupération des favoris sur le navigateur Edge
1. Ouvrez les favoris dans Edge : appuyez sur `Ctrl+Shift+O` ou cliquez sur le menu à trois points en haut à droite → Favoris → Gérer les favoris
2. Cliquez sur le bouton "Importer des favoris" en haut à droite de l'interface des favoris
3. Dans la fenêtre d'importation qui s'ouvre, sélectionnez l'option "Importer à partir d'un fichier"
4. Cliquez sur le bouton "Choisir un fichier", recherchez et sélectionnez le fichier HTML sauvegardé précédemment
5. Cliquez sur le bouton "Importer" pour terminer la récupération

### Emplacement du fichier de sauvegarde
- Par défaut, les fichiers de sauvegarde seront téléchargés dans votre dossier "Téléchargements"
- Format du nom de fichier : `bookmarks_backup_date.html` (exemple : `bookmarks_backup_2023-06-15.html`)
- Il est recommandé de sauvegarder en plus les fichiers de sauvegarde importants dans un endroit sûr pour éviter une perte accidentelle

## Implémentation technique

- Utilisation de l'API Chrome Bookmarks pour récupérer les données des favoris
- Utilisation de l'API Fetch pour détecter l'accessibilité des URL
- Utilisation de l'API Chrome Downloads pour implémenter le téléchargement de fichiers de sauvegarde
- Utilisation de l'API Chrome Storage pour stocker les résultats du scan
- Conception d'interface utilisateur responsive, prenant en charge différentes tailles d'écran

## Environnement de développement

- Navigateur Chrome (Manifest V3)
- Aucune dépendance supplémentaire ou outil de build requis

## Support multilingue

Cette extension prend en charge les langues suivantes :

- Chinois (simplifié)
- Anglais
- Japonais
- Coréen
- Français
- Espagnol

L'extension passera automatiquement à la langue d'affichage selon les paramètres linguistiques de votre navigateur.

## Historique des versions
- v1.0: Version initiale, comprenant le scan de favoris, la détection de liens invalides, la sauvegarde et le nettoyage au format HTML, prenant en charge l'importation et la récupération directe dans les navigateurs Chrome et Edge, prenant en charge l'internationalisation multilingue (chinois, anglais, japonais, coréen, français et espagnol)
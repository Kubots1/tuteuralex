# 🤖 Prompt pour générer une leçon

Copie ce prompt dans n'importe quelle IA (ChatGPT, Claude, Gemini…)
en remplissant les champs entre [ ].

---

## PROMPT À COPIER

```
Tu vas générer une leçon de français au format JavaScript pour un site éducatif.

Génère une leçon sur le thème : [SUJET, ex: "Les couleurs"]
Niveau : [NIVEAU : A0 / A1 / A2 / B1 / B2]
Thème de catégorie : [THÈME : Vocabulaire / Grammaire / Communication / Conjugaison / Culture]
Durée estimée : [DURÉE, ex: "10 min"]

Le fichier doit OBLIGATOIREMENT respecter exactement cette structure JavaScript :

registerLecon({
  titre       : "Titre de la leçon",
  icon        : "🎨",  // un emoji approprié
  niveau      : "A0",  // A0 / A1 / A2 / B1 / B2
  theme       : "Vocabulaire",
  description : "Une phrase décrivant la leçon (max 120 caractères).",
  duree       : "10 min",

  intro: "Texte d'introduction expliquant l'objectif de la leçon.",

  sections: [
    // SECTION AVEC TEXTE SIMPLE
    {
      titre: "Titre de la section",
      texte: "Explication théorique.",
    },

    // SECTION AVEC TABLEAU (optionnel)
    {
      titre: "Titre",
      tableau: {
        entetes: ["Colonne 1", "Colonne 2", "Colonne 3"],
        lignes: [
          ["valeur1", "valeur2", "valeur3"],
          ["valeur4", "valeur5", "valeur6"],
        ]
      }
    },

    // SECTION AVEC EXEMPLES (optionnel)
    {
      titre: "Titre",
      exemples: [
        { fr: "Phrase en français", trad: "Translation", note: "Note optionnelle" },
        { fr: "Autre exemple",      trad: "Other example" },
      ]
    },

    // SECTION AVEC ASTUCE (optionnel, peut se combiner)
    {
      titre: "Titre",
      texte: "Explication.",
      astuce: "Conseil ou règle importante à retenir."
    },
  ],

  // EXERCICE QCM — 10 questions minimum
  // ⚠️ La PREMIÈRE réponse dans "choix" est TOUJOURS la bonne réponse.
  // Elles seront mélangées automatiquement à l'affichage.
  exercices: [
    {
      question: "La question ?",
      choix: ["Bonne réponse", "Mauvaise réponse 1", "Mauvaise réponse 2", "Mauvaise réponse 3"]
    },
    // ... 9 autres questions
  ],

  // FLASHCARDS — 8 à 12 cartes
  flashcards: [
    {
      recto     : "Mot ou concept (face visible)",
      sous_recto: "Indication (ex: 'Masculin', 'Verbe'...)",
      verso     : "Traduction ou définition",
      detail    : "Explication ou règle supplémentaire",
      exemple   : "Phrase d'exemple en contexte"
    },
    // ... autres cartes
  ]
});
```

RÈGLES IMPORTANTES :
1. Ne modifie PAS la structure du fichier — respecte exactement les noms des champs.
2. Dans exercices[], la PREMIÈRE réponse dans choix[] est TOUJOURS la bonne.
3. Toutes les valeurs doivent être entre guillemets dans les strings.
4. Le fichier doit être du JavaScript pur, sans balises HTML.
5. Génère un contenu riche : minimum 4 sections, 10 exercices, 8 flashcards.
6. Adapte le niveau de langue et la complexité au niveau indiqué.
```

---

## COMMENT AJOUTER LA LEÇON AU SITE

1. **Sauvegarde** le code généré dans un fichier nommé : `XX-nom-lecon.js`
   (ex : `04-couleurs.js`, `05-verbe-etre.js`)

2. **Dépose** le fichier dans le dossier : `lecons-app/lecons/`

3. **Ajoute une ligne** dans `lecons-app/lecons-manifest.json` :
   ```json
   { "fichier": "04-couleurs.js" }
   ```

4. **Recharge** le site — la leçon apparaît automatiquement dans la grille !

---

## EXEMPLES DE SUJETS

| Sujet | Niveau | Thème |
|-------|--------|-------|
| Les couleurs | A0 | Vocabulaire |
| Le verbe être | A0 | Grammaire |
| La famille | A0 | Vocabulaire |
| Le présent (-er) | A1 | Conjugaison |
| Les adjectifs | A1 | Grammaire |
| La nourriture | A1 | Vocabulaire |
| L'imparfait | A2 | Conjugaison |
| Les prépositions | A2 | Grammaire |
| Le subjonctif | B1 | Conjugaison |
| Les expressions idiomatiques | B2 | Culture |

registerLecon({
  titre       : "Le présent de l'indicatif",
  icon        : "🗣️",
  niveau      : "A1",
  theme       : "Conjugaison",
  description : "Apprendre à conjuguer et utiliser le présent de l'indicatif dans les situations du quotidien.",
  duree       : "20 min",

  intro: "Le présent de l'indicatif est le temps le plus utilisé en français. Il permet de parler de ce qui se passe maintenant, de ses habitudes, de faits généraux et de situations permanentes. Dans cette leçon, tu découvriras les trois groupes de verbes au présent ainsi que les erreurs les plus fréquentes.",

  sections: [

    {
      titre: "Quand utilise-t-on le présent ?",
      texte: "Le présent de l'indicatif sert à exprimer une action qui se déroule maintenant, une habitude, une vérité générale ou une situation permanente."
    },

    {
      titre: "Les principaux usages du présent",
      tableau: {
        entetes: ["Usage", "Exemple", "Explication"],
        lignes: [
          ["Action actuelle", "Je mange.", "L'action se déroule maintenant."],
          ["Habitude", "Je fais du sport tous les jours.", "Action répétée régulièrement."],
          ["Vérité générale", "L'eau bout à 100°C.", "Fait scientifique ou universel."],
          ["Description", "Paul habite à Lyon.", "Situation durable."],
          ["Futur proche", "Je pars demain.", "Le présent peut parfois exprimer le futur."]
        ]
      }
    },

    {
      titre: "Les verbes du 1er groupe (-ER)",
      texte: "Les verbes du premier groupe représentent la majorité des verbes français. Leur infinitif se termine par -ER.",
      tableau: {
        entetes: ["Sujet", "Parler"],
        lignes: [
          ["Je", "parle"],
          ["Tu", "parles"],
          ["Il / Elle", "parle"],
          ["Nous", "parlons"],
          ["Vous", "parlez"],
          ["Ils / Elles", "parlent"]
        ]
      }
    },

    {
      titre: "Les verbes du 2e groupe (-IR)",
      texte: "Les verbes du deuxième groupe se terminent généralement par -IR et prennent -issons avec nous.",
      tableau: {
        entetes: ["Sujet", "Finir"],
        lignes: [
          ["Je", "finis"],
          ["Tu", "finis"],
          ["Il / Elle", "finit"],
          ["Nous", "finissons"],
          ["Vous", "finissez"],
          ["Ils / Elles", "finissent"]
        ]
      }
    },

    {
      titre: "Les verbes du 3e groupe",
      texte: "Les verbes du troisième groupe possèdent plusieurs modèles de conjugaison. Ils ne suivent pas tous la même règle.",
      tableau: {
        entetes: ["Sujet", "Prendre"],
        lignes: [
          ["Je", "prends"],
          ["Tu", "prends"],
          ["Il / Elle", "prend"],
          ["Nous", "prenons"],
          ["Vous", "prenez"],
          ["Ils / Elles", "prennent"]
        ]
      }
    },

    {
      titre: "Comparer les trois groupes",
      tableau: {
        entetes: ["Sujet", "Parler", "Finir", "Prendre"],
        lignes: [
          ["Je", "parle", "finis", "prends"],
          ["Tu", "parles", "finis", "prends"],
          ["Il / Elle", "parle", "finit", "prend"],
          ["Nous", "parlons", "finissons", "prenons"],
          ["Vous", "parlez", "finissez", "prenez"],
          ["Ils / Elles", "parlent", "finissent", "prennent"]
        ]
      }
    },

    {
      titre: "Comment reconnaître le groupe d'un verbe ?",
      tableau: {
        entetes: ["Groupe", "Caractéristique", "Exemple"],
        lignes: [
          ["1er groupe", "Infinitif en -ER", "parler"],
          ["2e groupe", "Infinitif en -IR + nous -issons", "finir"],
          ["3e groupe", "Tous les autres verbes", "prendre"]
        ]
      }
    },

    {
      titre: "Exemples en contexte",
      exemples: [
        {
          fr: "Je parle français avec mes amis.",
          trad: "I speak French with my friends."
        },
        {
          fr: "Nous finissons le travail à 18 heures.",
          trad: "We finish work at 6 PM."
        },
        {
          fr: "Ils prennent le train chaque matin.",
          trad: "They take the train every morning."
        },
        {
          fr: "Le soleil se lève à l'est.",
          trad: "The sun rises in the east."
        }
      ]
    },

    {
      titre: "Erreurs fréquentes",
      texte: "Les apprenants oublient souvent de conjuguer le verbe ou confondent les terminaisons des différents groupes.",
      astuce: "Après le sujet, le verbe doit toujours être conjugué."
    }

  ],

  exercices: [

    {
      question: "Je ___ français.",
      choix: ["parle", "parler", "parles", "parlons"]
    },

    {
      question: "Nous ___ le repas.",
      choix: ["finissons", "finit", "finissez", "finis"]
    },

    {
      question: "Ils ___ le bus.",
      choix: ["prennent", "prend", "prenons", "prenez"]
    },

    {
      question: "Tu ___ anglais.",
      choix: ["parles", "parle", "parlons", "parlent"]
    },

    {
      question: "Vous ___ le projet aujourd'hui.",
      choix: ["finissez", "finissons", "finit", "finis"]
    },

    {
      question: "Je ___ mon sac.",
      choix: ["prends", "prennent", "prenez", "prenons"]
    },

    {
      question: "Elle ___ avec ses collègues.",
      choix: ["parle", "parles", "parlons", "parlent"]
    },

    {
      question: "Nous ___ notre travail.",
      choix: ["finissons", "finissez", "finit", "finis"]
    },

    {
      question: "Tu ___ un café.",
      choix: ["prends", "prennent", "prenons", "prenez"]
    },

    {
      question: "Ils ___ souvent ensemble.",
      choix: ["parlent", "parle", "parlons", "parlez"]
    },

    {
      question: "Je ___ mes devoirs.",
      choix: ["finis", "finit", "finissons", "finissez"]
    },

    {
      question: "Vous ___ le métro.",
      choix: ["prenez", "prends", "prenons", "prennent"]
    },

    {
      question: "Nous ___ de politique.",
      choix: ["parlons", "parle", "parlez", "parlent"]
    },

    {
      question: "Elle ___ son livre.",
      choix: ["finit", "finis", "finissons", "finissez"]
    },

    {
      question: "Ils ___ leur temps.",
      choix: ["prennent", "prend", "prenons", "prenez"]
    }

  ],

  flashcards: [

    {
      recto     : "Présent",
      sous_recto: "Temps verbal",
      verso     : "Temps utilisé pour parler du présent",
      detail    : "Le temps le plus fréquent en français.",
      exemple   : "Je travaille."
    },

    {
      recto     : "Action actuelle",
      sous_recto: "Usage",
      verso     : "Action en cours",
      detail    : "Se déroule maintenant.",
      exemple   : "Je mange."
    },

    {
      recto     : "Habitude",
      sous_recto: "Usage",
      verso     : "Action répétée",
      detail    : "Tous les jours, chaque semaine...",
      exemple   : "Je cours tous les matins."
    },

    {
      recto     : "Vérité générale",
      sous_recto: "Usage",
      verso     : "Fait toujours vrai",
      detail    : "Lois scientifiques ou faits universels.",
      exemple   : "L'eau bout à 100°C."
    },

    {
      recto     : "1er groupe",
      sous_recto: "Conjugaison",
      verso     : "Verbes en -ER",
      detail    : "Groupe le plus fréquent.",
      exemple   : "parler"
    },

    {
      recto     : "2e groupe",
      sous_recto: "Conjugaison",
      verso     : "Verbes en -IR avec -issons",
      detail    : "Conjugaison régulière.",
      exemple   : "finir"
    },

    {
      recto     : "3e groupe",
      sous_recto: "Conjugaison",
      verso     : "Autres verbes",
      detail    : "Conjugaisons variées.",
      exemple   : "prendre"
    },

    {
      recto     : "parle",
      sous_recto: "1er groupe",
      verso     : "Forme du verbe parler",
      detail    : "Présent de l'indicatif.",
      exemple   : "Je parle français."
    },

    {
      recto     : "finissons",
      sous_recto: "2e groupe",
      verso     : "Forme du verbe finir",
      detail    : "1re personne du pluriel.",
      exemple   : "Nous finissons à 18h."
    },

    {
      recto     : "prennent",
      sous_recto: "3e groupe",
      verso     : "Forme du verbe prendre",
      detail    : "3e personne du pluriel.",
      exemple   : "Ils prennent le train."
    },

    {
      recto     : "Aujourd'hui",
      sous_recto: "Indicateur",
      verso     : "Présent",
      detail    : "Repère temporel fréquent.",
      exemple   : "Aujourd'hui, je travaille."
    },

    {
      recto     : "Maintenant",
      sous_recto: "Indicateur",
      verso     : "Action actuelle",
      detail    : "Moment présent.",
      exemple   : "Je mange maintenant."
    }

  ]
});
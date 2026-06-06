registerLecon({
  titre       : "L'imparfait",
  icon        : "📖",
  niveau      : "A2",
  theme       : "Conjugaison",
  description : "Apprendre à décrire le passé et parler des habitudes passées.",
  duree       : "20 min",

  intro: "L'imparfait est utilisé pour parler d'actions habituelles dans le passé, de descriptions, de situations ou d'actions en cours dans le passé. Il est souvent utilisé avec le passé composé dans les récits.",

  sections: [

    {
      titre: "Quand utilise-t-on l'imparfait ?",
      texte: "L'imparfait permet de décrire le passé. Il sert à parler d'habitudes passées, de descriptions, de sentiments ou d'actions qui duraient dans le temps."
    },

    {
      titre: "Les principaux usages de l'imparfait",
      tableau: {
        entetes: ["Usage", "Exemple", "Explication"],
        lignes: [
          ["Habitude passée", "Je jouais au football.", "Action répétée dans le passé."],
          ["Description", "La maison était grande.", "Décrire une personne, un lieu ou une situation."],
          ["Sentiment", "J'étais heureux.", "Exprimer un état émotionnel."],
          ["Action en cours", "Je lisais quand il est arrivé.", "Action interrompue par une autre."],
          ["Contexte", "Il faisait beau.", "Installer le décor d'une histoire."]
        ]
      }
    },

    {
      titre: "Comment former l'imparfait ?",
      texte: "On prend la forme 'nous' du présent, on retire -ons puis on ajoute les terminaisons de l'imparfait : ais, ais, ait, ions, iez, aient.",
      tableau: {
        entetes: ["Sujet", "Terminaison"],
        lignes: [
          ["Je", "-ais"],
          ["Tu", "-ais"],
          ["Il / Elle", "-ait"],
          ["Nous", "-ions"],
          ["Vous", "-iez"],
          ["Ils / Elles", "-aient"]
        ]
      }
    },

    {
      titre: "Les verbes du 1er groupe (-ER)",
      texte: "Les verbes du premier groupe suivent un modèle très régulier à l'imparfait.",
      tableau: {
        entetes: ["Sujet", "Parler"],
        lignes: [
          ["Je", "parlais"],
          ["Tu", "parlais"],
          ["Il / Elle", "parlait"],
          ["Nous", "parlions"],
          ["Vous", "parliez"],
          ["Ils / Elles", "parlaient"]
        ]
      }
    },

    {
      titre: "Les verbes du 2e groupe (-IR)",
      texte: "Les verbes du deuxième groupe utilisent également les mêmes terminaisons.",
      tableau: {
        entetes: ["Sujet", "Finir"],
        lignes: [
          ["Je", "finissais"],
          ["Tu", "finissais"],
          ["Il / Elle", "finissait"],
          ["Nous", "finissions"],
          ["Vous", "finissiez"],
          ["Ils / Elles", "finissaient"]
        ]
      }
    },

    {
      titre: "Les verbes du 3e groupe",
      texte: "Les verbes du troisième groupe utilisent également les mêmes terminaisons à partir de leur radical.",
      tableau: {
        entetes: ["Sujet", "Prendre"],
        lignes: [
          ["Je", "prenais"],
          ["Tu", "prenais"],
          ["Il / Elle", "prenait"],
          ["Nous", "prenions"],
          ["Vous", "preniez"],
          ["Ils / Elles", "prenaient"]
        ]
      }
    },

    {
      titre: "Comparer les trois groupes",
      tableau: {
        entetes: ["Sujet", "Parler", "Finir", "Prendre"],
        lignes: [
          ["Je", "parlais", "finissais", "prenais"],
          ["Tu", "parlais", "finissais", "prenais"],
          ["Il / Elle", "parlait", "finissait", "prenait"],
          ["Nous", "parlions", "finissions", "prenions"],
          ["Vous", "parliez", "finissiez", "preniez"],
          ["Ils / Elles", "parlaient", "finissaient", "prenaient"]
        ]
      }
    },

    {
      titre: "Imparfait ou passé composé ?",
      texte: "L'imparfait décrit une situation ou une habitude. Le passé composé raconte une action terminée.",
      exemples: [
        {
          fr: "Je lisais quand il est arrivé.",
          trad: "I was reading when he arrived.",
          note: "Imparfait + passé composé."
        },
        {
          fr: "Il faisait beau et les enfants jouaient.",
          trad: "The weather was nice and the children were playing.",
          note: "Description."
        },
        {
          fr: "Chaque été, nous voyagions ensemble.",
          trad: "Every summer, we travelled together.",
          note: "Habitude passée."
        }
      ]
    },

    {
      titre: "Les indicateurs de temps fréquents",
      tableau: {
        entetes: ["Expression", "Utilisation"],
        lignes: [
          ["Avant", "Habitude passée"],
          ["Quand j'étais enfant", "Description du passé"],
          ["Tous les jours", "Répétition"],
          ["Chaque semaine", "Habitude"],
          ["À cette époque", "Contexte passé"]
        ]
      }
    },

    {
      titre: "Erreurs fréquentes",
      texte: "Les apprenants confondent souvent imparfait et passé composé.",
      astuce: "Si l'action dure ou décrit une situation, utilise l'imparfait. Si l'action est terminée et ponctuelle, utilise le passé composé."
    }

  ],

  exercices: [

    {
      question: "Quand j'étais petit, je ___ au football.",
      choix: ["jouais", "ai joué", "joue", "jouerai"]
    },

    {
      question: "Nous ___ souvent ensemble.",
      choix: ["parlions", "parlons", "avons parlé", "parlerons"]
    },

    {
      question: "Ils ___ leurs devoirs tous les soirs.",
      choix: ["finissaient", "ont fini", "finissent", "finiront"]
    },

    {
      question: "Tu ___ toujours le train.",
      choix: ["prenais", "as pris", "prends", "prendras"]
    },

    {
      question: "Elle ___ dans une grande maison.",
      choix: ["habitait", "a habité", "habite", "habitera"]
    },

    {
      question: "Nous ___ beaucoup pendant les vacances.",
      choix: ["voyagions", "avons voyagé", "voyageons", "voyagerons"]
    },

    {
      question: "Je ___ quand le téléphone a sonné.",
      choix: ["lisais", "ai lu", "lis", "lirai"]
    },

    {
      question: "Vous ___ toujours ensemble.",
      choix: ["travailliez", "travaillez", "avez travaillé", "travaillerez"]
    },

    {
      question: "Ils ___ souvent des livres.",
      choix: ["lisaient", "ont lu", "lisent", "liront"]
    },

    {
      question: "Je ___ très heureux à cette époque.",
      choix: ["étais", "ai été", "suis", "serai"]
    },

    {
      question: "Nous ___ chaque week-end.",
      choix: ["sortions", "sommes sortis", "sortons", "sortirons"]
    },

    {
      question: "Tu ___ toujours en retard.",
      choix: ["arrivais", "es arrivé", "arrives", "arriveras"]
    },

    {
      question: "Elle ___ la télévision tous les soirs.",
      choix: ["regardait", "a regardé", "regarde", "regardera"]
    },

    {
      question: "Vous ___ souvent le métro.",
      choix: ["preniez", "avez pris", "prenez", "prendrez"]
    },

    {
      question: "Ils ___ dans le jardin.",
      choix: ["jouaient", "ont joué", "jouent", "joueront"]
    }

  ],

  flashcards: [

    {
      recto: "Imparfait",
      sous_recto: "Temps verbal",
      verso: "Description du passé",
      detail: "Temps utilisé pour les habitudes et descriptions.",
      exemple: "Je jouais au football."
    },

    {
      recto: "Habitude passée",
      sous_recto: "Usage",
      verso: "Action répétée dans le passé",
      detail: "Tous les jours, chaque semaine...",
      exemple: "Je lisais chaque soir."
    },

    {
      recto: "Description",
      sous_recto: "Usage",
      verso: "Décrire une situation",
      detail: "Personnes, lieux, météo...",
      exemple: "La maison était grande."
    },

    {
      recto: "Contexte",
      sous_recto: "Usage",
      verso: "Installer le décor",
      detail: "Souvent utilisé dans les récits.",
      exemple: "Il faisait beau."
    },

    {
      recto: "-ais",
      sous_recto: "Terminaison",
      verso: "Je / Tu",
      detail: "Imparfait",
      exemple: "Je parlais."
    },

    {
      recto: "-ait",
      sous_recto: "Terminaison",
      verso: "Il / Elle",
      detail: "Imparfait",
      exemple: "Elle finissait."
    },

    {
      recto: "-ions",
      sous_recto: "Terminaison",
      verso: "Nous",
      detail: "Imparfait",
      exemple: "Nous prenions."
    },

    {
      recto: "-iez",
      sous_recto: "Terminaison",
      verso: "Vous",
      detail: "Imparfait",
      exemple: "Vous parliez."
    },

    {
      recto: "-aient",
      sous_recto: "Terminaison",
      verso: "Ils / Elles",
      detail: "Imparfait",
      exemple: "Ils parlaient."
    },

    {
      recto: "Parler",
      sous_recto: "1er groupe",
      verso: "parlais",
      detail: "Verbe régulier en -ER",
      exemple: "Je parlais."
    },

    {
      recto: "Finir",
      sous_recto: "2e groupe",
      verso: "finissais",
      detail: "Verbe régulier en -IR",
      exemple: "Je finissais."
    },

    {
      recto: "Prendre",
      sous_recto: "3e groupe",
      verso: "prenais",
      detail: "Exemple du 3e groupe",
      exemple: "Je prenais le train."
    }

  ]
});
registerLecon({
  titre       : "Le futur simple",
  icon        : "🔮",
  niveau      : "A2",
  theme       : "Conjugaison",
  description : "Apprendre à parler d'actions et de projets futurs avec le futur simple.",
  duree       : "20 min",

  intro: "Le futur simple permet de parler d'événements qui se produiront plus tard. Il est utilisé pour exprimer des projets, des prédictions, des promesses ou des actions futures. Contrairement au futur proche, il concerne souvent un futur plus éloigné ou moins certain.",

  sections: [

    {
      titre: "Quand utilise-t-on le futur simple ?",
      texte: "Le futur simple sert à parler d'actions qui se dérouleront dans l'avenir. Il est très utilisé pour les projets, les prévisions, les promesses et les intentions futures."
    },

    {
      titre: "Les principaux usages du futur simple",
      tableau: {
        entetes: ["Usage", "Exemple", "Explication"],
        lignes: [
          ["Projet futur", "Je voyagerai en France.", "Projet prévu dans l'avenir."],
          ["Prédiction", "Il fera beau demain.", "Prévision ou supposition."],
          ["Promesse", "Je t'aiderai.", "Engagement futur."],
          ["Décision", "Nous partirons en juillet.", "Choix concernant l'avenir."],
          ["Conséquence", "Tu réussiras si tu travailles.", "Résultat futur."]
        ]
      }
    },

    {
      titre: "Comment former le futur simple ?",
      texte: "Pour la plupart des verbes, on conserve l'infinitif et on ajoute les terminaisons du futur simple.",
      tableau: {
        entetes: ["Sujet", "Terminaison"],
        lignes: [
          ["Je", "-ai"],
          ["Tu", "-as"],
          ["Il / Elle", "-a"],
          ["Nous", "-ons"],
          ["Vous", "-ez"],
          ["Ils / Elles", "-ont"]
        ]
      }
    },

    {
      titre: "Les verbes du 1er groupe (-ER)",
      texte: "Les verbes du premier groupe gardent l'infinitif complet avant d'ajouter les terminaisons du futur.",
      tableau: {
        entetes: ["Sujet", "Parler"],
        lignes: [
          ["Je", "parlerai"],
          ["Tu", "parleras"],
          ["Il / Elle", "parlera"],
          ["Nous", "parlerons"],
          ["Vous", "parlerez"],
          ["Ils / Elles", "parleront"]
        ]
      }
    },

    {
      titre: "Les verbes du 2e groupe (-IR)",
      texte: "Les verbes du deuxième groupe suivent la même logique que les verbes du premier groupe.",
      tableau: {
        entetes: ["Sujet", "Finir"],
        lignes: [
          ["Je", "finirai"],
          ["Tu", "finiras"],
          ["Il / Elle", "finira"],
          ["Nous", "finirons"],
          ["Vous", "finirez"],
          ["Ils / Elles", "finiront"]
        ]
      }
    },

    {
      titre: "Les verbes du 3e groupe",
      texte: "Les verbes du troisième groupe possèdent souvent des radicaux particuliers. Il faut généralement les mémoriser.",
      tableau: {
        entetes: ["Sujet", "Prendre"],
        lignes: [
          ["Je", "prendrai"],
          ["Tu", "prendras"],
          ["Il / Elle", "prendra"],
          ["Nous", "prendrons"],
          ["Vous", "prendrez"],
          ["Ils / Elles", "prendront"]
        ]
      }
    },

    {
      titre: "Comparer les trois groupes",
      tableau: {
        entetes: ["Sujet", "Parler", "Finir", "Prendre"],
        lignes: [
          ["Je", "parlerai", "finirai", "prendrai"],
          ["Tu", "parleras", "finiras", "prendras"],
          ["Il / Elle", "parlera", "finira", "prendra"],
          ["Nous", "parlerons", "finirons", "prendrons"],
          ["Vous", "parlerez", "finirez", "prendrez"],
          ["Ils / Elles", "parleront", "finiront", "prendront"]
        ]
      }
    },

    {
      titre: "Les indicateurs de temps fréquents",
      tableau: {
        entetes: ["Expression", "Exemple"],
        lignes: [
          ["Demain", "Demain, je travaillerai."],
          ["La semaine prochaine", "Nous voyagerons."],
          ["Le mois prochain", "Elle déménagera."],
          ["L'année prochaine", "Ils étudieront à l'étranger."],
          ["Plus tard", "Je te téléphonerai plus tard."]
        ]
      }
    },

    {
      titre: "Futur simple ou futur proche ?",
      texte: "Le futur proche est souvent utilisé pour une action imminente. Le futur simple est plus fréquent pour les projets, les prédictions et les actions plus éloignées.",
      exemples: [
        {
          fr: "Je vais partir dans cinq minutes.",
          trad: "I am going to leave in five minutes.",
          note: "Futur proche"
        },
        {
          fr: "Je partirai en France l'année prochaine.",
          trad: "I will leave for France next year.",
          note: "Futur simple"
        },
        {
          fr: "Nous voyagerons beaucoup après notre retraite.",
          trad: "We will travel a lot after retirement.",
          note: "Projet futur"
        }
      ]
    },

    {
      titre: "Erreurs fréquentes",
      texte: "Les apprenants oublient souvent les terminaisons ou utilisent l'infinitif seul.",
      astuce: "Le futur simple = infinitif + ai, as, a, ons, ez, ont."
    }

  ],

  exercices: [

    {
      question: "Demain, je ___ français.",
      choix: ["parlerai", "parle", "parlais", "ai parlé"]
    },

    {
      question: "Nous ___ le projet la semaine prochaine.",
      choix: ["finirons", "finissons", "finissions", "avons fini"]
    },

    {
      question: "Ils ___ le train demain matin.",
      choix: ["prendront", "prennent", "prenaient", "ont pris"]
    },

    {
      question: "Tu ___ avec nous.",
      choix: ["voyageras", "voyages", "voyageais", "as voyagé"]
    },

    {
      question: "Elle ___ ses amis ce week-end.",
      choix: ["appellera", "appelle", "appelait", "a appelé"]
    },

    {
      question: "Nous ___ à Paris l'année prochaine.",
      choix: ["habiterons", "habitons", "habitions", "avons habité"]
    },

    {
      question: "Vous ___ votre examen.",
      choix: ["réussirez", "réussissez", "réussissiez", "avez réussi"]
    },

    {
      question: "Ils ___ leurs devoirs ce soir.",
      choix: ["termineront", "terminent", "terminaient", "ont terminé"]
    },

    {
      question: "Je ___ une nouvelle langue.",
      choix: ["apprendrai", "apprends", "apprenais", "ai appris"]
    },

    {
      question: "Tu ___ un café plus tard.",
      choix: ["prendras", "prends", "prenais", "as pris"]
    },

    {
      question: "Elle ___ une nouvelle voiture.",
      choix: ["achètera", "achète", "achetait", "a acheté"]
    },

    {
      question: "Nous ___ ensemble demain.",
      choix: ["travaillerons", "travaillons", "travaillions", "avons travaillé"]
    },

    {
      question: "Vous ___ la réponse bientôt.",
      choix: ["comprendrez", "comprenez", "compreniez", "avez compris"]
    },

    {
      question: "Ils ___ dans un autre pays.",
      choix: ["vivront", "vivent", "vivaient", "ont vécu"]
    },

    {
      question: "Je ___ mes parents dimanche.",
      choix: ["verrai", "vois", "voyais", "ai vu"]
    }

  ],

  flashcards: [

    {
      recto: "Futur simple",
      sous_recto: "Temps verbal",
      verso: "Action future",
      detail: "Temps utilisé pour parler de l'avenir.",
      exemple: "Je voyagerai."
    },

    {
      recto: "-ai",
      sous_recto: "Terminaison",
      verso: "Je",
      detail: "1re personne du singulier.",
      exemple: "Je parlerai."
    },

    {
      recto: "-as",
      sous_recto: "Terminaison",
      verso: "Tu",
      detail: "2e personne du singulier.",
      exemple: "Tu parleras."
    },

    {
      recto: "-a",
      sous_recto: "Terminaison",
      verso: "Il / Elle",
      detail: "3e personne du singulier.",
      exemple: "Elle parlera."
    },

    {
      recto: "-ons",
      sous_recto: "Terminaison",
      verso: "Nous",
      detail: "1re personne du pluriel.",
      exemple: "Nous parlerons."
    },

    {
      recto: "-ez",
      sous_recto: "Terminaison",
      verso: "Vous",
      detail: "2e personne du pluriel.",
      exemple: "Vous parlerez."
    },

    {
      recto: "-ont",
      sous_recto: "Terminaison",
      verso: "Ils / Elles",
      detail: "3e personne du pluriel.",
      exemple: "Ils parleront."
    },

    {
      recto: "Parler",
      sous_recto: "1er groupe",
      verso: "parlerai",
      detail: "Verbe régulier en -ER.",
      exemple: "Je parlerai demain."
    },

    {
      recto: "Finir",
      sous_recto: "2e groupe",
      verso: "finirai",
      detail: "Verbe régulier en -IR.",
      exemple: "Je finirai ce soir."
    },

    {
      recto: "Prendre",
      sous_recto: "3e groupe",
      verso: "prendrai",
      detail: "Exemple du 3e groupe.",
      exemple: "Je prendrai le train."
    },

    {
      recto: "Demain",
      sous_recto: "Indicateur",
      verso: "Futur",
      detail: "Expression courante du futur.",
      exemple: "Demain, je travaillerai."
    },

    {
      recto: "Projet",
      sous_recto: "Usage",
      verso: "Action prévue",
      detail: "Plan pour l'avenir.",
      exemple: "Nous voyagerons en France."
    }

  ]
});
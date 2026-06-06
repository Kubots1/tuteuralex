registerLecon({
  /* ─── IDENTITÉ ─── */
  titre       : "Les salutations",
  icon        : "👋",
  niveau      : "A0",
  theme       : "Communication",
  description : "Apprends à dire bonjour, au revoir et à te présenter en français.",
  duree       : "10 min",

  /* ─── THÉORIE ─── */
  intro: "Les salutations sont les premiers mots qu'on apprend dans une langue. En français, elles varient selon le moment de la journée et le degré de formalité.",

  sections: [
    {
      titre: "Saluer quelqu'un",
      texte: "En français, on adapte la salutation selon l'heure de la journée et la situation (formelle ou informelle).",
      tableau: {
        entetes: ["Expression", "Traduction", "Utilisation"],
        lignes: [
          ["Bonjour",       "Hello / Good morning", "Le matin et l'après-midi"],
          ["Bonsoir",       "Good evening",          "Le soir"],
          ["Salut",         "Hi",                    "Informel, entre amis"],
          ["Coucou",        "Hey!",                  "Très informel, familier"],
          ["Bonne nuit",    "Good night",            "Avant de dormir"],
        ]
      }
    },
    {
      titre: "Dire au revoir",
      exemples: [
        { fr: "Au revoir !",        trad: "Goodbye!",           note: "Formel et informel" },
        { fr: "À bientôt !",        trad: "See you soon!",      note: "On se reverra prochainement" },
        { fr: "À demain !",         trad: "See you tomorrow!",  note: "On se revoit demain" },
        { fr: "À plus (tard) !",    trad: "See you later!",     note: "Très informel — souvent abrégé en 'À plus !'" },
        { fr: "Bonne journée !",    trad: "Have a good day!",   note: "En partant le matin" },
      ]
    },
    {
      titre: "Demander comment ça va",
      texte: "Après avoir salué, on demande souvent comment l'autre se porte.",
      exemples: [
        { fr: "Comment allez-vous ?",  trad: "How are you? (formel)",   note: "Formel, avec 'vous'" },
        { fr: "Comment vas-tu ?",      trad: "How are you? (informel)", note: "Informel, avec 'tu'" },
        { fr: "Ça va ?",              trad: "How's it going?",          note: "Très courant" },
        { fr: "Quoi de neuf ?",       trad: "What's new?",              note: "Entre amis" },
      ]
    },
    {
      titre: "Répondre à 'Ça va ?'",
      tableau: {
        entetes: ["Réponse", "Sens", "Niveau"],
        lignes: [
          ["Très bien, merci !",    "Very well, thank you!", "Positif"],
          ["Ça va bien.",           "I'm fine.",             "Neutre positif"],
          ["Ça va.",                "I'm okay.",             "Neutre"],
          ["Pas mal.",              "Not bad.",              "Neutre"],
          ["Comme ci, comme ça.", "So-so.",                "Mitigé"],
          ["Pas très bien.",        "Not very well.",        "Négatif"],
        ]
      },
      astuce: "En France, 'Ça va ?' est très souvent une simple formule de politesse. On répond brièvement 'Ça va !' même si tout ne va pas parfaitement bien."
    },
    {
      titre: "Se présenter",
      exemples: [
        { fr: "Je m'appelle Marie.",     trad: "My name is Marie.",        note: "Formule la plus courante" },
        { fr: "Mon prénom est Pierre.",  trad: "My first name is Pierre.", note: "Plus formel" },
        { fr: "Je suis étudiant(e).",    trad: "I am a student.",          note: "Profession ou statut" },
        { fr: "J'habite à Lyon.",        trad: "I live in Lyon.",          note: "Lieu de résidence" },
        { fr: "Je viens d'Espagne.",     trad: "I come from Spain.",       note: "Origine" },
      ]
    }
  ],

  /* ─── EXERCICE QCM ─── */
  /* La première réponse est TOUJOURS la bonne — elles sont mélangées automatiquement */
  exercices: [
    {
      question: "Comment dit-on 'Hello' le matin en français ?",
      choix: ["Bonjour", "Bonsoir", "Bonne nuit", "Au revoir"]
    },
    {
      question: "Quelle salutation utilise-t-on le soir ?",
      choix: ["Bonsoir", "Bonjour", "Coucou", "Salut"]
    },
    {
      question: "Comment dit-on 'See you soon' en français ?",
      choix: ["À bientôt", "Au revoir", "Bonne nuit", "Bonsoir"]
    },
    {
      question: "Quelle formule est la plus formelle pour demander comment ça va ?",
      choix: ["Comment allez-vous ?", "Ça va ?", "Quoi de neuf ?", "Comment vas-tu ?"]
    },
    {
      question: "Que répond-on généralement à 'Ça va ?' en France ?",
      choix: ["Ça va !", "Je m'appelle Paul.", "Bonjour !", "À bientôt !"]
    },
    {
      question: "Comment se présente-t-on en donnant son prénom ?",
      choix: ["Je m'appelle Marie.", "Je vais bien.", "Bonsoir !", "À demain !"]
    },
    {
      question: "'Salut' est une salutation...",
      choix: ["Informelle", "Formelle", "Utilisée le soir", "Pour dire au revoir uniquement"]
    },
    {
      question: "Que signifie 'Pas mal' ?",
      choix: ["Not bad", "Very good", "Not well", "Goodbye"]
    },
    {
      question: "Comment dit-on 'Good night' en français ?",
      choix: ["Bonne nuit", "Bonsoir", "Bonne journée", "Au revoir"]
    },
    {
      question: "Quelle phrase signifie 'I come from Spain' ?",
      choix: ["Je viens d'Espagne.", "J'habite en Espagne.", "Je parle espagnol.", "Je suis espagnol."]
    },
  ],

  /* ─── FLASHCARDS ─── */
  /* recto = face visible | verso = réponse | detail = info supplémentaire | exemple = phrase */
  flashcards: [
    {
      recto: "Bonjour",
      sous_recto: "Salutation",
      verso: "Hello / Good morning",
      detail: "Utilisé le matin et l'après-midi",
      exemple: "Bonjour, comment allez-vous ?"
    },
    {
      recto: "Bonsoir",
      sous_recto: "Salutation",
      verso: "Good evening",
      detail: "Utilisé à partir de la fin d'après-midi",
      exemple: "Bonsoir, ça va ?"
    },
    {
      recto: "Au revoir",
      sous_recto: "Adieu",
      verso: "Goodbye",
      detail: "Formel et informel",
      exemple: "Au revoir, à bientôt !"
    },
    {
      recto: "À bientôt",
      sous_recto: "Adieu",
      verso: "See you soon",
      detail: "Implique qu'on se reverra prochainement",
      exemple: "Bonne journée ! À bientôt !"
    },
    {
      recto: "Ça va ?",
      sous_recto: "Question",
      verso: "How's it going?",
      detail: "Formule très courante, souvent rhétorique",
      exemple: "Salut ! Ça va ?"
    },
    {
      recto: "Je m'appelle...",
      sous_recto: "Présentation",
      verso: "My name is...",
      detail: "Formule standard pour se présenter",
      exemple: "Je m'appelle Sophie."
    },
    {
      recto: "Très bien, merci",
      sous_recto: "Réponse",
      verso: "Very well, thank you",
      detail: "Réponse positive à 'Ça va ?'",
      exemple: "— Ça va ? — Très bien, merci !"
    },
    {
      recto: "Comme ci, comme ça",
      sous_recto: "Réponse",
      verso: "So-so",
      detail: "Réponse mitigée, ni bien ni mal",
      exemple: "— Tu vas bien ? — Comme ci, comme ça..."
    },
    {
      recto: "J'habite à...",
      sous_recto: "Présentation",
      verso: "I live in...",
      detail: "Pour indiquer son lieu de résidence",
      exemple: "J'habite à Paris."
    },
    {
      recto: "Je viens de...",
      sous_recto: "Présentation",
      verso: "I come from...",
      detail: "Pour indiquer son pays d'origine",
      exemple: "Je viens du Japon."
    },
  ]
});

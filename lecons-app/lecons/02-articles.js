registerLecon({
  titre       : "Les articles en français",
  icon        : "📝",
  niveau      : "A1",
  theme       : "Grammaire",
  description : "Comprends et utilise les articles définis, indéfinis et partitifs.",
  duree       : "15 min",

  intro: "En français, chaque nom est précédé d'un article qui indique son genre (masculin/féminin) et son nombre (singulier/pluriel). Il existe trois types d'articles.",

  sections: [
    {
      titre: "Les articles définis (le, la, les)",
      texte: "On utilise les articles définis pour parler de quelque chose de précis, de connu ou de général.",
      tableau: {
        entetes: ["Article", "Genre/Nombre", "Exemple"],
        lignes: [
          ["le",  "Masculin singulier",  "le chat (the cat)"],
          ["la",  "Féminin singulier",   "la maison (the house)"],
          ["l'",  "Devant voyelle ou h", "l'arbre, l'hôtel"],
          ["les", "Pluriel",             "les enfants (the children)"],
        ]
      },
      astuce: "Devant une voyelle (a, e, i, o, u) ou un h muet, 'le' et 'la' deviennent 'l''. Ex : l'ami, l'eau."
    },
    {
      titre: "Les articles indéfinis (un, une, des)",
      texte: "On utilise les articles indéfinis pour parler de quelque chose de non précis, mentionné pour la première fois.",
      tableau: {
        entetes: ["Article", "Genre/Nombre", "Exemple"],
        lignes: [
          ["un",  "Masculin singulier", "un livre (a book)"],
          ["une", "Féminin singulier",  "une pomme (an apple)"],
          ["des", "Pluriel",            "des amis (some friends)"],
        ]
      },
      exemples: [
        { fr: "J'ai un chien.",      trad: "I have a dog.",          note: "Premier mention" },
        { fr: "C'est une belle ville.", trad: "It's a beautiful city." },
        { fr: "Il y a des nuages.",  trad: "There are some clouds." },
      ]
    },
    {
      titre: "Les articles partitifs (du, de la, de l')",
      texte: "On utilise les articles partitifs pour parler d'une quantité non précise, souvent avec des choses non comptables.",
      tableau: {
        entetes: ["Article", "Usage", "Exemple"],
        lignes: [
          ["du",    "Masculin singulier",  "du pain (some bread)"],
          ["de la", "Féminin singulier",   "de la musique (some music)"],
          ["de l'", "Devant voyelle ou h", "de l'eau (some water)"],
          ["des",   "Pluriel",             "des légumes (some vegetables)"],
        ]
      },
      astuce: "Après une négation, tous les articles (un, une, des, du, de la) deviennent 'de' ou 'd''. Ex : Je mange du pain → Je ne mange pas de pain."
    },
    {
      titre: "Comparaison pratique",
      exemples: [
        { fr: "Le pain est délicieux.",   trad: "The bread is delicious.",      note: "Défini → parle du pain en général" },
        { fr: "Je veux du pain.",         trad: "I want some bread.",           note: "Partitif → quantité indéfinie" },
        { fr: "Je mange une baguette.",   trad: "I'm eating a baguette.",       note: "Indéfini → objet précis mais non connu" },
        { fr: "J'aime les croissants.",   trad: "I love croissants.",           note: "Défini → généralité" },
        { fr: "Je n'ai pas de voiture.",  trad: "I don't have a car.",          note: "Négation → 'de' remplace l'article" },
      ]
    }
  ],

  exercices: [
    {
      question: "Quel article utilise-t-on devant 'chat' (masculin) ?",
      choix: ["le", "la", "les", "l'"]
    },
    {
      question: "Complète : '...  eau est froide.'",
      choix: ["L'", "Le", "La", "Les"]
    },
    {
      question: "Quel article indéfini utilise-t-on pour un nom féminin singulier ?",
      choix: ["une", "un", "des", "de"]
    },
    {
      question: "J'ai ... chien et ... chat.",
      choix: ["un / un", "le / le", "une / une", "des / des"]
    },
    {
      question: "Je mange ... pain. (quantité non précise)",
      choix: ["du", "le", "un", "des"]
    },
    {
      question: "Elle boit ... eau minérale.",
      choix: ["de l'", "du", "de la", "une"]
    },
    {
      question: "Après une négation, 'du' devient...",
      choix: ["de", "du", "un", "le"]
    },
    {
      question: "Je n'ai pas ... voiture.",
      choix: ["de", "une", "la", "du"]
    },
    {
      question: "... enfants jouent dans le jardin. (défini pluriel)",
      choix: ["Les", "Des", "Un", "Le"]
    },
    {
      question: "Il y a ... nuages dans le ciel. (quantité indéfinie)",
      choix: ["des", "les", "un", "du"]
    },
  ],

  flashcards: [
    { recto: "le / la / les", sous_recto: "Articles définis", verso: "the", detail: "Pour quelque chose de connu ou en général", exemple: "Le soleil brille." },
    { recto: "un / une / des", sous_recto: "Articles indéfinis", verso: "a / an / some", detail: "Pour quelque chose de non précis", exemple: "J'ai une idée." },
    { recto: "du / de la / de l'", sous_recto: "Articles partitifs", verso: "some (uncountable)", detail: "Pour des quantités non dénombrables", exemple: "Je bois du café." },
    { recto: "l'", sous_recto: "Élision", verso: "the (before vowel)", detail: "Contraction de 'le' ou 'la' devant voyelle ou h muet", exemple: "L'hôtel est grand." },
    { recto: "de (négation)", sous_recto: "Article négatif", verso: "no / not any", detail: "Remplace tous les articles après une négation", exemple: "Je n'ai pas de chance." },
    { recto: "le pain", sous_recto: "Masculin défini", verso: "the bread", detail: "Article défini masculin singulier", exemple: "Le pain est frais." },
    { recto: "une pomme", sous_recto: "Féminin indéfini", verso: "an apple", detail: "Article indéfini féminin singulier", exemple: "Je mange une pomme." },
    { recto: "des amis", sous_recto: "Pluriel indéfini", verso: "some friends", detail: "Article indéfini pluriel", exemple: "J'ai des amis sympa." },
  ]
});

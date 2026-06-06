registerLecon({
  titre       : "Les chiffres et les nombres",
  icon        : "🔢",
  niveau      : "A0",
  theme       : "Vocabulaire",
  description : "Apprends à compter de 0 à 100 et à utiliser les nombres dans la vie quotidienne.",
  duree       : "12 min",

  intro: "Les nombres sont essentiels en français pour indiquer l'heure, les prix, les âges et les quantités. Apprends-les par groupes pour les mémoriser plus facilement !",

  sections: [
    {
      titre: "Les nombres de 0 à 20",
      tableau: {
        entetes: ["Chiffre", "Français", "Prononciation"],
        lignes: [
          ["0",  "zéro",      "zay-ro"],
          ["1",  "un / une",  "uhn / oon"],
          ["2",  "deux",      "duh"],
          ["3",  "trois",     "twa"],
          ["4",  "quatre",    "katr"],
          ["5",  "cinq",      "sank"],
          ["6",  "six",       "sees"],
          ["7",  "sept",      "set"],
          ["8",  "huit",      "weet"],
          ["9",  "neuf",      "nuhf"],
          ["10", "dix",       "dees"],
          ["11", "onze",      "onz"],
          ["12", "douze",     "dooz"],
          ["13", "treize",    "trez"],
          ["14", "quatorze",  "katorz"],
          ["15", "quinze",    "kanz"],
          ["16", "seize",     "sez"],
          ["17", "dix-sept",  "dee-set"],
          ["18", "dix-huit",  "dee-zweet"],
          ["19", "dix-neuf",  "deez-nuhf"],
          ["20", "vingt",     "van"],
        ]
      }
    },
    {
      titre: "Les dizaines",
      tableau: {
        entetes: ["Nombre", "Français", "Note"],
        lignes: [
          ["10",  "dix",        ""],
          ["20",  "vingt",      ""],
          ["30",  "trente",     ""],
          ["40",  "quarante",   ""],
          ["50",  "cinquante",  ""],
          ["60",  "soixante",   ""],
          ["70",  "soixante-dix", "= 60 + 10 !"],
          ["80",  "quatre-vingts", "= 4 × 20 !"],
          ["90",  "quatre-vingt-dix", "= 4 × 20 + 10 !"],
          ["100", "cent",       ""],
        ]
      },
      astuce: "Attention ! En français, 70 = soixante-dix (60+10), 80 = quatre-vingts (4×20), et 90 = quatre-vingt-dix (4×20+10). C'est différent de beaucoup d'autres langues !"
    },
    {
      titre: "Former les nombres composés",
      exemples: [
        { fr: "vingt et un (21)",     trad: "twenty-one",    note: "On dit 'et un' pour 21, 31, 41, 51, 61" },
        { fr: "vingt-deux (22)",      trad: "twenty-two",    note: "Tiret pour les autres" },
        { fr: "soixante-quinze (75)", trad: "seventy-five",  note: "60 + 15" },
        { fr: "quatre-vingt-trois (83)", trad: "eighty-three", note: "80 + 3, sans 's' au 80" },
        { fr: "quatre-vingt-douze (92)", trad: "ninety-two",  note: "80 + 12" },
      ]
    },
    {
      titre: "Utiliser les nombres au quotidien",
      exemples: [
        { fr: "J'ai vingt ans.",          trad: "I am twenty years old." },
        { fr: "Ça coûte cinq euros.",     trad: "It costs five euros." },
        { fr: "Il est trois heures.",     trad: "It is three o'clock." },
        { fr: "Mon numéro est le 06...",  trad: "My number is 06..." },
        { fr: "Nous sommes le 15 mars.",  trad: "It's March 15th." },
      ]
    }
  ],

  exercices: [
    { question: "Comment dit-on '7' en français ?",       choix: ["sept", "six", "huit", "cinq"] },
    { question: "Comment dit-on '15' en français ?",      choix: ["quinze", "quatorze", "seize", "treize"] },
    { question: "Que signifie 'trente' ?",                choix: ["30", "13", "33", "3"] },
    { question: "Comment dit-on '70' en français ?",      choix: ["soixante-dix", "septante", "soixante-douze", "soixante"] },
    { question: "Que vaut 'quatre-vingts' ?",             choix: ["80", "40", "84", "70"] },
    { question: "Comment dit-on '21' ?",                  choix: ["vingt et un", "vingt-un", "vingt et une", "vingt-deux"] },
    { question: "Combien font 60 + 19 en français ?",     choix: ["soixante-dix-neuf", "soixante-neuf", "quatre-vingt", "soixante-dix"] },
    { question: "Comment dit-on 'J'ai 12 ans' ?",         choix: ["J'ai douze ans.", "J'ai dix-deux ans.", "Je suis douze.", "J'ai doze ans."] },
    { question: "Quel nombre signifie 'quatre-vingt-dix' ?", choix: ["90", "80", "94", "9"] },
    { question: "Comment dit-on '100' en français ?",     choix: ["cent", "mille", "cinq", "dix"] },
  ],

  flashcards: [
    { recto: "1",   sous_recto: "un / une", verso: "one",        detail: "Masculin: un, Féminin: une", exemple: "J'ai un frère et une sœur." },
    { recto: "5",   sous_recto: "cinq",     verso: "five",       detail: "Le 'q' final ne se prononce pas toujours", exemple: "Cinq minutes, s'il vous plaît." },
    { recto: "10",  sous_recto: "dix",      verso: "ten",        detail: "Base du système décimal", exemple: "Il est dix heures." },
    { recto: "20",  sous_recto: "vingt",    verso: "twenty",     detail: "Le 't' ne se prononce pas", exemple: "J'ai vingt ans." },
    { recto: "70",  sous_recto: "soixante-dix", verso: "seventy", detail: "Littéralement 60 + 10 !", exemple: "Il y a soixante-dix élèves." },
    { recto: "80",  sous_recto: "quatre-vingts", verso: "eighty", detail: "Littéralement 4 × 20 !", exemple: "Grand-père a quatre-vingts ans." },
    { recto: "90",  sous_recto: "quatre-vingt-dix", verso: "ninety", detail: "Littéralement 4 × 20 + 10 !", exemple: "Il fait quatre-vingt-dix degrés !" },
    { recto: "100", sous_recto: "cent",     verso: "one hundred", detail: "Prend un 's' au pluriel: deux cents", exemple: "Ça coûte cent euros." },
    { recto: "21",  sous_recto: "vingt et un", verso: "twenty-one", detail: "'et un' pour les terminaisons en 1 (sauf 81 et 91)", exemple: "J'ai vingt et un ans." },
    { recto: "0",   sous_recto: "zéro",     vers: "zero",        detail: "Aussi utilisé dans les numéros de téléphone", exemple: "Mon numéro commence par zéro six." },
  ]
});

import { store }       from './store.js';
import { saveState }   from './state.js';
import { switchTab, renderAll } from './render.js';

// ── Tutorial data ─────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    tab: null, highlight: [],
    title: { en: 'Welcome to Iron Chronicle', cs: 'Vítejte v Iron Chronicle', pl: 'Witaj w Iron Chronicle' },
    body: {
      en: 'This fitness RPG turns your real workouts into character growth. Log your training sessions to earn XP, gold, and gear — then challenge dungeon bosses with the power you\'ve built.',
      cs: 'Toto fitness RPG mění vaše skutečné tréninky v rozvoj postavy. Zaznamenávejte tréninkové sezony, získávejte zkušenosti, zlato a vybavení — a pak vyzývejte bossy dungeonů se silou, kterou jste vybudovali.',
      pl: 'Ta gra RPG fitness zamienia twoje prawdziwe treningi w rozwój postaci. Loguj sesje treningowe, zdobywaj doświadczenie, złoto i ekwipunek — a potem rzucaj wyzwanie bossom lochów siłą, którą zbudowałeś.',
    },
  },
  {
    tab: 'main',
    highlight: [
      { id: 'charName', color: '#e8b84b' }, { id: 'levelBadge', color: '#7aadff' },
      { id: 'xpRow', color: '#5ec8d8' }, { id: 'staminaRow', color: '#4a9b4a' },
      { id: 'statChips', color: '#e07840' }, { id: 'goldCurrency', color: '#e8b84b' },
      { id: 'streakCurrency', color: '#e07840' }, { id: 'sessionsCurrency', color: '#4acbb0' },
      { id: 'weeklyQuestPanel', color: '#b06ad4' }, { id: 'bodyWeightRow', color: '#90b8c8' },
    ],
    title: { en: 'Home — Your Character Hub', cs: 'Domov — Centrum vaší postavy', pl: 'Dom — Centrum twojej postaci' },
    body: {
      en: 'Here you see your character\'s <span class="tp" style="color:#e8b84b">Name</span>, <span class="tp" style="color:#7aadff">Level</span>, <span class="tp" style="color:#5ec8d8">XP bar</span>, and <span class="tp" style="color:#4a9b4a">Stamina</span>. Your <span class="tp" style="color:#e8b84b">Gold</span>, <span class="tp" style="color:#e07840">Streak</span>, and total <span class="tp" style="color:#4acbb0">Sessions</span> sit in the currency row. The <span class="tp" style="color:#e07840">Strength / Dexterity / Vitality</span> chips grow as you train. Complete the <span class="tp" style="color:#b06ad4">Weekly Quest</span> for bonus rewards, and set your <span class="tp" style="color:#90b8c8">Body Weight</span> to calibrate XP gains.',
      cs: 'Zde vidíte <span class="tp" style="color:#e8b84b">Jméno</span>, <span class="tp" style="color:#7aadff">Úroveň</span>, lištu <span class="tp" style="color:#5ec8d8">Zkušeností</span> a <span class="tp" style="color:#4a9b4a">Výdrž</span>. Řada měny zobrazuje <span class="tp" style="color:#e8b84b">Zlato</span>, <span class="tp" style="color:#e07840">Sérii</span> a celkový počet <span class="tp" style="color:#4acbb0">Sezón</span>. Hodnoty <span class="tp" style="color:#e07840">Síly / Obratnosti / Výdrže</span> rostou s tréninkem. Dokončete <span class="tp" style="color:#b06ad4">Týdenní úkol</span> pro bonusy a nastavte <span class="tp" style="color:#90b8c8">Tělesnou hmotnost</span> pro kalibraci zisku zkušeností.',
      pl: 'Tutaj widzisz <span class="tp" style="color:#e8b84b">Imię</span>, <span class="tp" style="color:#7aadff">Poziom</span>, pasek <span class="tp" style="color:#5ec8d8">Doświadczenia</span> i <span class="tp" style="color:#4a9b4a">Wytrzymałość</span>. Rząd waluty pokazuje <span class="tp" style="color:#e8b84b">Złoto</span>, <span class="tp" style="color:#e07840">Serię</span> i łączną liczbę <span class="tp" style="color:#4acbb0">Sesji</span>. Wartości <span class="tp" style="color:#e07840">Siły / Zręczności / Wytrzymałości</span> rosną z treningiem. Wykonaj <span class="tp" style="color:#b06ad4">Tygodniowe Zadanie</span> po bonusy i ustaw <span class="tp" style="color:#90b8c8">Masę ciała</span>, aby skalibrować zdobywanie XP.',
    },
  },
  {
    tab: 'train',
    highlight: [
      { id: 'exerciseList', color: '#e07840' },
      { id: 'btnAddExercise', color: '#4acbb0' },
      { id: 'btnLogWorkout', color: '#e8b84b' },
    ],
    title: { en: 'Train — Log Your Workouts', cs: 'Trénink — Zaznamenejte své cvičení', pl: 'Trening — Loguj swoje ćwiczenia' },
    body: {
      en: 'Use <span class="tp" style="color:#4acbb0">+ Add Exercise</span> to build your session. Each <span class="tp" style="color:#e07840">exercise entry</span> has a Name selector, Weight, Reps, and Sets fields plus a Preview of what you earn. When done, hit <span class="tp" style="color:#e8b84b">Complete Session</span> to bank your XP, gold, stats and stamina.',
      cs: 'Pomocí <span class="tp" style="color:#4acbb0">+ Přidat cvičení</span> sestavte trénink. Každý <span class="tp" style="color:#e07840">záznam cvičení</span> má výběr Názvu, pole Váhy, Opakování a Sérií a Náhled toho, co získáte. Po dokončení klepněte na <span class="tp" style="color:#e8b84b">Complete Session</span> pro získání zkušeností, zlata, statistik a výdrže.',
      pl: 'Użyj <span class="tp" style="color:#4acbb0">+ Dodaj ćwiczenie</span>, aby zbudować sesję. Każdy <span class="tp" style="color:#e07840">wpis ćwiczenia</span> ma selektor Nazwy, pola Ciężaru, Powtórzeń i Serii oraz Podgląd tego, co zdobędziesz. Po zakończeniu naciśnij <span class="tp" style="color:#e8b84b">Complete Session</span>, aby zainkasować XP, złoto, statystyki i wytrzymałość.',
    },
  },
  {
    tab: 'stats',
    highlight: [
      { id: 'statsPanel', color: '#c05050' }, { id: 'baseStatsPanel', color: '#e07840' },
      { id: 'gearStatsPanel', color: '#7aadff' }, { id: 'abilitiesPanel', color: '#b06ad4' },
    ],
    title: { en: 'Stats — Your Combat Power', cs: 'Statistiky — Vaše bojová síla', pl: 'Statystyki — Twoja siła bojowa' },
    body: {
      en: '<span class="tp" style="color:#c05050">Combat Stats</span> show your Max HP, Damage range, Crit chance, and Damage reduction. <span class="tp" style="color:#e07840">Base Stats</span> (Strength, Dexterity, Vitality) grow automatically from workouts. <span class="tp" style="color:#7aadff">Gear Contribution</span> shows bonuses from equipped items. <span class="tp" style="color:#b06ad4">Abilities</span> are unlocked as you level up.',
      cs: '<span class="tp" style="color:#c05050">Bojové statistiky</span> zobrazují Max HP, rozsah Poškození, šanci na Kritický úder a Redukci poškození. <span class="tp" style="color:#e07840">Základní statistiky</span> (Síla, Obratnost, Výdrž) rostou automaticky z tréninků. <span class="tp" style="color:#7aadff">Příspěvek vybavení</span> ukazuje bonusy z vybaveného zboží. <span class="tp" style="color:#b06ad4">Schopnosti</span> se odemykají s každou úrovní.',
      pl: '<span class="tp" style="color:#c05050">Statystyki bojowe</span> pokazują Maksymalne HP, zakres Obrażeń, szansę na Trafienie krytyczne i Redukcję obrażeń. <span class="tp" style="color:#e07840">Statystyki bazowe</span> (Siła, Zręczność, Wytrzymałość) rosną automatycznie z treningów. <span class="tp" style="color:#7aadff">Wkład ekwipunku</span> pokazuje premie z założonych przedmiotów. <span class="tp" style="color:#b06ad4">Zdolności</span> są odblokowywane wraz z awansem na poziom.',
    },
  },
  {
    tab: 'dungeons',
    highlight: [
      { id: 'dungeonStaminaReadout', color: '#4a9b4a' },
      { id: 'dungeonList', color: '#e07840' },
    ],
    title: { en: 'Dungeons — Challenge the Bosses', cs: 'Dungeony — Vyzývejte bossy', pl: 'Lochy — Rzucaj wyzwanie bossom' },
    body: {
      en: 'The <span class="tp" style="color:#4a9b4a">Stamina readout</span> shows your current stamina and the entry cost. The <span class="tp" style="color:#e07840">Dungeon List</span> shows all available bosses — each with a difficulty, gold reward, and loot chance. Stamina is replenished by completing workout sessions.',
      cs: 'Ukazatel <span class="tp" style="color:#4a9b4a">Výdrže</span> zobrazuje vaši aktuální výdrž a náklady na vstup. <span class="tp" style="color:#e07840">Seznam dungeonů</span> zobrazuje všechny dostupné bossy — každý má obtížnost, odměnu v zlatě a šanci na kořist. Výdrž se doplňuje dokončením tréninkových sezón.',
      pl: 'Wskaźnik <span class="tp" style="color:#4a9b4a">Wytrzymałości</span> pokazuje aktualną wytrzymałość i koszt wejścia. <span class="tp" style="color:#e07840">Lista Lochów</span> pokazuje wszystkich dostępnych bossów — każdy z poziomem trudności, nagrodą w złocie i szansą na łupy. Wytrzymałość uzupełnia się po zakończeniu sesji treningowych.',
    },
  },
  {
    tab: 'gear',
    highlight: [
      { id: 'equipGrid', color: '#7aadff' },
      { id: 'inventoryList', color: '#b06ad4' },
    ],
    title: { en: 'Gear — Equip & Improve', cs: 'Vybavení — Vybavte se a zlepšujte se', pl: 'Ekwipunek — Wyposażaj się i ulepszaj' },
    body: {
      en: 'The <span class="tp" style="color:#7aadff">Equipped grid</span> shows all gear slots — weapon, offhand, helmet, chest, gloves, belt, boots, amulet, and rings. Your <span class="tp" style="color:#b06ad4">Inventory</span> lists everything you\'ve found. Click an item to equip it. Items with a gold border are Rare and grant bigger stat bonuses.',
      cs: 'Mřížka <span class="tp" style="color:#7aadff">Vybavení</span> zobrazuje všechny sloty — zbraň, štít, helmu, pancíř, rukavice, opasek, boty, amulet a prsteny. <span class="tp" style="color:#b06ad4">Inventář</span> obsahuje vše, co jste nalezli. Kliknutím na předmět ho vybavte. Předměty se zlatým okrajem jsou Vzácné a udělují větší bonusy.',
      pl: 'Siatka <span class="tp" style="color:#7aadff">Ekwipunku</span> pokazuje wszystkie sloty — broń, tarczę, hełm, zbroję, rękawice, pas, buty, amulet i pierścienie. <span class="tp" style="color:#b06ad4">Inwentarz</span> zawiera wszystko, co znalazłeś. Kliknij przedmiot, aby go założyć. Przedmioty ze złotą obwódką są Rzadkie i przyznają większe premie.',
    },
  },
  {
    tab: 'shop',
    highlight: [
      { id: 'shopList', color: '#e07840' },
      { id: 'shopGoldDisplay', color: '#e8b84b' },
      { id: 'shopEquipGrid', color: '#7aadff' },
    ],
    title: { en: 'Shop — Spend Your Gold', cs: 'Obchod — Utratit zlato', pl: 'Sklep — Wydaj swoje złoto' },
    body: {
      en: 'The <span class="tp" style="color:#e07840">Shop List</span> shows items available for purchase. Your current <span class="tp" style="color:#e8b84b">Gold</span> is displayed top-right. The <span class="tp" style="color:#7aadff">Currently Equipped</span> panel lets you compare before buying. Higher-tier items cost more but are significantly stronger. Stock refreshes every week.',
      cs: '<span class="tp" style="color:#e07840">Seznam Obchodu</span> zobrazuje předměty k prodeji. Vaše aktuální <span class="tp" style="color:#e8b84b">Zlato</span> je zobrazeno vpravo nahoře. Panel <span class="tp" style="color:#7aadff">Aktuálně vybaveného</span> umožňuje porovnat před nákupem. Předměty vyšší úrovně jsou dražší, ale výrazně silnější. Zásoby se obnovují každý týden.',
      pl: '<span class="tp" style="color:#e07840">Lista Sklepu</span> pokazuje przedmioty dostępne do zakupu. Twoje aktualne <span class="tp" style="color:#e8b84b">Złoto</span> wyświetlane jest w prawym górnym rogu. Panel <span class="tp" style="color:#7aadff">Aktualnego ekwipunku</span> pozwala porównać przed zakupem. Przedmioty wyższego poziomu kosztują więcej, ale są znacznie silniejsze. Asortyment odświeża się co tydzień.',
    },
  },
  {
    tab: 'history',
    highlight: [{ id: 'historyPanel', color: '#4acbb0' }],
    title: { en: 'Log — Your Chronicle', cs: 'Záznamy — Vaše kronika', pl: 'Dziennik — Twoja kronika' },
    body: {
      en: 'Every completed workout session is recorded here as a <span class="tp" style="color:#4acbb0">Chronicle</span> entry — a narrative log of your effort. Review your history and let the Log remind you how far you\'ve come.',
      cs: 'Každá dokončená tréninková sezóna je zde zaznamenána jako záznam <span class="tp" style="color:#4acbb0">Kroniky</span> — vyprávěcí záznam vašeho úsilí. Prohlédněte si historii a nechte záznamy připomínat, jak daleko jste se dostali.',
      pl: 'Każda ukończona sesja treningowa jest tutaj zapisana jako wpis <span class="tp" style="color:#4acbb0">Kroniki</span> — narracyjny zapis twojego wysiłku. Przeglądaj historię i pozwól Dziennikowi przypominać, jak daleko zaszedłeś.',
    },
  },
  {
    tab: 'train',
    highlight: [
      { id: 'btnAddExercise', color: '#4acbb0' },
      { id: 'btnLogWorkout', color: '#e8b84b' },
    ],
    title: { en: 'Ready, Warrior!', cs: 'Připraveni, válečníku!', pl: 'Gotowy, wojowniku!' },
    body: {
      en: 'You now know the basics of Iron Chronicle. Click <span class="tp" style="color:#4acbb0">+ Add Exercise</span> and hit <span class="tp" style="color:#e8b84b">Complete Session</span> to begin your legend. The iron awaits!',
      cs: 'Nyní znáte základy Iron Chronicle. Klepněte na <span class="tp" style="color:#4acbb0">+ Přidat cvičení</span> a na <span class="tp" style="color:#e8b84b">Complete Session</span>, abyste zahájili svou legendu. Železo čeká!',
      pl: 'Znasz już podstawy Iron Chronicle. Kliknij <span class="tp" style="color:#4acbb0">+ Dodaj ćwiczenie</span> i naciśnij <span class="tp" style="color:#e8b84b">Complete Session</span>, aby rozpocząć swoją legendę. Żelazo czeka!',
    },
  },
];

const TUT_SKIP   = { en: 'Skip Tutorial',  cs: 'Přeskočit průvodce',  pl: 'Pomiń samouczek' };
const TUT_NEXT   = { en: 'Next →',         cs: 'Další →',             pl: 'Dalej →' };
const TUT_FINISH = { en: 'Begin!',         cs: 'Začít!',              pl: 'Zaczynamy!' };
const TUT_STEP_OF = { en: 'Step',          cs: 'Krok',                pl: 'Krok' };

let tutorialCurrentStep = 0;

// ── Public API ────────────────────────────────────────────────
export function startTutorial() {
  document.body.classList.add('tutorial-active');
  document.getElementById('tutorialLangSelect').classList.add('show');
}

export function pickTutorialLang(lang) {
  store.state.tutorialLang = lang;
  saveState();
  renderAll();
  document.getElementById('tutorialLangSelect').classList.remove('show');
  tutorialCurrentStep = 0;
  document.getElementById('tutorialOverlay').classList.add('show');
  document.getElementById('tutorialBox').classList.add('show');
  showTutorialStep(0);
}

export function nextTutorialStep() {
  tutorialCurrentStep++;
  if (tutorialCurrentStep >= TUTORIAL_STEPS.length) endTutorial();
  else showTutorialStep(tutorialCurrentStep);
}

export function skipTutorial() {
  endTutorial();
}

export function endTutorial() {
  clearTutorialHighlights();
  document.getElementById('tutorialOverlay').classList.remove('show');
  document.getElementById('tutorialBox').classList.remove('show');
  document.getElementById('tutorialLangSelect').classList.remove('show');
  document.body.classList.remove('tutorial-active');
  store.state.tutorialDone = true;
  saveState();
  switchTab('main');
}

// ── Internal ──────────────────────────────────────────────────
function clearTutorialHighlights() {
  document.querySelectorAll('.tab.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
  document.querySelectorAll('.tut-hl').forEach(el => {
    el.classList.remove('tut-hl');
    el.style.outlineColor = '';
    el.style.boxShadow    = '';
  });
}

function showTutorialStep(i) {
  const lang  = store.state.tutorialLang || 'en';
  const step  = TUTORIAL_STEPS[i];
  const total = TUTORIAL_STEPS.length;
  const isLast = i === total - 1;

  document.getElementById('tutStepLabel').textContent = TUT_STEP_OF[lang] + ' ' + (i + 1) + ' / ' + total;
  document.getElementById('tutTitle').textContent     = step.title[lang];
  document.getElementById('tutBody').innerHTML        = step.body[lang];
  document.getElementById('tutNextBtn').textContent   = isLast ? TUT_FINISH[lang] : TUT_NEXT[lang];
  document.getElementById('tutSkipBtn').textContent   = TUT_SKIP[lang];

  clearTutorialHighlights();
  if (step.tab) {
    switchTab(step.tab);
    const tabBtn = document.querySelector(`.tab[data-tab="${step.tab}"]`);
    if (tabBtn) tabBtn.classList.add('tutorial-highlight');
  }
  (step.highlight || []).forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    el.classList.add('tut-hl');
    el.style.outlineColor = item.color;
    el.style.boxShadow    = '0 0 14px ' + item.color + '70';
  });
}

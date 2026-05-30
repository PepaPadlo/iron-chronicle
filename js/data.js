export const GAME_VERSION = 'v0.33 · 2026-05-30';
export const STORAGE_KEY  = 'ironChronicle_v1';

export const LEVELS = [
  { level:1,  xpNeeded:165,   title:'Untested Wanderer' },
  { level:2,  xpNeeded:385,   title:'Initiate of Iron' },
  { level:3,  xpNeeded:660,   title:'Footsoldier' },
  { level:4,  xpNeeded:990,   title:'Seasoned Fighter' },
  { level:5,  xpNeeded:1430,  title:'Iron-Willed Warrior' },
  { level:6,  xpNeeded:1980,  title:'Veteran of the Forge' },
  { level:7,  xpNeeded:2640,  title:'Champion of Endurance' },
  { level:8,  xpNeeded:3410,  title:'Warlord of Will' },
  { level:9,  xpNeeded:4290,  title:'Ironborn Legend' },
  { level:10, xpNeeded:5830,  title:'The Unbroken' },
  { level:11, xpNeeded:8030,  title:'Blood-Tested Warrior' },
  { level:12, xpNeeded:10890, title:'Forgeborn Destroyer' },
  { level:13, xpNeeded:14410, title:'Champion of the Iron Path' },
  { level:14, xpNeeded:18590, title:'Warden of the Deep Forge' },
  { level:15, xpNeeded:23430, title:'Titan of the Endless Trial' },
  { level:16, xpNeeded:28930, title:'The Iron-Blooded' },
  { level:17, xpNeeded:35090, title:'Harbinger of Ruin' },
  { level:18, xpNeeded:41910, title:'Colossus of Will' },
  { level:19, xpNeeded:49390, title:'The Undying Flame' },
  { level:20, xpNeeded:999999,title:'The Iron Eternal' },
];

export const ABILITIES = [
  { id:'basic',    name:'Basic Attack',   cost:0,  unlockLvl:1,  desc:'A standard strike.',                           effect:'basic' },
  { id:'power',    name:'Power Strike',   cost:15, unlockLvl:2,  desc:'200% damage on this hit.',                     effect:'power' },
  { id:'iron',     name:'Iron Skin',      cost:20, unlockLvl:4,  desc:'Reduce incoming damage by 50% for 3 turns.',   effect:'iron' },
  { id:'cry',      name:'Battle Cry',     cost:25, unlockLvl:6,  desc:'+50% damage, stacks with others, 3 turns.',    effect:'cry' },
  { id:'reckless', name:'Reckless Blow',  cost:30, unlockLvl:8,  desc:'300% damage, take 20 recoil.',                 effect:'reckless' },
  { id:'unbroken', name:'Unbroken',       cost:40, unlockLvl:10, desc:'Survive one lethal hit at 1 HP.',              effect:'unbroken' },
];

export const SLOTS = [
  { id:'weapon',  name:'Weapon',   stats:['STR','DEX'] },
  { id:'helmet',  name:'Helmet',   stats:['VIT'] },
  { id:'chest',   name:'Chest',    stats:['VIT','STR'] },
  { id:'gloves',  name:'Gloves',   stats:['DEX','STR'] },
  { id:'belt',    name:'Belt',     stats:['VIT'] },
  { id:'boots',   name:'Boots',    stats:['DEX'] },
  { id:'amulet',  name:'Amulet',   stats:['STR','DEX','VIT'] },
  { id:'ring1',   name:'Ring',     stats:['STR','DEX','VIT'] },
  { id:'offhand', name:'Offhand',  stats:['STR','VIT'] },
];

export const ARMOR_SLOTS = ['helmet','chest','gloves','belt','boots'];

export const TIERS = [
  { tier:1,  name:'Rough Iron',     levelReq:1,  minBonus:0,  maxBonus:1,  uncommonMin:2,  uncommonMax:3,  rareMin:4,  rareMax:5,  epicMin:6,  epicMax:7,  shopPrice:80,   sellPrice:15  },
  { tier:2,  name:'Hardened Steel', levelReq:3,  minBonus:2,  maxBonus:3,  uncommonMin:4,  uncommonMax:5,  rareMin:6,  rareMax:7,  epicMin:8,  epicMax:9,  shopPrice:180,  sellPrice:30  },
  { tier:3,  name:'Shadowforged',   levelReq:5,  minBonus:4,  maxBonus:5,  uncommonMin:7,  uncommonMax:8,  rareMin:9,  rareMax:10, epicMin:11, epicMax:13, shopPrice:350,  sellPrice:45  },
  { tier:4,  name:'Dragonbone',     levelReq:7,  minBonus:6,  maxBonus:7,  uncommonMin:10, uncommonMax:11, rareMin:12, rareMax:13, epicMin:14, epicMax:18, shopPrice:600,  sellPrice:60  },
  { tier:5,  name:'Legendary',      levelReq:9,  minBonus:8,  maxBonus:9,  uncommonMin:13, uncommonMax:14, rareMin:15, rareMax:17, epicMin:19, epicMax:23, shopPrice:950,  sellPrice:75  },
  { tier:6,  name:'Bloodforged',    levelReq:11, minBonus:10, maxBonus:11, uncommonMin:15, uncommonMax:17, rareMin:18, rareMax:21, epicMin:24, epicMax:28, shopPrice:1400, sellPrice:100 },
  { tier:7,  name:'Voidsteel',      levelReq:13, minBonus:12, maxBonus:13, uncommonMin:18, uncommonMax:20, rareMin:22, rareMax:25, epicMin:29, epicMax:33, shopPrice:2000, sellPrice:135 },
  { tier:8,  name:'Soulbound',      levelReq:15, minBonus:14, maxBonus:16, uncommonMin:22, uncommonMax:24, rareMin:26, rareMax:30, epicMin:34, epicMax:40, shopPrice:2800, sellPrice:175 },
  { tier:9,  name:'Abyssal',        levelReq:17, minBonus:17, maxBonus:20, uncommonMin:28, uncommonMax:30, rareMin:31, rareMax:38, epicMin:41, epicMax:50, shopPrice:3800, sellPrice:225 },
  { tier:10, name:'Eternal Forge',  levelReq:19, minBonus:21, maxBonus:25, uncommonMin:35, uncommonMax:38, rareMin:39, rareMax:48, epicMin:51, epicMax:63, shopPrice:5000, sellPrice:285 },
];

export const RARE_MULT        = 1.2;
export const RARE_SELL_MULT   = 2;                            // legacy rare items only
export const RARITY_SELL_MULT = { common:1, uncommon:2, rare:3, epic:5 };

export const ITEM_NAMES = {
  weapon:  ['Blade','Axe','Hammer','Maul','Cleaver','Saber','Club','Spear','Mace'],
  helmet:  ['Helm','Crown','Hood','Coif','Circlet','Visor'],
  chest:   ['Chestplate','Cuirass','Hauberk','Breastplate','Vest','Armor'],
  gloves:  ['Gauntlets','Grips','Handwraps','Bracers','Gloves'],
  belt:    ['Belt','Girdle','Sash','Waistguard','Cinch'],
  boots:   ['Boots','Greaves','Treads','Stompers','Sabatons'],
  amulet:  ['Amulet','Talisman','Pendant','Charm','Relic'],
  ring1:   ['Ring','Band','Signet','Loop','Circle'],
  offhand: ['Shield','Bulwark','Aegis','Buckler','Tome','Focus','Book','Grimoire'],
};

// Weapon sprite sheets: weapons1.png + weapons2.png — each 6×6
const W1 = 'images/items/weapons1.png';
const W2 = 'images/items/weapons2.png';
export { W1, W2 };

export const WEAPON_SPRITES = [
  {img:W1,col:0,row:0,cat:'sword'},{img:W1,col:1,row:0,cat:'club'}, {img:W1,col:2,row:0,cat:'sword'},
  {img:W1,col:3,row:0,cat:'axe'}, {img:W1,col:4,row:0,cat:'sword'},{img:W1,col:5,row:0,cat:'spear'},
  {img:W1,col:0,row:1,cat:'sword'},{img:W1,col:1,row:1,cat:'axe'}, {img:W1,col:2,row:1,cat:'axe'},
  {img:W1,col:3,row:1,cat:'sword'},{img:W1,col:4,row:1,cat:'sword'},{img:W1,col:5,row:1,cat:'mace'},
  {img:W1,col:0,row:2,cat:'sword'},{img:W1,col:1,row:2,cat:'mace'},{img:W1,col:2,row:2,cat:'sword'},
  {img:W1,col:3,row:2,cat:'spear'},{img:W1,col:4,row:2,cat:'spear'},{img:W1,col:5,row:2,cat:'axe'},
  {img:W1,col:0,row:3,cat:'sword'},{img:W1,col:1,row:3,cat:'mace'},{img:W1,col:2,row:3,cat:'sword'},
  {img:W1,col:3,row:3,cat:'sword'},{img:W1,col:4,row:3,cat:'sword'},{img:W1,col:5,row:3,cat:'axe'},
  {img:W1,col:0,row:4,cat:'sword'},{img:W1,col:1,row:4,cat:'axe'},{img:W1,col:2,row:4,cat:'spear'},
  {img:W1,col:3,row:4,cat:'sword'},{img:W1,col:4,row:4,cat:'sword'},{img:W1,col:5,row:4,cat:'hammer'},
  {img:W1,col:0,row:5,cat:'sword'},{img:W1,col:1,row:5,cat:'sword'},{img:W1,col:2,row:5,cat:'sword'},
  {img:W1,col:3,row:5,cat:'sword'},{img:W1,col:4,row:5,cat:'sword'},{img:W1,col:5,row:5,cat:'mace'},
  {img:W2,col:0,row:0,cat:'sword'},{img:W2,col:1,row:0,cat:'club'},{img:W2,col:2,row:0,cat:'sword'},
  {img:W2,col:3,row:0,cat:'axe'}, {img:W2,col:4,row:0,cat:'sword'},{img:W2,col:5,row:0,cat:'spear'},
  {img:W2,col:0,row:1,cat:'sword'},{img:W2,col:1,row:1,cat:'axe'},{img:W2,col:2,row:1,cat:'axe'},
  {img:W2,col:3,row:1,cat:'sword'},{img:W2,col:4,row:1,cat:'sword'},{img:W2,col:5,row:1,cat:'mace'},
  {img:W2,col:0,row:2,cat:'sword'},{img:W2,col:1,row:2,cat:'sword'},{img:W2,col:2,row:2,cat:'hammer'},
  {img:W2,col:3,row:2,cat:'spear'},{img:W2,col:4,row:2,cat:'spear'},{img:W2,col:5,row:2,cat:'mace'},
  {img:W2,col:0,row:3,cat:'sword'},{img:W2,col:1,row:3,cat:'sword'},{img:W2,col:2,row:3,cat:'hammer'},
  {img:W2,col:3,row:3,cat:'axe'}, {img:W2,col:4,row:3,cat:'sword'},{img:W2,col:5,row:3,cat:'sword'},
  {img:W2,col:0,row:4,cat:'sword'},{img:W2,col:1,row:4,cat:'axe'},{img:W2,col:2,row:4,cat:'axe'},
  {img:W2,col:3,row:4,cat:'axe'}, {img:W2,col:4,row:4,cat:'sword'},{img:W2,col:5,row:4,cat:'sword'},
  {img:W2,col:0,row:5,cat:'hammer'},{img:W2,col:1,row:5,cat:'sword'},{img:W2,col:2,row:5,cat:'sword'},
  {img:W2,col:3,row:5,cat:'spear'},{img:W2,col:4,row:5,cat:'axe'},{img:W2,col:5,row:5,cat:'hammer'},
];

export const WEAPON_CAT_MAP = {
  'Blade':'sword','Saber':'sword','Cleaver':'axe','Axe':'axe',
  'Hammer':'hammer','Maul':'hammer','Club':'club','Spear':'spear','Mace':'mace',
};

// Offhand sprite sheet: images/items/offhands.png — 6×6
export const OFFHAND_SPRITES = [
  {col:0,row:0,cat:'shield'},{col:1,row:0,cat:'shield'},{col:2,row:0,cat:'shield'},
  {col:3,row:0,cat:'shield'},{col:4,row:0,cat:'tome'}, {col:5,row:0,cat:'shield'},
  {col:0,row:1,cat:'shield'},{col:1,row:1,cat:'shield'},{col:2,row:1,cat:'shield'},
  {col:3,row:1,cat:'shield'},{col:4,row:1,cat:'shield'},{col:5,row:1,cat:'tome'},
  {col:0,row:2,cat:'shield'},{col:1,row:2,cat:'shield'},{col:2,row:2,cat:'shield'},
  {col:3,row:2,cat:'shield'},{col:4,row:2,cat:'tome'}, {col:5,row:2,cat:'tome'},
  {col:0,row:3,cat:'shield'},{col:1,row:3,cat:'shield'},{col:2,row:3,cat:'shield'},
  {col:3,row:3,cat:'shield'},{col:4,row:3,cat:'shield'},{col:5,row:3,cat:'tome'},
  {col:0,row:4,cat:'shield'},{col:1,row:4,cat:'shield'},{col:2,row:4,cat:'shield'},
  {col:3,row:4,cat:'tome'}, {col:4,row:4,cat:'shield'},{col:5,row:4,cat:'shield'},
  {col:0,row:5,cat:'shield'},{col:1,row:5,cat:'tome'}, {col:2,row:5,cat:'shield'},
  {col:3,row:5,cat:'shield'},{col:4,row:5,cat:'shield'},{col:5,row:5,cat:'shield'},
];

export const OFFHAND_CAT_MAP = {
  'Shield':'shield','Bulwark':'shield','Aegis':'shield','Buckler':'shield',
  'Tome':'tome','Focus':'tome','Book':'tome','Grimoire':'tome',
};

// Jewelry sprite sheet: images/items/jewelery.png — 6×6
export const JEWELRY_SPRITES = [
  {col:0,row:0,cat:'ring'},  {col:1,row:0,cat:'amulet'},{col:2,row:0,cat:'ring'},
  {col:3,row:0,cat:'amulet'},{col:4,row:0,cat:'ring'},  {col:5,row:0,cat:'amulet'},
  {col:0,row:1,cat:'ring'},  {col:1,row:1,cat:'amulet'},{col:2,row:1,cat:'amulet'},
  {col:3,row:1,cat:'amulet'},{col:4,row:1,cat:'ring'},  {col:5,row:1,cat:'ring'},
  {col:0,row:2,cat:'amulet'},{col:1,row:2,cat:'ring'},  {col:2,row:2,cat:'ring'},
  {col:3,row:2,cat:'ring'},  {col:4,row:2,cat:'ring'},  {col:5,row:2,cat:'ring'},
  {col:0,row:3,cat:'ring'},  {col:1,row:3,cat:'ring'},  {col:2,row:3,cat:'amulet'},
  {col:3,row:3,cat:'ring'},  {col:4,row:3,cat:'ring'},  {col:5,row:3,cat:'ring'},
  {col:0,row:4,cat:'ring'},  {col:1,row:4,cat:'amulet'},{col:2,row:4,cat:'amulet'},
  {col:3,row:4,cat:'amulet'},{col:4,row:4,cat:'ring'},  {col:5,row:4,cat:'amulet'},
  {col:0,row:5,cat:'amulet'},{col:1,row:5,cat:'ring'},  {col:2,row:5,cat:'ring'},
  {col:3,row:5,cat:'ring'},  {col:4,row:5,cat:'amulet'},{col:5,row:5,cat:'amulet'},
];

// Armor sprite sheets — quality increases with row
export const SLOT_SPRITE_CONFIG = {
  chest:  { img:'images/items/armor.png',   cols:7, rows:7 },
  helmet: { img:'images/items/helmets.png', cols:8, rows:8 },
  gloves: { img:'images/items/gloves.png',  cols:8, rows:8 },
  belt:   { img:'images/items/belts.png',   cols:6, rows:6 },
  boots:  { img:'images/items/boots.png',   cols:8, rows:7 },
};

export const NARRATIVES = [
  'The iron does not lie. You faced the weight and did not flinch.',
  'Another session etched into your bones. You are becoming harder than yesterday.',
  'The forge demands heat. You provided it.',
  'Sweat on the floor, fire in the lungs. The easy path was there — you chose the other.',
  'Fatigue is the proof of effort. You carry it home like a trophy no one else can see.',
  'There are those who speak of strength. You build it quietly.',
  'The weights were indifferent to your struggle. You moved them anyway.',
  'Not every battle is glorious. Some are just you and a barbell, grinding.',
  'Your ancestors carried boulders across open land. Today you honored that inheritance.',
  'Pain is temporary. The adaptation it triggers is permanent.',
  'The body is clay. Time is the kiln. Each session is fire.',
  'Somewhere a younger version of you is watching. You did not quit today.',
  'The bar moves up, or it moves down. Today it moved up.',
  'Small sessions compound into transformed lives.',
  'No one is coming to do this for you. That is not the tragedy — that is the gift.',
];

export const WEEKLY_BOSSES = [
  'the Ironhide Boar','the Stone Sentinel','the Frost Colossus','the Ancient Crusher',
  'the Shadow Titan','the Hollow Knight','the Ashen Goliath','the Tide Crusher',
  'the Bone Warden','the Pale Siege',
];

export const DUNGEON_BOSSES = [
  'The Hollow Rat King','Stoneback Troll','Ironjaw Wolf','The Fungal Colossus',
  'Ashbone Warlord','The Blind Sentinel','Veincracker Ogre','The Tide Horror',
  'Duskmane Lion','The Shattered Knight','Scalehide Behemoth','The Pale Executioner',
  'Thornwall Giant','Abyssal Lurker','The Iron Revenant','Cinderborn Drake',
  'The Void Shepherd','Colossus of Salt','The Unmade','The Eternal Forge Guardian',
];

// India merchant lookup database — maps UPI IDs and merchant names to categories

export interface MerchantData {
  merchant: string;
  category: string;
  subcategory: string;
  emoji: string;
  is_recurring?: boolean;
}

const MERCHANT_MAP: Record<string, MerchantData> = {
  // Food Delivery
  swiggy:     { merchant: "Swiggy",   category: "Food Delivery", subcategory: "Delivery App", emoji: "🛵" },
  zomato:     { merchant: "Zomato",   category: "Food Delivery", subcategory: "Delivery App", emoji: "🍕" },
  dunzo:      { merchant: "Dunzo",    category: "Quick Commerce", subcategory: "Delivery", emoji: "📦" },
  blinkit:    { merchant: "Blinkit",  category: "Quick Commerce", subcategory: "Grocery Delivery", emoji: "⚡" },
  zepto:      { merchant: "Zepto",    category: "Quick Commerce", subcategory: "Grocery Delivery", emoji: "🟡" },
  instamart:  { merchant: "Instamart", category: "Quick Commerce", subcategory: "Grocery Delivery", emoji: "🏪" },
  magicpin:   { merchant: "Magicpin", category: "Food & Dining", subcategory: "Restaurant", emoji: "🍽️" },

  // Transport
  uber:       { merchant: "Uber",     category: "Transport", subcategory: "Cab", emoji: "🚗" },
  ola:        { merchant: "Ola",      category: "Transport", subcategory: "Cab", emoji: "🟢" },
  rapido:     { merchant: "Rapido",   category: "Transport", subcategory: "Bike Taxi", emoji: "🏍️" },
  namma:      { merchant: "Namma Yatri", category: "Transport", subcategory: "Auto", emoji: "🛺" },
  metro:      { merchant: "Metro",    category: "Transport", subcategory: "Public Transport", emoji: "🚇" },
  irctc:      { merchant: "IRCTC",    category: "Travel", subcategory: "Train", emoji: "🚂" },
  indigo:     { merchant: "IndiGo",   category: "Travel", subcategory: "Flight", emoji: "✈️" },
  spicejet:   { merchant: "SpiceJet", category: "Travel", subcategory: "Flight", emoji: "✈️" },
  airindia:   { merchant: "Air India", category: "Travel", subcategory: "Flight", emoji: "✈️" },

  // OTT / Entertainment
  netflix:    { merchant: "Netflix",          category: "Entertainment", subcategory: "OTT", emoji: "🎬", is_recurring: true },
  hotstar:    { merchant: "Disney+ Hotstar",  category: "Entertainment", subcategory: "OTT", emoji: "⭐", is_recurring: true },
  primevideo: { merchant: "Amazon Prime",     category: "Entertainment", subcategory: "OTT", emoji: "📺", is_recurring: true },
  prime:      { merchant: "Amazon Prime",     category: "Entertainment", subcategory: "OTT", emoji: "📺", is_recurring: true },
  spotify:    { merchant: "Spotify",          category: "Entertainment", subcategory: "Music", emoji: "🎵", is_recurring: true },
  youtube:    { merchant: "YouTube Premium",  category: "Entertainment", subcategory: "OTT", emoji: "▶️", is_recurring: true },
  jiocinema:  { merchant: "JioCinema",        category: "Entertainment", subcategory: "OTT", emoji: "🎭", is_recurring: true },
  sonyliv:    { merchant: "SonyLIV",          category: "Entertainment", subcategory: "OTT", emoji: "📡", is_recurring: true },
  zee5:       { merchant: "Zee5",             category: "Entertainment", subcategory: "OTT", emoji: "🔵", is_recurring: true },
  mxplayer:   { merchant: "MX Player",        category: "Entertainment", subcategory: "OTT", emoji: "▶️", is_recurring: true },

  // Shopping
  amazon:     { merchant: "Amazon",    category: "Shopping", subcategory: "E-commerce", emoji: "📦" },
  flipkart:   { merchant: "Flipkart",  category: "Shopping", subcategory: "E-commerce", emoji: "🛒" },
  myntra:     { merchant: "Myntra",    category: "Fashion", subcategory: "Clothing", emoji: "👗" },
  meesho:     { merchant: "Meesho",    category: "Shopping", subcategory: "E-commerce", emoji: "🛍️" },
  ajio:       { merchant: "AJIO",      category: "Fashion", subcategory: "Clothing", emoji: "👔" },
  nykaa:      { merchant: "Nykaa",     category: "Personal Care", subcategory: "Beauty", emoji: "💄" },
  croma:      { merchant: "Croma",     category: "Electronics", subcategory: "Retail", emoji: "💻" },
  "reliance digital": { merchant: "Reliance Digital", category: "Electronics", subcategory: "Retail", emoji: "📱" },

  // Groceries
  bigbasket:  { merchant: "BigBasket",       category: "Groceries", subcategory: "Online Grocery", emoji: "🥦" },
  dmart:      { merchant: "DMart",           category: "Groceries", subcategory: "Supermarket", emoji: "🏪" },
  "reliance fresh": { merchant: "Reliance Fresh", category: "Groceries", subcategory: "Supermarket", emoji: "🛒" },
  more:       { merchant: "More Supermarket", category: "Groceries", subcategory: "Supermarket", emoji: "🛒" },
  licious:    { merchant: "Licious",         category: "Groceries", subcategory: "Meat & Fish", emoji: "🍗" },

  // Fuel
  indianoil:  { merchant: "Indian Oil",  category: "Fuel", subcategory: "Petrol", emoji: "⛽" },
  bpcl:       { merchant: "BPCL",        category: "Fuel", subcategory: "Petrol", emoji: "⛽" },
  hpcl:       { merchant: "HPCL",        category: "Fuel", subcategory: "Petrol", emoji: "⛽" },
  petrol:     { merchant: "Petrol",      category: "Fuel", subcategory: "Petrol", emoji: "⛽" },

  // Utilities
  bescom:     { merchant: "BESCOM",      category: "Utilities", subcategory: "Electricity", emoji: "💡", is_recurring: true },
  msedcl:     { merchant: "MSEDCL",      category: "Utilities", subcategory: "Electricity", emoji: "💡", is_recurring: true },
  tatapower:  { merchant: "Tata Power",  category: "Utilities", subcategory: "Electricity", emoji: "💡", is_recurring: true },
  jio:        { merchant: "Jio",         category: "Utilities", subcategory: "Mobile/Internet", emoji: "📶", is_recurring: true },
  airtel:     { merchant: "Airtel",      category: "Utilities", subcategory: "Mobile/Internet", emoji: "📶", is_recurring: true },
  "vi ":      { merchant: "Vi (Vodafone)", category: "Utilities", subcategory: "Mobile", emoji: "📶", is_recurring: true },
  bsnl:       { merchant: "BSNL",        category: "Utilities", subcategory: "Mobile", emoji: "📞", is_recurring: true },
  bbmp:       { merchant: "BBMP",        category: "Utilities", subcategory: "Property Tax", emoji: "🏛️" },
  "piped gas": { merchant: "Piped Gas",  category: "Utilities", subcategory: "Gas", emoji: "🔥", is_recurring: true },
  "mahanagar gas": { merchant: "Mahanagar Gas", category: "Utilities", subcategory: "Gas", emoji: "🔥", is_recurring: true },

  // Healthcare
  apollo:     { merchant: "Apollo",      category: "Healthcare", subcategory: "Pharmacy/Hospital", emoji: "🏥" },
  practo:     { merchant: "Practo",      category: "Healthcare", subcategory: "Doctor", emoji: "👨‍⚕️" },
  pharmeasy:  { merchant: "PharmEasy",   category: "Healthcare", subcategory: "Pharmacy", emoji: "💊" },
  netmeds:    { merchant: "Netmeds",     category: "Healthcare", subcategory: "Pharmacy", emoji: "💊" },
  "tata 1mg": { merchant: "Tata 1mg",    category: "Healthcare", subcategory: "Pharmacy", emoji: "💊" },

  // Finance / Insurance
  lic:        { merchant: "LIC",         category: "Insurance", subcategory: "Life Insurance", emoji: "🛡️", is_recurring: true },
  "hdfc life": { merchant: "HDFC Life",  category: "Insurance", subcategory: "Life Insurance", emoji: "🛡️", is_recurring: true },
  policybazaar: { merchant: "PolicyBazaar", category: "Insurance", subcategory: "Insurance", emoji: "🛡️" },
  zerodha:    { merchant: "Zerodha",     category: "Investment", subcategory: "Stock Broker", emoji: "📈" },
  groww:      { merchant: "Groww",       category: "Investment", subcategory: "Mutual Fund", emoji: "📈" },
  kuvera:     { merchant: "Kuvera",      category: "Investment", subcategory: "Mutual Fund", emoji: "📊" },
  coin:       { merchant: "Coin (Zerodha)", category: "Investment", subcategory: "Mutual Fund", emoji: "📊" },
  "paytm money": { merchant: "Paytm Money", category: "Investment", subcategory: "Mutual Fund", emoji: "📊" },
  epf:        { merchant: "EPF",         category: "Investment", subcategory: "Provident Fund", emoji: "🏦", is_recurring: true },
  nps:        { merchant: "NPS",         category: "Investment", subcategory: "Pension", emoji: "🏦", is_recurring: true },

  // Food & Dining chains
  mcdonalds:  { merchant: "McDonald's",  category: "Food & Dining", subcategory: "Fast Food", emoji: "🍔" },
  kfc:        { merchant: "KFC",         category: "Food & Dining", subcategory: "Fast Food", emoji: "🍗" },
  dominos:    { merchant: "Domino's",    category: "Food & Dining", subcategory: "Pizza", emoji: "🍕" },
  "pizza hut": { merchant: "Pizza Hut",  category: "Food & Dining", subcategory: "Pizza", emoji: "🍕" },
  subway:     { merchant: "Subway",      category: "Food & Dining", subcategory: "Fast Food", emoji: "🥪" },
  starbucks:  { merchant: "Starbucks",   category: "Food & Dining", subcategory: "Cafe", emoji: "☕" },
  "cafe coffee day": { merchant: "Cafe Coffee Day", category: "Food & Dining", subcategory: "Cafe", emoji: "☕" },
  chaayos:    { merchant: "Chaayos",     category: "Food & Dining", subcategory: "Cafe", emoji: "🍵" },
  "barbeque nation": { merchant: "Barbeque Nation", category: "Food & Dining", subcategory: "Restaurant", emoji: "🍖" },
  social:     { merchant: "Social",      category: "Food & Dining", subcategory: "Bar & Restaurant", emoji: "🍻" },

  // Fitness
  "cult.fit": { merchant: "Cult.fit",    category: "Health & Fitness", subcategory: "Gym", emoji: "💪", is_recurring: true },
  curefit:    { merchant: "Cult.fit",    category: "Health & Fitness", subcategory: "Gym", emoji: "💪", is_recurring: true },
  "gold gym": { merchant: "Gold's Gym",  category: "Health & Fitness", subcategory: "Gym", emoji: "💪", is_recurring: true },
  "anytime fitness": { merchant: "Anytime Fitness", category: "Health & Fitness", subcategory: "Gym", emoji: "💪", is_recurring: true },

  // Education
  byjus:      { merchant: "BYJU'S",     category: "Education", subcategory: "E-learning", emoji: "📚", is_recurring: true },
  unacademy:  { merchant: "Unacademy",   category: "Education", subcategory: "E-learning", emoji: "📚", is_recurring: true },
  coursera:   { merchant: "Coursera",    category: "Education", subcategory: "E-learning", emoji: "🎓", is_recurring: true },
  udemy:      { merchant: "Udemy",       category: "Education", subcategory: "E-learning", emoji: "🎓" },

  // Payment apps (P2P transfers)
  phonepe:    { merchant: "PhonePe",     category: "Transfer", subcategory: "UPI Transfer", emoji: "💸" },
  gpay:       { merchant: "Google Pay",  category: "Transfer", subcategory: "UPI Transfer", emoji: "💸" },
  paytm:      { merchant: "Paytm",       category: "Transfer", subcategory: "UPI Transfer", emoji: "💸" },
  bhim:       { merchant: "BHIM",        category: "Transfer", subcategory: "UPI Transfer", emoji: "💸" },
};

/**
 * Look up a merchant from a raw bank transaction description.
 * Lowercases the description and checks if any known key is a substring.
 */
export function lookupMerchant(rawDescription: string): MerchantData | null {
  const lower = rawDescription.toLowerCase();
  for (const [key, data] of Object.entries(MERCHANT_MAP)) {
    if (lower.includes(key)) {
      return data;
    }
  }
  return null;
}

/**
 * Returns a unique list of all categories in the merchant database.
 */
export function getAllCategories(): string[] {
  const cats = new Set<string>();
  for (const data of Object.values(MERCHANT_MAP)) {
    cats.add(data.category);
  }
  return Array.from(cats).sort();
}

import { usdToPKR } from "@/lib/price";

const DEFAULT_MENU_USD = [
  {
    _id: "fallback-starter-1",
    name: "Chapli Kebab Bites",
    description:
      "Crispy mini chapli kebabs made with minced beef, crushed coriander, and pomegranate seeds.",
    price: 8.99,
    category: "Starters",
    imageURL:
      "https://images.unsplash.com/photo-1604908176997-4312de17f5b4?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-starter-2",
    name: "Seekh Kebab",
    description:
      "Charcoal-grilled minced chicken seekh kebabs with green chutney and onion rings.",
    price: 9.49,
    category: "Starters",
    imageURL:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-starter-3",
    name: "Shinwari Yakhni Soup",
    description:
      "Lightly spiced mutton broth simmered with garlic, black pepper, and fresh herbs.",
    price: 7.99,
    category: "Starters",
    imageURL:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-starter-4",
    name: "Afghani Tikka Skewers",
    description:
      "Smoky chicken tikka skewers marinated in yogurt, cumin, and lemon.",
    price: 10.99,
    category: "Starters",
    imageURL:
      "https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-main-1",
    name: "Chicken Karahi",
    description:
      "Traditional karahi cooked in tomato, green chili, ginger, and fresh coriander.",
    price: 16.99,
    variants: [
      { id: "half", label: "Half kg", priceMultiplier: 0.5 },
      { id: "full", label: "Full kg", priceMultiplier: 1 },
    ],
    options: [
      { id: "naan", label: "Naan", price: 0.5 },
      { id: "water", label: "Water Bottle", price: 0.8 },
    ],
    category: "Main Course",
    imageURL:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-main-2",
    name: "Mutton Karahi",
    description:
      "Tender mutton pieces cooked on high flame in classic Shinwari karahi masala.",
    price: 21.99,
    variants: [
      { id: "half", label: "Half kg", priceMultiplier: 0.5 },
      { id: "full", label: "Full kg", priceMultiplier: 1 },
    ],
    options: [
      { id: "naan", label: "Naan", price: 0.5 },
      { id: "bottle", label: "Any Bottle", price: 1.5 },
    ],
    category: "Main Course",
    imageURL:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-main-3",
    name: "Dum Pukht Mutton",
    description:
      "Slow-cooked sealed-pot mutton with aromatic spices and rich onion gravy.",
    price: 23.49,
    category: "Main Course",
    imageURL:
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-main-4",
    name: "Namkeen Rosh",
    description:
      "Signature Shinwari-style salted lamb roast with black pepper and fat-rendered juices.",
    price: 24.99,
    category: "Main Course",
    imageURL:
      "https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-main-5",
    name: "Kabuli Pulao",
    description:
      "Fragrant long-grain rice with tender meat, carrots, and raisins.",
    price: 15.99,
    category: "Main Course",
    imageURL:
      "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-main-6",
    name: "Mutton Tikka",
    description:
      "Juicy mutton tikka cubes grilled over charcoal and served with naan.",
    price: 18.99,
    variants: [
      { id: "quarter", label: "250g", priceMultiplier: 0.5 },
      { id: "half", label: "500g", priceMultiplier: 1 },
    ],
    category: "Main Course",
    imageURL:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-dessert-1",
    name: "Kheer",
    description:
      "Creamy rice pudding infused with cardamom and topped with pistachios.",
    price: 5.49,
    category: "Desserts",
    imageURL:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-dessert-2",
    name: "Firni",
    description:
      "Silky ground-rice custard set in clay bowls with saffron and almonds.",
    price: 5.99,
    category: "Desserts",
    imageURL:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-dessert-3",
    name: "Shahi Tukra",
    description:
      "Fried bread in sweet milk reduction, garnished with nuts and silver leaf.",
    price: 6.49,
    category: "Desserts",
    imageURL:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-dessert-4",
    name: "Gajar Halwa",
    description:
      "Slow-cooked carrot halwa with khoya, ghee, and roasted cashews.",
    price: 6.99,
    category: "Desserts",
    imageURL:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-drink-1",
    name: "Sweet Lassi",
    description: "Traditional chilled yogurt drink blended with sugar and rose water.",
    price: 3.99,
    options: [
      { id: "large", label: "Large Bottle", price: 1.2 },
      { id: "bottle", label: "Add Bottle", price: 0.8 },
    ],
    category: "Drinks",
    imageURL:
      "https://images.unsplash.com/photo-1556881286-fc6915169721?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-drink-2",
    name: "Salted Lassi",
    description: "Refreshing salty yogurt lassi with roasted cumin and mint.",
    price: 3.99,
    options: [
      { id: "large", label: "Large Bottle", price: 1.2 },
      { id: "bottle", label: "Add Bottle", price: 0.8 },
    ],
    category: "Drinks",
    imageURL:
      "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-drink-3",
    name: "Doodh Patti Chai",
    description:
      "Strong milk tea brewed with cardamom, cinnamon, and black tea leaves.",
    price: 2.99,
    category: "Drinks",
    imageURL:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-drink-4",
    name: "Mint Lemon Soda",
    description: "Fresh lime, mint, and sparkling soda for a cooling finish.",
    price: 3.49,
    category: "Drinks",
    imageURL:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-special-1",
    name: "Shinwari Family Dastarkhwan",
    description:
      "Family platter with mutton karahi, chicken karahi, kebabs, naan, and salad.",
    price: 49.99,
    category: "Specials",
    imageURL:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900",
    isAvailable: true,
  },
  {
    _id: "fallback-special-2",
    name: "Whole Lamb Rosh Special",
    description:
      "Chef's signature whole-cut lamb rosh, slow-cooked and finished over coals.",
    price: 59.99,
    category: "Specials",
    imageURL:
      "https://images.unsplash.com/photo-1558030006-450675393462?w=900",
    isAvailable: true,
  },
];

// Convert USD prices to PKR using the configured exchange rate
const DEFAULT_MENU = DEFAULT_MENU_USD.map((it) => {
  const copy = { ...it, price: usdToPKR(it.price) };

  // Ensure each item exposes `imageURLs` (3 copies when only `imageURL` exists)
  if (Array.isArray(it.imageURLs) && it.imageURLs.length > 0) {
    copy.imageURLs = [...it.imageURLs];
  } else if (it.imageURL) {
    copy.imageURLs = [it.imageURL, it.imageURL, it.imageURL];
  } else {
    copy.imageURLs = [];
  }

  if (Array.isArray(it.options)) {
    copy.options = it.options.map((o) => ({ ...o, price: usdToPKR(o.price) }));
  }

  return copy;
});

export default DEFAULT_MENU;

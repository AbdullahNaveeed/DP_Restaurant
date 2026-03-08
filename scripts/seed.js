const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

const MenuItemSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    category: {
      type: String,
      enum: ["Starters", "Main Course", "Desserts", "Drinks", "Specials"],
    },
    imageURL: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);

const menuItems = [
  {
    name: "Chapli Kebab Bites",
    description:
      "Crispy mini chapli kebabs made with minced beef, crushed coriander, and pomegranate seeds.",
    price: 8.99,
    category: "Starters",
    imageURL: "https://images.unsplash.com/photo-1604908176997-4312de17f5b4?w=900",
    isAvailable: true,
  },
  {
    name: "Seekh Kebab",
    description:
      "Charcoal-grilled minced chicken seekh kebabs with green chutney and onion rings.",
    price: 9.49,
    category: "Starters",
    imageURL: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900",
    isAvailable: true,
  },
  {
    name: "Shinwari Yakhni Soup",
    description:
      "Lightly spiced mutton broth simmered with garlic, black pepper, and fresh herbs.",
    price: 7.99,
    category: "Starters",
    imageURL: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900",
    isAvailable: true,
  },
  {
    name: "Afghani Tikka Skewers",
    description: "Smoky chicken tikka skewers marinated in yogurt, cumin, and lemon.",
    price: 10.99,
    category: "Starters",
    imageURL: "https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=900",
    isAvailable: true,
  },
  {
    name: "Chicken Karahi",
    description:
      "Traditional karahi cooked in tomato, green chili, ginger, and fresh coriander.",
    price: 16.99,
    category: "Main Course",
    imageURL: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900",
    isAvailable: true,
  },
  {
    name: "Mutton Karahi",
    description:
      "Tender mutton pieces cooked on high flame in classic Shinwari karahi masala.",
    price: 21.99,
    category: "Main Course",
    imageURL: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=900",
    isAvailable: true,
  },
  {
    name: "Dum Pukht Mutton",
    description: "Slow-cooked sealed-pot mutton with aromatic spices and rich onion gravy.",
    price: 23.49,
    category: "Main Course",
    imageURL: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=900",
    isAvailable: true,
  },
  {
    name: "Namkeen Rosh",
    description:
      "Signature Shinwari-style salted lamb roast with black pepper and fat-rendered juices.",
    price: 24.99,
    category: "Main Course",
    imageURL: "https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?w=900",
    isAvailable: true,
  },
  {
    name: "Kabuli Pulao",
    description: "Fragrant long-grain rice with tender meat, carrots, and raisins.",
    price: 15.99,
    category: "Main Course",
    imageURL: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=900",
    isAvailable: true,
  },
  {
    name: "Mutton Tikka",
    description: "Juicy mutton tikka cubes grilled over charcoal and served with naan.",
    price: 18.99,
    category: "Main Course",
    imageURL: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900",
    isAvailable: true,
  },
  {
    name: "Kheer",
    description: "Creamy rice pudding infused with cardamom and topped with pistachios.",
    price: 5.49,
    category: "Desserts",
    imageURL: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=900",
    isAvailable: true,
  },
  {
    name: "Firni",
    description: "Silky ground-rice custard set in clay bowls with saffron and almonds.",
    price: 5.99,
    category: "Desserts",
    imageURL: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900",
    isAvailable: true,
  },
  {
    name: "Shahi Tukra",
    description: "Fried bread in sweet milk reduction, garnished with nuts and silver leaf.",
    price: 6.49,
    category: "Desserts",
    imageURL: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=900",
    isAvailable: true,
  },
  {
    name: "Gajar Halwa",
    description: "Slow-cooked carrot halwa with khoya, ghee, and roasted cashews.",
    price: 6.99,
    category: "Desserts",
    imageURL: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900",
    isAvailable: true,
  },
  {
    name: "Sweet Lassi",
    description: "Traditional chilled yogurt drink blended with sugar and rose water.",
    price: 3.99,
    category: "Drinks",
    imageURL: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=900",
    isAvailable: true,
  },
  {
    name: "Salted Lassi",
    description: "Refreshing salty yogurt lassi with roasted cumin and mint.",
    price: 3.99,
    category: "Drinks",
    imageURL: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=900",
    isAvailable: true,
  },
  {
    name: "Doodh Patti Chai",
    description: "Strong milk tea brewed with cardamom, cinnamon, and black tea leaves.",
    price: 2.99,
    category: "Drinks",
    imageURL: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900",
    isAvailable: true,
  },
  {
    name: "Mint Lemon Soda",
    description: "Fresh lime, mint, and sparkling soda for a cooling finish.",
    price: 3.49,
    category: "Drinks",
    imageURL: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900",
    isAvailable: true,
  },
  {
    name: "Shinwari Family Dastarkhwan",
    description:
      "Family platter with mutton karahi, chicken karahi, kebabs, naan, and salad.",
    price: 49.99,
    category: "Specials",
    imageURL: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900",
    isAvailable: true,
  },
  {
    name: "Whole Lamb Rosh Special",
    description: "Chef's signature whole-cut lamb rosh, slow-cooked and finished over coals.",
    price: 59.99,
    category: "Specials",
    imageURL: "https://images.unsplash.com/photo-1558030006-450675393462?w=900",
    isAvailable: true,
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.\n");

    console.log("Seeding admin user...");
    const adminEmail = "admin@ghanishinwari.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists, skipping.");
    } else {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`Admin created: ${adminEmail} / admin123`);
    }

    console.log("\nSeeding menu items...");
    const existingCount = await MenuItem.countDocuments();
    if (existingCount > 0) {
      console.log(`Existing items found (${existingCount}), replacing dataset...`);
      await MenuItem.deleteMany({});
    }

    // Convert USD prices to PKR using EXCHANGE_RATE (or fallback)
    const RATE = Number(process.env.EXCHANGE_RATE || process.env.NEXT_PUBLIC_EXCHANGE_RATE) || 280;
    const menuToInsert = menuItems.map((mi) => ({
      ...mi,
      price: Math.round(Number(mi.price) * RATE),
    }));

    await MenuItem.insertMany(menuToInsert);
    console.log(`Inserted ${menuToInsert.length} menu items across all categories.`);
    console.log("\nSeed completed successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
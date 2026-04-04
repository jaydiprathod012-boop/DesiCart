/**
 * Sample Products Data — DesiCart
 * Run: node data/seeder.js  (seeds DB)
 * Run: node data/seeder.js --destroy  (clears DB)
 */

const dotenv  = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const User    = require("../models/User");
const Order   = require("../models/Order");
const Cart    = require("../models/Cart");

dotenv.config();

const sampleProducts = [
  {
    name: "Banarasi Silk Saree — Royal Blue",
    description:
      "Exquisite handwoven Banarasi silk saree with intricate zari work. Perfect for weddings, festivals, and special occasions. Comes with matching blouse piece.",
    price: 3499,
    mrp: 6999,
    category: "Clothing",
    subcategory: "Sarees",
    brand: "KaashiWeaves",
    stock: 15,
    rating: 4.7,
    numReviews: 82,
    isFeatured: true,
    tags: ["saree", "silk", "banarasi", "wedding", "ethnic"],
    images: [
      { public_id: "sample_1a", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600" },
    ],
  },
  {
    name: "Redmi Note 13 Pro 5G — 8GB/256GB",
    description:
      "Snapdragon 7s Gen 2 processor, 200MP OIS camera, 5000mAh battery with 67W turbo charging. AMOLED display with 120Hz refresh rate.",
    price: 24999,
    mrp: 28999,
    category: "Electronics",
    subcategory: "Smartphones",
    brand: "Redmi",
    stock: 42,
    rating: 4.5,
    numReviews: 213,
    isFeatured: true,
    tags: ["mobile", "5g", "smartphone", "redmi"],
    images: [
      { public_id: "sample_2a", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600" },
    ],
  },
  {
    name: "Tata Sampann Chana Dal — 1kg",
    description:
      "Premium quality chana dal (split chickpea lentils) sourced directly from farms. High in protein, rich in fibre. Ideal for dal tadka, chana dal fry, and halwa.",
    price: 89,
    mrp: 115,
    category: "Food & Grocery",
    subcategory: "Dal & Pulses",
    brand: "Tata Sampann",
    stock: 200,
    rating: 4.4,
    numReviews: 430,
    isFeatured: false,
    tags: ["dal", "grocery", "protein", "lentils"],
    images: [
      { public_id: "sample_3a", url: "https://images.unsplash.com/photo-1585670432040-f0b2e0120cc0?w=600" },
    ],
  },
  {
    name: "Prestige Svachh Pressure Cooker — 5L",
    description:
      "Cook up to 3x faster with Prestige's advanced safety pressure cooker. Food-grade stainless steel body, easy-lock lid with pressure indicator.",
    price: 1299,
    mrp: 2299,
    category: "Home & Kitchen",
    subcategory: "Cookware",
    brand: "Prestige",
    stock: 38,
    rating: 4.6,
    numReviews: 157,
    isFeatured: true,
    tags: ["pressure cooker", "kitchen", "cookware", "prestige"],
    images: [
      { public_id: "sample_4a", url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600" },
    ],
  },
  {
    name: "Mamaearth Vitamin C Facewash — 100ml",
    description:
      "Brightening face wash with real Vitamin C and Turmeric. Removes tan, dark spots, and dead skin cells. Dermatologically tested, toxin-free formula.",
    price: 249,
    mrp: 349,
    category: "Beauty & Personal Care",
    subcategory: "Skincare",
    brand: "Mamaearth",
    stock: 95,
    rating: 4.3,
    numReviews: 892,
    isFeatured: false,
    tags: ["facewash", "vitamin c", "skincare", "brightening"],
    images: [
      { public_id: "sample_5a", url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600" },
    ],
  },
  {
    name: "Nivia Pro Sports Shoes — Men's",
    description:
      "Lightweight running shoes with air-mesh upper, EVA midsole for cushioning, and rubber outsole for grip. Ideal for gym, running, and outdoor sports.",
    price: 1199,
    mrp: 2499,
    category: "Sports & Fitness",
    subcategory: "Footwear",
    brand: "Nivia",
    stock: 60,
    rating: 4.1,
    numReviews: 341,
    isFeatured: false,
    tags: ["sports shoes", "running", "gym", "men"],
    images: [
      { public_id: "sample_6a", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" },
    ],
  },
  {
    name: "Atomic Habits — James Clear",
    description:
      "The #1 New York Times bestseller. Discover how tiny changes in your daily habits can lead to remarkable results. Build good habits, break bad ones.",
    price: 399,
    mrp: 799,
    category: "Books",
    subcategory: "Self-Help",
    brand: "Penguin Random House",
    stock: 120,
    rating: 4.9,
    numReviews: 2145,
    isFeatured: true,
    tags: ["book", "self-help", "habits", "bestseller"],
    images: [
      { public_id: "sample_7a", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600" },
    ],
  },
  {
    name: "Funskool Monopoly Board Game",
    description:
      "Classic property trading game for family fun. Buy, sell, and trade your way to becoming the wealthiest player. 2-6 players, ages 8 and above.",
    price: 599,
    mrp: 999,
    category: "Toys & Games",
    subcategory: "Board Games",
    brand: "Funskool",
    stock: 45,
    rating: 4.4,
    numReviews: 567,
    isFeatured: false,
    tags: ["board game", "monopoly", "family", "toys"],
    images: [
      { public_id: "sample_8a", url: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600" },
    ],
  },
  {
    name: "Tanishq 22KT Gold Jhumka Earrings",
    description:
      "Handcrafted 22 karat gold jhumka earrings with temple design. Perfect for festive occasions and traditional attire. BIS hallmarked for purity assurance.",
    price: 18500,
    mrp: 21000,
    category: "Jewellery",
    subcategory: "Earrings",
    brand: "Tanishq",
    stock: 8,
    rating: 4.8,
    numReviews: 73,
    isFeatured: true,
    tags: ["gold", "jhumka", "jewellery", "earrings", "ethnic"],
    images: [
      { public_id: "sample_9a", url: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600" },
    ],
  },
  {
    name: "Metro Shoes Women's Block Heels",
    description:
      "Stylish block heel sandals with cushioned insole and adjustable ankle strap. Versatile for office and casual outings. Available in multiple colours.",
    price: 1499,
    mrp: 2999,
    category: "Footwear",
    subcategory: "Women's Sandals",
    brand: "Metro",
    stock: 32,
    rating: 4.2,
    numReviews: 198,
    isFeatured: false,
    tags: ["heels", "women", "sandals", "footwear"],
    images: [
      { public_id: "sample_10a", url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600" },
    ],
  },
  {
    name: "boAt Rockerz 550 Bluetooth Headphones",
    description:
      "Over-ear wireless headphones with 20hr battery, 40mm drivers, foldable design, and built-in mic. Super Extra Bass for deep, punchy sound.",
    price: 1299,
    mrp: 3990,
    category: "Electronics",
    subcategory: "Headphones",
    brand: "boAt",
    stock: 75,
    rating: 4.3,
    numReviews: 1456,
    isFeatured: true,
    tags: ["headphones", "bluetooth", "wireless", "boat", "audio"],
    images: [
      { public_id: "sample_11a", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" },
    ],
  },
  {
    name: "Khadi Natural Aloe Vera Gel — 200g",
    description:
      "100% pure aloe vera gel for skin and hair. No parabens, no SLS. Soothes sunburn, moisturises skin, and promotes hair growth.",
    price: 199,
    mrp: 299,
    category: "Beauty & Personal Care",
    subcategory: "Skincare",
    brand: "Khadi Natural",
    stock: 180,
    rating: 4.5,
    numReviews: 623,
    isFeatured: false,
    tags: ["aloe vera", "natural", "skincare", "khadi"],
    images: [
      { public_id: "sample_12a", url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600" },
    ],
  },
];

const seedDB = async () => {
  await connectDB();

  if (process.argv[2] === "--destroy") {
    await Product.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    console.log("✅ Data cleared from DB");
  } else {
    await Product.deleteMany();

    // Create admin user if not exists
    let admin = await User.findOne({ email: "admin@desicart.in" });
    if (!admin) {
      admin = await User.create({
        name:     "DesiCart Admin",
        email:    "admin@desicart.in",
        password: "admin123",
        role:     "admin",
        phone:    "9999999999",
      });
      console.log("✅ Admin user created: admin@desicart.in / admin123");
    }

    // Create demo user
    let demoUser = await User.findOne({ email: "user@desicart.in" });
    if (!demoUser) {
      demoUser = await User.create({
        name:     "Ravi Kumar",
        email:    "user@desicart.in",
        password: "user1234",
        phone:    "9876543210",
      });
      console.log("✅ Demo user created: user@desicart.in / user1234");
    }

    const products = sampleProducts.map((p) => ({ ...p, createdBy: admin._id }));
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded to DB`);
  }

  process.exit(0);
};

seedDB().catch((err) => {
  console.error(err);
  process.exit(1);
});

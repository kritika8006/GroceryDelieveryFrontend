// Seeds the DB with an admin user + a handful of products matching the
// categories already used in the frontend (src/assets/assets.ts).
// Run with: npm run seed
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const products = [
  { name: "Butter Croissant 100g", description: "Flaky and buttery", price: 45, originalPrice: 50, image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/zvoeqbvrbrt7atqj0dbu.png", category: "bakery", unit: "100g", stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { name: "Organic Quinoa 500g", description: "High protein, gluten-free", price: 420, originalPrice: 450, image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/cxrrgnf12xuhkr4dyhi2.png", category: "pantry-staples", unit: "500g", stock: 100, isOrganic: true, rating: 4.5, reviewCount: 12 },
  { name: "Brown Bread 400g", description: "Soft and healthy, ideal for breakfast", price: 35, originalPrice: 40, image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/vy1xa7zovcu22smzapzv.png", category: "bakery", unit: "400g", stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { name: "Barley 1kg", description: "Rich in fiber, helps digestion", price: 140, originalPrice: 150, image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/spb5sgy8g24rned9nwog.png", category: "pantry-staples", unit: "1kg", stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { name: "Maggi Noodles 280g", description: "Instant and easy to cook", price: 50, originalPrice: 55, image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/dsep7owmwvfrukzbslqo.png", category: "pantry-staples", unit: "280g", stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { name: "Sprite 1.5L", description: "Chilled and refreshing", price: 60, originalPrice: 75, image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/daiglpvgna1dlhjplbve.png", category: "beverages", unit: "1.5L", stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { name: "Carrot 500g", description: "Sweet and crunchy, good for eyesight", price: 44, originalPrice: 50, image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/ceqgisupuizyste9aifg.png", category: "fruits-vegetables", unit: "500g", stock: 100, isOrganic: true, rating: 4.5, reviewCount: 12 },
];

const run = async () => {
  await connectDB();

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);

  const adminEmail = "admin@example.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({ name: "Admin", email: adminEmail, password: hashedPassword, isAdmin: true });
    console.log(`Created admin user -> ${adminEmail} / admin123`);
  }

  console.log("Seeding complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

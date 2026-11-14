import mongoose from 'mongoose';
import '../config/env.js';
import { connectDB } from '../config/db.js';
import Canteen from '../models/Canteen.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';

const images = {
  dosa: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
  meal: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
  pizza: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800'
};
const canteenData = [
  { seedKey: 'main-canteen', name: 'The Grand Canteen', description: 'Comforting classics and fresh daily meals.', location: 'Ring Road Campus', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200', openingHours: '8:00 AM - 8:00 PM' },
  { seedKey: 'food-court', name: 'Campus Food Court', description: 'Fast, fun and flavourful bites between classes.', location: 'North Block', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', openingHours: '9:00 AM - 9:00 PM' },
  { seedKey: 'brew-lab', name: 'Brew & Bake Lab', description: 'A relaxed space for coffee, bakes and desserts.', location: 'Innovation Block', image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1200', openingHours: '8:30 AM - 7:30 PM' }
];
const foods = [
  ['Masala Dosa','South Indian',90,'dosa'],['Plain Dosa','South Indian',70,'dosa'],['Idli Vada','Breakfast',65,'dosa'],['Poori Sagu','Breakfast',75,'meal'],['Veg Meals','Meals',130,'meal'],['Paneer Rice','Meals',145,'meal'],['Fried Rice','Fast Food',120,'noodles'],['Veg Noodles','Fast Food',110,'noodles'],['Chicken Biryani','Meals',180,'meal'],['Veg Burger','Pizza and Burgers',140,'burger'],['Cheese Pizza','Pizza and Burgers',220,'pizza'],['Sandwich','Fast Food',95,'burger'],['French Fries','Snacks',80,'burger'],['Samosa','Snacks',35,'meal'],['Puffs','Bakery',45,'meal'],['Tea','Beverages',25,'coffee'],['Coffee','Beverages',45,'coffee'],['Cold Coffee','Beverages',90,'coffee'],['Fresh Juice','Beverages',80,'coffee'],['Milkshake','Beverages',110,'coffee'],['Brownie','Desserts',85,'dessert'],['Ice Cream','Desserts',75,'dessert'],['Paneer Wrap','Fast Food',130,'burger'],['Gobi Manchurian','Snacks',115,'meal'],['Chole Bhature','North Indian',140,'meal'],['Rajma Rice','North Indian',125,'meal'],['Aloo Paratha','North Indian',100,'meal'],['Veg Pasta','Fast Food',150,'noodles'],['Mango Lassi','Beverages',70,'coffee'],['Chocolate Cake','Bakery',95,'dessert'],['Veg Kebab','Snacks',120,'meal'],['Masala Chai','Beverages',30,'coffee'],['Garlic Bread','Bakery',100,'pizza'],['Fruit Bowl','Breakfast',85,'dessert'],['Lemon Soda','Beverages',45,'coffee'],['Pav Bhaji','North Indian',110,'meal']
];
async function seed() {
  await connectDB();
  const canteens = [];
  for (const data of canteenData) {
    canteens.push(await Canteen.findOneAndUpdate(
      { seedKey: data.seedKey },
      { $setOnInsert: data },
      { upsert: true, new: true }
    ));
  }
  for (let i = 0; i < foods.length; i++) {
    const [name, category, price, image] = foods[i];
    await MenuItem.findOneAndUpdate(
      { seedKey: `food-${i + 1}` },
      { $setOnInsert: {
        name,
        description: `Freshly prepared ${name.toLowerCase()} made for campus days.`,
        category,
        price,
        image: images[image],
        stock: 8 + ((i * 7) % 25),
        canteen: canteens[i % 3]._id,
        isAvailable: true,
        seedKey: `food-${i + 1}`
      } },
      { upsert: true }
    );
  }

  const email = process.env.ADMIN_EMAIL || 'admin@pesufoods.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const admin = await User.findOne({ email });
  if (admin) {
    if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
    }
  } else {
    await User.create({ name: 'PESUFOODS Admin', email, password, role: 'admin' });
  }
  console.log(`Seeded ${canteens.length} canteens, ${foods.length} menu items, and admin ${email}.`);
}

try {
  await seed();
} finally {
  await mongoose.disconnect();
}

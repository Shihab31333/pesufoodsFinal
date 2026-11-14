import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import mongoose from 'mongoose';
import '../config/env.js';
import { connectDB } from '../config/db.js';
import Canteen from '../models/Canteen.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { checkout } from '../services/orderService.js';

const testKey = `session-test-${randomUUID()}`;
let canteen;
let firstUser;
let secondUser;
let item;

test.before(async () => {
  await connectDB();
  canteen = await Canteen.create({
    seedKey: `${testKey}-canteen`,
    name: 'Session Test Canteen',
    description: 'Integration test fixture',
    location: 'Test Campus',
    image: 'https://example.com/canteen.jpg',
    openingHours: 'All day'
  });
  [firstUser, secondUser] = await User.create([
    { name: 'Session Test One', email: `${testKey}-one@example.com`, password: 'Password@123' },
    { name: 'Session Test Two', email: `${testKey}-two@example.com`, password: 'Password@123' }
  ]);
  item = await MenuItem.create({
    seedKey: `${testKey}-item`,
    name: 'Session Test Item',
    description: 'Integration test fixture',
    image: 'https://example.com/item.jpg',
    price: 25,
    category: 'Snacks',
    stock: 2,
    canteen: canteen._id
  });
});

test.after(async () => {
  await Order.deleteMany({ idempotencyKey: new RegExp(`^${testKey}`) });
  await MenuItem.deleteMany({ seedKey: new RegExp(`^${testKey}`) });
  await User.deleteMany({ email: new RegExp(`^${testKey}`) });
  await Canteen.deleteMany({ seedKey: new RegExp(`^${testKey}`) });
  await mongoose.disconnect();
});

test('checkout commits stock decrement and order creation', async () => {
  const order = await checkout({
    userId: firstUser._id,
    canteenId: canteen._id,
    items: [{ itemId: item._id, quantity: 1 }],
    idempotencyKey: `${testKey}-success`
  });
  assert.equal(order.totalAmount, 25);
  assert.equal((await MenuItem.findById(item._id)).stock, 1);
  assert.equal(await Order.countDocuments({ idempotencyKey: `${testKey}-success` }), 1);
});

test('insufficient stock aborts without decrementing inventory', async () => {
  await assert.rejects(
    checkout({
      userId: firstUser._id,
      canteenId: canteen._id,
      items: [{ itemId: item._id, quantity: 2 }],
      idempotencyKey: `${testKey}-insufficient`
    }),
    (error) => error.status === 409
  );
  assert.equal((await MenuItem.findById(item._id)).stock, 1);
});

test('invalid item aborts without creating an order', async () => {
  await assert.rejects(
    checkout({
      userId: firstUser._id,
      canteenId: canteen._id,
      items: [{ itemId: new mongoose.Types.ObjectId(), quantity: 1 }],
      idempotencyKey: `${testKey}-invalid`
    }),
    (error) => error.status === 409
  );
  assert.equal(await Order.countDocuments({ idempotencyKey: `${testKey}-invalid` }), 0);
  assert.equal((await MenuItem.findById(item._id)).stock, 1);
});

test('database failure aborts and restores inventory', async () => {
  const originalCreate = Order.create;
  Order.create = async () => {
    throw new Error('forced order persistence failure');
  };
  try {
    await assert.rejects(
      checkout({
        userId: firstUser._id,
        canteenId: canteen._id,
        items: [{ itemId: item._id, quantity: 1 }],
        idempotencyKey: `${testKey}-database-failure`
      }),
      /forced order persistence failure/
    );
  } finally {
    Order.create = originalCreate;
  }
  assert.equal((await MenuItem.findById(item._id)).stock, 1);
  assert.equal(await Order.countDocuments({ idempotencyKey: `${testKey}-database-failure` }), 0);
});

test('concurrent checkouts cannot oversell the last item', async () => {
  await MenuItem.updateOne({ _id: item._id }, { $set: { stock: 1 } });
  const results = await Promise.allSettled([
    checkout({ userId: firstUser._id, canteenId: canteen._id, items: [{ itemId: item._id, quantity: 1 }], idempotencyKey: `${testKey}-race-one` }),
    checkout({ userId: secondUser._id, canteenId: canteen._id, items: [{ itemId: item._id, quantity: 1 }], idempotencyKey: `${testKey}-race-two` })
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal((await MenuItem.findById(item._id)).stock, 0);
  assert.equal(await Order.countDocuments({ idempotencyKey: new RegExp(`${testKey}-race-`) }), 1);
});

test('repeated idempotency keys do not create duplicate orders', async () => {
  await MenuItem.updateOne({ _id: item._id }, { $set: { stock: 2 } });
  const key = `${testKey}-duplicate`;
  await checkout({ userId: firstUser._id, canteenId: canteen._id, items: [{ itemId: item._id, quantity: 1 }], idempotencyKey: key });
  await checkout({ userId: firstUser._id, canteenId: canteen._id, items: [{ itemId: item._id, quantity: 1 }], idempotencyKey: key });
  assert.equal(await Order.countDocuments({ idempotencyKey: key }), 1);
  assert.equal((await MenuItem.findById(item._id)).stock, 1);
});

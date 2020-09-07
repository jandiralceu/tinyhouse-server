import { connectDatabase } from "../src/database";

const clear = async () => {
  try {
    console.log("[clear]: running");

    const db = await connectDatabase();

    Promise.all([
      db.bookings.find({}).toArray(),
      db.listings.find({}).toArray(),
      db.users.find({}).toArray(),
    ]).then(async ([bookings, listings, users]) => {
        if (bookings.length) await db.bookings.drop()
        if (listings.length) await db.listings.drop()
        if (users.length) await db.users.drop()
    });

    console.log("[clear]: success");
  } catch (e) {
    throw new Error("Failed to clear database");
  }
};

clear();

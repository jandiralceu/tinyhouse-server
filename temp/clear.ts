import { connectDatabase } from "../src/database";

const clear = () => {
  console.log("[clear]: running");

  connectDatabase().then((db) => {
    Promise.all([
      db.bookings.find({}).toArray(),
      db.listings.find({}).toArray(),
      db.users.find({}).toArray(),
    ])
      .then(async ([bookings, listings, users]) => {
        if (bookings.length) await db.bookings.drop();
        if (listings.length) await db.listings.drop();
        if (users.length) await db.users.drop();

        console.log("[clear]: success");
        process.exit();
      })
  }).catch(() => {
    throw new Error("Failed to clear database");
  });
};

clear();

import { MongoClient } from "mongodb";

import { Database, Listing, User, Booking } from "../lib/types";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.m4a3o.mongodb.net/test?retryWrites=true&w=majority`;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db(process.env.DB_NAME);

  return {
    listings: db.collection<Listing>("listings"),
    users: db.collection<User>("users"),
    bookings: db.collection<Booking>("bookings")
  };
};

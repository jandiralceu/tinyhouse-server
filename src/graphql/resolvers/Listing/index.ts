import { IResolvers } from "apollo-server-express";
import { ObjectID } from "mongodb";

import { Database, Listing } from "../../../lib/types";

export const listingResolver: IResolvers = {
  Query: {
    listings: async (_root: undefined, _args: unknown, { db }: { db: Database }): Promise<Listing[]> => {
      return await db.listings.find({}).toArray();
    }
  },
  Mutation: {
    deleteListing: async (_root: undefined, { id }: { id: string }, { db }: { db: Database }): Promise<Listing> => {
      const result = await db.listings.findOneAndDelete({
        _id: new ObjectID(id)
      })

      if (!result.value) throw new Error('Failed to delete listing')

      return result.value
    }
  },
  Listing: {
    id: (listing: Listing): string => listing._id.toString()
  }
};
import crypto from "crypto";
import { IResolvers } from "apollo-server-express";
import { CookieOptions, Response, Request } from "express";

import { Viewer, Database, User } from "../../../lib/types";
import { Google } from "../../../lib/api";
import { LogInArgs } from "./types";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: process.env.NODE_END !== "development",
};

const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database,
  res: Response
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) throw new Error("Google login error");

  const userName = user?.names?.length ? user.names[0].displayName : null;
  const userId = user?.names?.length
    ? user.names[0].metadata?.source?.id
    : null;
  const userAvatar = user?.photos?.length ? user.photos[0].url : null;
  const userEmail = user?.emailAddresses?.length
    ? user.emailAddresses[0].value
    : null;

  if (!userId || !userName || !userAvatar || !userEmail)
    throw new Error("Google login error");

  const updateUser = await db.users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token,
      },
    },
    { returnOriginal: false }
  );

  let viewer = updateUser.value;

  if (!viewer) {
    const insertResult = await db.users.insertOne({
      _id: userId,
      token,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      income: 0,
      bookings: [],
      listings: [],
    });

    viewer = insertResult.ops[0];
  }

  res.cookie("viewer", userId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });

  return viewer;
};

const logInViaCookie = async (token: string, db: Database, req: Request, res: Response): Promise<User | undefined> => {
  const updateUser = await db.users.findOneAndUpdate(
    { _id: req.signedCookies.viewer },
    { $set: { token } },
    { returnOriginal: false }
  )

  const viewer = updateUser.value;

  if (!viewer) res.clearCookie("viewer", cookieOptions)

  return viewer
}

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (err) {
        throw new Error(`Failed to query Google Auth URL: ${err}`);
      }
    },
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db, req, res }: { db: Database, req: Request, res: Response }
    ): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString("hex");

        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db, res)
          : await logInViaCookie(token, db, req, res);

        if (!viewer) return { didRequest: true };

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (err) {
        throw new Error(`Failed to log in: ${err}`);
      }
    },
    logOut: (_root: undefined, _args: unknown, { res }: { res: Response }): Viewer => {
      try {
        res.clearCookie("viewer", cookieOptions)

        return { didRequest: true };
      } catch (err) {
        throw new Error(`Failed to log out: ${err}`);
      }
    },
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): boolean | undefined => {
      return viewer.walletId ? true : undefined;
    },
  },
};

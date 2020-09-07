import { ObjectID, Collection } from "mongodb";

export enum ListingType {
  Apartment = "APARTMENT",
  House = "HOUSE",
}

export interface BookingIndexMonth {
  [key: string]: boolean;
}

export interface BookingIndexYear {
  [key: string]: BookingIndexMonth;
}

export interface BookingIndex {
  [key: string]: BookingIndexYear
}

export interface Listing {
  _id: ObjectID;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string;
  city: string;
  bookings: ObjectID[];
  bookingsIndex: BookingIndex;
  price: number;
  numOfGuests: number;
}

export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
  income: number;
  bookings: ObjectID[];
  listings: ObjectID[];
}

export interface Booking {
  _id: ObjectID;
  listing: ObjectID;
  tenant: string;
  checkIn: string;
  checkOut: string;
}

export interface Database {
  listings: Collection<Listing>;
  users: Collection<User>;
  bookings: Collection<Booking>;
}

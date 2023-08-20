import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("http://localhost/v1")
  .setProject("647af6d86045f264979f");

export const account = new Account(client);

export const databases = new Databases(client, "647c2f75dc6b379c99c6");

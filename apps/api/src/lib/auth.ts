import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { connectMongooseDB } from "../config/db.js";
import { env } from "../config/env.js";
import { oneTap } from "better-auth/plugins";
const db = await connectMongooseDB();
export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: { enabled: true },
  trustedOrigins: ["http://localhost:3000"],
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins:[
    oneTap({
      clientId: env.GOOGLE_CLIENT_ID!
    })
  ]
});

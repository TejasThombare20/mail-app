import admin from "firebase-admin"
import dotenv from 'dotenv';
import ServiceAccount from "../serviceAccount.json"

dotenv.config();



admin.initializeApp({
    //@ts-ignore
    credential  : admin.credential.cert(ServiceAccount)
})
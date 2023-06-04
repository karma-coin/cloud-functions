import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
// import {initializeApp} from "firebase-admin/app";
import admin = require("firebase-admin");
import {getFirestore} from "firebase-admin/firestore";

// init firebase admin
admin.initializeApp();

const db = getFirestore();
// Send pusn note to Karma Coin Transaction receiver account
export const processPaymentTransaction =
    onRequest(async (request, response) => {
      const toId = request.query.toId?.toString();
      if (toId === null) {
        logger.log("missing required toId parameter");
        return;
      }
      const amount = request.query.amount?.toString();
      if (amount === null) {
        logger.log("missing required amount parameter");
        return;
      }

      const charTraitId = request.query.charTrait?.toString() || "";
      const transactionId = request.query.transactionId?.toString();

      if (transactionId === null) {
        logger.log("missing required transaction id parameter");
        return;
      }

      const accountId = Buffer.from(toId!, "base64").toString("ascii");
      logger.log("Payment tx to accountId: " + accountId);

      // Create a reference to the users collection
      const usersRef = db.collection("users");

      // Find all docs for account id
      const docs = await usersRef.where("accountId", "==", toId).get();

      if (docs.empty) {
        logger.log("No push notes token for account.");
        return;
      }

      const pushTokens = new Array<string>();

      // collect all push tokens into pushTokens
      // note multiple tokens per doc possible
      docs.forEach((doc) => {
        const tokens : Array<Map<string, string>> = doc.get("tokens");
        tokens.forEach((tokenData) => {
          const val = tokenData.get("token");
          if (val != null) {
            pushTokens.push(val);
          }
        });
      });

      if (pushTokens.length == 0) {
        logger.log("No push notes token for account.");
        return;
      } else {
        logger.log("pushTokens found: " + pushTokens.length);

        sendPushNotes(pushTokens, amount!, charTraitId, transactionId!);
      }
    });

// eslint-disable-next-line max-len,require-jsdoc
function sendPushNotes(tokens:Array<string>, amount:string, charTrait: string, transactionId: string) {
  logger.log("Sending push note to tokens: " + tokens);

  // eslint-disable-next-line max-len
  const message = charTrait === "" ? "You have received " + amount + "." : "You have received an appreciation and " + amount + ".";

  const payload = {
    tokens: tokens,
    notification: {
      title: "cloud function demo",
      body: message,
    },
    data: {
      transactionId: transactionId,
      message: message,
    },
  };

  admin.messaging().sendEachForMulticast(payload).then((response) => {
    // Response is a message ID string.
    logger.log("Successfully sent message:", response);
  }).catch((error) => {
    logger.log("Error sending message:", error);
  });
}

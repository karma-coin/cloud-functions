import {onRequest, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin = require("firebase-admin");
import {getFirestore} from "firebase-admin/firestore";
// import {messaging} from "firebase-admin";
// import BatchResponse = messaging.BatchResponse;

// init firebase admin
admin.initializeApp();

const db = getFirestore();
// Send push note to Karma Coin Transaction receiver account
export const processPaymentTransaction =
    onRequest(async (request, response) => {
      const toId : string = request.body.toId || "";
      if (toId === "") {
        logger.log("missing required toId parameter");
        throw new HttpsError("invalid-argument", "missing required toId param");
      }
      const amount = request.body.amount?.toString();
      if (amount === null) {
        logger.log("missing required amount parameter");
        throw new HttpsError("invalid-argument", "missing amount param");
      }

      const charTraitId = request.body.charTrait?.toString() || "";
      const emoji = request.body.emoji?.toString() || "🎉";
      const transactionId = request.body.txId?.toString();

      if (transactionId === null) {
        logger.log("missing required transaction id parameter");
        throw new HttpsError("invalid-argument", "missing transactionId param");
      }

      // const accountId = Buffer.from(toId, "base64").toString("utf-8");
      // logger.log("Payment tx to accountId: " + accountId);

      // Create a reference to the users collection
      const usersRef = db.collection("users");

      // Find all docs for account id
      const docs = await usersRef.where("accountId", "==", toId).get();

      if (docs.empty) {
        logger.log("No push notes token for account.");
        response.status(200).send("no push notes for account");
        return;
      }

      const pushTokens = new Array<string>();

      // collect all push tokens into pushTokens
      // note multiple tokens per doc possible
      docs.forEach((doc) => {
        const tokens: Array<any> = doc.get("tokens");
        tokens.forEach(function(tokenData) {
          const token = tokenData.token;
          if (token !== null) {
            pushTokens.push(token);
          }
        });
      });

      if (pushTokens.length == 0) {
        logger.log("No push notes token for account.");
        return;
      } else {
        logger.log("pushTokens found: " + pushTokens.length);

        sendPushNotes({
          tokens: pushTokens,
          amount: amount,
          charTrait: charTraitId,
          transactionId: transactionId,
          emoji: emoji,
        });

        response.status(200).send("push notes sent");
      }
    });

// eslint-disable-next-line max-len,require-jsdoc
function sendPushNotes({tokens, amount, charTrait, transactionId, emoji}: {
    tokens: Array<string>,
    amount: string,
    charTrait: string,
    transactionId: string,
    emoji: string
}) {
  logger.log("Sending push note to tokens: " + tokens);

  // eslint-disable-next-line max-len
  const message = charTrait === "" ? "You have received " + amount + " " + emoji + "." :
    "You have received an appreciation " + emoji + " and " + amount + ".";

  const payload = {
    tokens: tokens,
    notification: {
      title: "cloud function demo",
      body: message,
    },
    data: {
      txId: transactionId,
      message: message,
    },
  };

  admin.messaging().sendEachForMulticast(payload).then((response) => {
    // Response is a message ID string.
    logger.log("Successfully sent messages: " + response.successCount +
        ", failures: " + response.failureCount);

    response.responses.forEach((resp) => {
      if (!resp.success) {
        logger.log("response error: " + resp.error);
      } else {
        logger.log("message sent: " + resp.messageId);
      }
    });

    // todo: process response and delete tokens that are no longer valid
  }).catch((error) => {
    logger.log("Error sending message:", error);
  });
}

// // Cleans up the tokens that are no longer valid.
// // function cleanupTokens(response, tokens) {
//    // For each notification we check if there was an error.
//    const tokensDelete = [];
//    response.results.forEach((result, index) => {
//        const error = result.error;
//        if (error) {
// eslint-disable-next-line max-len
//            functions.logger.error('Failure sending notification to', tokens[index], error);
//            // Cleanup the tokens that are not registered anymore.
//            if (error.code === 'messaging/invalid-registration-token' ||
// eslint-disable-next-line max-len
//                error.code === 'messaging/registration-token-not-registered') {
//                // eslint-disable-next-line max-len
// eslint-disable-next-line max-len
//                const deleteTask = admin.firestore().collection('fcmTokens').doc(tokens[index]).delete();
//                tokensDelete.push(deleteTask);
//            }
//        }
//    });
//    return Promise.all(tokensDelete);
// }

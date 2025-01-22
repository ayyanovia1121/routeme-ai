// define routes and handle http request action
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

// event triggered by clerk webhook
import { WebhookEvent } from "@clerk/nextjs/server";

// verifying authentication of webhook using secret key
import { Webhook } from "svix";

// importing convex functions
import { api } from "./_generated/api";

// defining and handling http routes
const http = httpRouter();

// clerk webhook
http.route({
  path: "/clerk-webhook",
  method: "POST",

  // process the incoming webhook request
  handler: httpAction(async (ctx, request) => {
    // verifying authentication of webhook using secret key
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not set");
    }

    //   header from svix that requires verification of webhook's authentication
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing headers -- no svix headers", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    //   webhook verification
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Failed to verify webhook:", err);
      return new Response("Error verifying webhook", { status: 400 });
    }

    //   handling specific event types
    const eventType = evt.type;
    if (eventType === "user.created") {
      // save the user to convex db
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        // save user to db
        await ctx.runMutation(api.users.syncUser, { 
            userId: id, 
            email, 
            name 
        });
      } catch (error) {
        console.error("Error saving user to db:", error);
        return new Response("Error saving user to db", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;

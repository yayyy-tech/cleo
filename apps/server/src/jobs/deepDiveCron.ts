import cron from "node-cron";
import { supabaseAdmin } from "../db/supabase";

/**
 * Nightly deep dive cron — runs at 2:00 AM IST (8:30 PM UTC).
 * Analyzes each active user's recent financial data with Claude Opus.
 */
export function startDeepDiveCron(): void {
  cron.schedule("30 20 * * *", async () => {
    console.log("Deep dive cron starting...");

    try {
      // Get users who have transactions in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: activeUsers, error } = await supabaseAdmin
        .from("transactions")
        .select("user_id")
        .gte("transaction_date", sevenDaysAgo.toISOString());

      if (error || !activeUsers) {
        console.error("Deep dive cron: failed to fetch active users", error);
        return;
      }

      const uniqueUserIds = [...new Set(activeUsers.map((u) => u.user_id))];
      console.log(`Deep dive cron: ${uniqueUserIds.length} active users`);

      for (const userId of uniqueUserIds) {
        try {
          // TODO: Call deepDiveAgent.runDeepDive(userId)
          console.log(`Deep dive: processing user ${userId}`);
          await sleep(2000); // 2 second delay between users
        } catch (err) {
          console.error(`Deep dive failed for user ${userId}:`, err);
        }
      }

      console.log("Deep dive cron complete");
    } catch (err) {
      console.error("Deep dive cron error:", err);
    }
  });

  console.log("Deep dive cron scheduled (2:00 AM IST / 20:30 UTC)");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// supabase/functions/send-reminders/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";
// Import dayjs and plugins from CDN
import dayjs from "https://cdn.skypack.dev/dayjs";
import utc from "https://cdn.skypack.dev/dayjs/plugin/utc";
import timezone from "https://cdn.skypack.dev/dayjs/plugin/timezone";
// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
Deno.serve(async ()=>{
  console.log("inside function");
  const now = new Date();
  const tenMinLater = new Date(now.getTime() + 10 * 60 * 1000);
  const { data: blocks, error } = await supabase.from("study_blocks").select("id, user_id, title, start_time, profiles(email)").gt("start_time", now.toISOString()).lte("start_time", tenMinLater.toISOString()).eq("reminder_sent", false); // ✅ only fetch blocks not yet reminded
  if (error) {
    console.error(error);
    return new Response("Query error: " + error.message, {
      status: 500
    });
  }
  if (!blocks || blocks.length === 0) {
    return new Response("No blocks", {
      status: 200
    });
  }
  for (const block of blocks){
    const email = block.profiles?.email;
    if (!email) continue;
    // Convert start_time from GMT to IST
    const istTime = dayjs(block.start_time).tz("Asia/Kolkata").format("DD MMM YYYY, hh:mm A");
    const emailContent = `
Hello,

Just a friendly reminder from Quiet Hours Scheduler!

Your upcoming block "${block.title}" is scheduled to start at ${istTime} IST.

Use this time to focus, relax, or enjoy some uninterrupted quiet hours. Make the most of your scheduled block!

Cheers,
QUIETHOURS APP Team


`;
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email
              }
            ]
          }
        ],
        from: {
          email: "quiethour12@gmail.com",
          name: "QUIETHOURS APP"
        },
        subject: "Reminder: Upcoming Block",
        content: [
          {
            type: "text/plain",
            value: emailContent
          }
        ]
      })
    });
    console.log(`Email sent to ${email}`);
    await supabase.from("study_blocks").update({
      reminder_sent: true
    }).eq("id", block.id);
  }
  return new Response("Done", {
    status: 200
  });
});

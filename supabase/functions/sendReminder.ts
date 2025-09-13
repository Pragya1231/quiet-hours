// supabase/functions/send-reminders/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";
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
        subject: "Reminder: Upcoming Study Block",
        content: [
          {
            type: "text/plain",
            value: `Your block "${block.title}" starts at ${block.start_time}`
          }
        ]
      })
    });
    console.log(`Email sent to ${email}`);
    // ✅ Mark reminder as sent
    await supabase.from("study_blocks").update({
      reminder_sent: true
    }).eq("id", block.id);
  }
  return new Response("Done", {
    status: 200
  });
});

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export default async function handler(req: Request) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  const now = new Date();
  const tenMinLater = new Date(Date.now() + 10 * 60 * 1000);

  const { data: blocks } = await supabase
    .from('study_blocks')
    .select('id, user_id, start_time, users (email)')
    .gt('start_time', now.toISOString())
    .lte('start_time', tenMinLater.toISOString());

  if (!blocks) return new Response('No blocks', { status: 200 });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  for (const block of blocks) {
    const { data: existing } = await supabase
      .from('notifications_sent')
      .select('id')
      .eq('block_id', block.id)
      .eq('user_id', block.user_id)
      .maybeSingle();

    if (existing) continue;

    await transporter.sendMail({
      from: 'noreply@quiet-hours.com',
      to: block.users.email,
      subject: 'Quiet Hour Reminder',
      text: `Your quiet hour starts at ${block.start_time}`
    });

    await supabase.from('notifications_sent').insert({
      user_id: block.user_id,
      block_id: block.id
    });
  }

  return new Response('Done', { status: 200 });
}

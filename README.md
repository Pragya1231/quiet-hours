# Quiet Hours Scheduler

Tech Stack: Next.js, Supabase, MongoDB, TailwindCSS

# Goal: 
Authenticated users can create silent-study time blocks. A scheduled CRON function emails each user 10 minutes before their block starts, with no overlapping reminders per user.

Features

User Authentication via Supabase (sign-up, login, email confirmation).

Study Blocks: Users can create blocks for silent-study periods. Blocks are stored in the study_block table in Supabase.

User Profiles: Supabase profile table stores user details; rows are created automatically upon registration.

Email Notifications:

Registration confirmation emails.

Reminder emails 10 minutes before a scheduled study block starts.

History Logging: MongoDB stores the history of sent emails with fields:

userId

createdAt

type (register or reminder)

CRON Scheduler: Runs every minute to check upcoming blocks and send reminder emails using supabase edge functions. Ensures no duplicate reminders per user.

Local Testing

To run the project locally:

Clone the repository:

git clone <repository-url>
cd quiet-hours-scheduler-final/next-app


Install dependencies:

npm install


Build the project:

npm run build


Start the project:

npm start


Open your browser at: http://localhost:3000/register to create a new user.

Production Usage

Sign Up:

Register a new account if not already an existing user.

A confirmation email is sent to your registered email.

Click the confirmation link to be redirected to the dashboard.

Dashboard:

Add new study blocks specifying start and end times.

Blocks are saved in the study_block table in Supabase.

Email Reminders:

A CRON function runs every minute.

If a block’s start time is within 10 minutes of the current time, the user receives a reminder email.

Email reminders are logged in MongoDB.

Database Structure
Supabase

profile:

Stores user details.

Auto-created on registration.

study_block:

Stores user-created study blocks.

Fields include block ID, user ID, start time, end time, etc.

MongoDB

Stores email history:

userId – The ID of the user receiving the email.

createdAt – Timestamp when the email was sent.

type – Either register (confirmation) or reminder (block reminder).

Tech Highlights

Supabase:

Row-level events and triggers for authentication and data management.

Client-side signUp with emailRedirectTo ensures correct production redirects to dashboard.

Next.js:

Server-side API routes for handling notifications.

TailwindCSS for UI.

MongoDB Atlas:

Used to store email history.

Helps track all registration and reminder emails sent.

CRON Functionality:

Runs every minute.

Checks for blocks starting in the next 10 minutes.

Sends reminder emails without overlapping for a user.

Environment Variables

Make sure to configure the following in .env or on your deployment platform (Vercel):

NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
NEXT_PUBLIC_SITE_URL=<your_production_url>  # e.g., https://quiet-hours-one.vercel.app
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
MONGODB_URI=<your_mongo_atlas_connection_string>
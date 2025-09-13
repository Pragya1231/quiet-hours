import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);

  
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.push("/login");
      } else {
        setSession(data.session);
        fetchBlocks(data.session.user.id);
      }
    };
    getSession();
  }, [router]);

  // Fetch blocks for logged-in user
  const fetchBlocks = async (userId: string) => {
    const { data, error } = await supabase
      .from("study_blocks")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: true });

    if (!error && data) setBlocks(data);
  };

  // Add block
  const addBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    console.log("user id:", session.user.id);
    const { error } = await supabase.from("study_blocks").insert([
      {
        user_id: session.user.id,
        title,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      alert(error.message);
    } else {
      setTitle("");
      setStart("");
      setEnd("");
      fetchBlocks(session.user.id);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      
      <form onSubmit={addBlock} className="space-y-4">
        <input
          type="text"
          placeholder="Block Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Block
        </button>
      </form>

      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Your Blocks</h2>
        <ul className="space-y-2">
          {blocks.map((block) => (
            <li key={block.id} className="border p-3 rounded">
              <p className="font-medium">{block.title}</p>
              <p>
                {new Date(block.start_time).toLocaleString()} →{" "}
                {new Date(block.end_time).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [editingBlock, setEditingBlock] = useState<any>(null);

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

  const fetchBlocks = async (userId: string) => {
    const { data, error } = await supabase
      .from("study_blocks")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: true });

    if (!error && data) setBlocks(data);
  };

  const addBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    const { error } = await supabase.from("study_blocks").insert([
      {
        user_id: session.user.id,
        title,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      setTitle("");
      setStart("");
      setEnd("");
      fetchBlocks(session.user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Delete block
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this block?")) return;
    await supabase.from("study_blocks").delete().eq("id", id);
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  // Edit block
  const handleEdit = (block: any) => {
  setEditingBlock(block);
  setTitle(block.title);

  const formatToLocal = (dateStr: string) => {
    const d = new Date(dateStr);
    const tzOffset = d.getTimezoneOffset() * 60000; // offset in ms
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  setStart(formatToLocal(block.start_time));
  setEnd(formatToLocal(block.end_time));
};


  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;

    await supabase
      .from("study_blocks")
      .update({
        title,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      })
      .eq("id", editingBlock.id);

    setEditingBlock(null);
    setTitle("");
    setStart("");
    setEnd("");
    fetchBlocks(session.user.id);
  };

  const now = new Date();
  const upcomingBlocks = blocks.filter((b) => new Date(b.start_time) > now);
  const presentBlocks = blocks.filter(
    (b) => new Date(b.start_time) <= now && new Date(b.end_time) >= now
  );
  const pastBlocks = blocks.filter((b) => new Date(b.end_time) < now);

  const renderBlockList = (blocks: any[]) => (
    <ul className="space-y-2">
      {blocks.map((block) => (
        <li key={block.id} className="border p-3 rounded flex justify-between items-center">
          <div>
            <p className="font-medium">{block.title}</p>
            <p>
              {new Date(block.start_time).toLocaleString()} →{" "}
              {new Date(block.end_time).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(block)}
              className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(block.id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              🗑️
            </button>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Add / Edit Block Form */}
      <form
        onSubmit={editingBlock ? saveEdit : addBlock}
        className="space-y-4 mb-8"
      >
        {/* Block Title */}
        <label className="block font-medium">Block Title</label>
        <input
          type="text"
          placeholder="Block Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full"
          required
        />

        {/* Start Time */}
        <label className="block font-medium">Start Time</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-2 w-full"
          required
        />

        {/* End Time */}
        <label className="block font-medium">End Time</label>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-2 w-full"
          required
        />

        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${
            editingBlock
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {editingBlock ? "Save Changes" : "Add Block"}
        </button>

        {editingBlock && (
          <button
            type="button"
            onClick={() => {
              setEditingBlock(null);
              setTitle("");
              setStart("");
              setEnd("");
            }}
            className="ml-2 px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
          >
            Cancel
          </button>
        )}
      </form>


      {/* Upcoming Blocks */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Upcoming Blocks</h2>
        {upcomingBlocks.length ? renderBlockList(upcomingBlocks) : <p>No upcoming blocks</p>}
      </div>

      {/* Present Blocks */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Present Blocks</h2>
        {presentBlocks.length ? renderBlockList(presentBlocks) : <p>No blocks currently running</p>}
      </div>

      {/* Past Blocks */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Past Blocks</h2>
        {pastBlocks.length ? renderBlockList(pastBlocks) : <p>No past blocks</p>}
      </div>
    </div>
  );
}

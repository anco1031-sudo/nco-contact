import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Post } from "../lib/types";
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";
import { MessageCircle, Loader2 } from "lucide-react";

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบโพสต์นี้?")) return;
    await supabase.from("posts").delete().eq("id", id);
    await fetchPosts();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
          <MessageCircle className="text-[#c9a227]" size={32} />
          กระดานสนทนา
        </h1>
        <p className="mt-1 text-[#64748b] text-sm">พูดคุย แลกเปลี่ยน กับเพื่อนๆ รุ่น 1333</p>
      </div>

      {/* New post form */}
      <div className="mb-6">
        <PostForm onAdded={fetchPosts} />
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="text-center py-16"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0]">
          <MessageCircle className="mx-auto text-[#cbd5e1] mb-3" size={48} />
          <p className="text-[#64748b]">ยังไม่มีโพสต์ — เริ่มเขียนเลย!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

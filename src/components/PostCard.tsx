import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Comment as CommentType, Post } from "../lib/types";
import { MessageSquare, Send, Trash2, User } from "lucide-react";

export default function PostCard({ post, onDelete }: { post: Post; onDelete?: (id: string) => void }) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch comment count on mount (lightweight)
  useEffect(() => {
    async function fetchCount() {
      const { count } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);
      setCommentCount(count ?? 0);
    }
    fetchCount();
  }, [post.id]);

  // Fetch full comments only when expanded
  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (data) {
      setComments(data);
      setCommentCount(data.length);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;
    setSending(true);
    await supabase.from("comments").insert({
      post_id: post.id,
      content: newComment.trim(),
      author_name: authorName.trim(),
    });
    setNewComment("");
    await fetchComments();
    setSending(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
      {/* Post content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-xs font-bold">
            <User size={14} />
          </div>
          <div>
            <span className="text-sm font-semibold text-[#1e3a5f]">{post.author_name}</span>
            <span className="text-xs text-[#94a3b8] ml-2">
              {new Date(post.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
        <p className="text-sm text-[#334155] whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex items-center gap-3">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#1e3a5f] font-medium transition-colors"
        >
          <MessageSquare size={14} />
          {showComments ? "ซ่อน" : "คอมเมนต์"} ({commentCount})
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-1 text-xs text-[#94a3b8] hover:text-red-500 font-medium transition-colors ml-auto"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-[#e2e8f0] bg-[#f8fafc]">
          {comments.length > 0 && (
            <div className="px-5 py-3 space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center text-[#1e3a5f] text-[10px] font-bold shrink-0 mt-0.5">
                    <User size={10} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#1e3a5f]">{c.author_name}</span>
                    <span className="text-[10px] text-[#94a3b8] ml-2">
                      {new Date(c.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </span>
                    <p className="text-xs text-[#475569] mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddComment} className="px-5 py-3 border-t border-[#e2e8f0] flex gap-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="ชื่อ"
              className="w-24 px-2 py-1.5 border border-[#cbd5e1] rounded-lg text-xs focus:ring-1 focus:ring-[#1e3a5f]/20 outline-none"
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="เขียนคอมเมนต์..."
              className="flex-1 px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-xs focus:ring-1 focus:ring-[#1e3a5f]/20 outline-none"
            />
            <button type="submit" disabled={sending || !newComment.trim()}
              className="p-1.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5986] transition-colors disabled:opacity-40">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

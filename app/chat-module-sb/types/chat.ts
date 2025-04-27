
export type Message = {
  id?: string; // DBから取得時には存在、手動追加時には不要
  session_id: string;
  role: "user" | "assistant";
  text: string;
  created_at: string;
};

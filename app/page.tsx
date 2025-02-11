// app/page.tsx (ログインページにリダイレクト)
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // ログインページへリダイレクト
  return null;
}
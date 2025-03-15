"use client";
import Link from "next/link";

export default function HeaderPublic() {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">AIforyou</h1>
      <nav>
        <Link href="/login" className="mr-4">ログイン</Link>
        <Link href="/signup">新規登録</Link>
      </nav>
    </header>
  );
}

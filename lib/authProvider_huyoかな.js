// lib/authProvider.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔄 セッション取得と監視
  useEffect(() => {
     // ✅ 追記開始：reset-password ページではセッションチェックをスキップ
    if (window?.location?.pathname === "/reset-password") {
      setLoading(false);
      return;
    }
    // ✅ 追記終了
    const getSession = async () => {
      const {
  data: { session },
  error: sessionError,
} = await supabase.auth.getSession();

const supaUser = session?.user;

      if (supaUser) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("id, email, role, status")
          .eq("id", supaUser.id)
          .single();

        if (!error && userData) {
          setUser({ ...userData }); // { id, email, role, status }
        }
      }

      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const supaUser = session?.user;
      if (supaUser) {
        supabase
          .from("users")
          .select("id, email, role, status")
          .eq("id", supaUser.id)
          .single()
          .then(({ data }) => {
            if (data) setUser(data);
          });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // 🚪 ログアウト処理
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

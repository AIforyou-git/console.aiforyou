'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import scrapingClient from '@/lib/supabaseScrapingClient';

export default function CustomizeCategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const numericId = Number(id);

  const [currentPersonal, setCurrentPersonal] = useState([]);
  const [currentSubcategory, setCurrentSubcategory] = useState([]);

  const [personalOptions, setPersonalOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);

  const [checkedPersonal, setCheckedPersonal] = useState([]);
  const [checkedSubcategory, setCheckedSubcategory] = useState([]);

  // 初期値取得
  useEffect(() => {
    const fetchCurrent = async () => {
      const { data, error } = await scrapingClient
        .from('jnet_articles_public')
        .select('structured_personal_category, structured_subcategory')
        .eq('article_id', numericId)
        .single();

      if (!error && data) {
        const personal = Array.isArray(data.structured_personal_category)
          ? data.structured_personal_category
          : typeof data.structured_personal_category === 'string'
            ? data.structured_personal_category.split(',').map((s) => s.trim())
            : [];

        const sub = Array.isArray(data.structured_subcategory)
          ? data.structured_subcategory
          : typeof data.structured_subcategory === 'string'
            ? data.structured_subcategory.split(',').map((s) => s.trim())
            : [];

        setCurrentPersonal(personal);
        setCheckedPersonal(personal);
        setCurrentSubcategory(sub);
        setCheckedSubcategory(sub);
      } else {
        console.error('記事データ取得失敗:', error?.message);
      }
    };

    if (numericId) fetchCurrent();
  }, [numericId]);

  // 候補リスト取得
  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await scrapingClient
        .from('industry_category_mapping_api')
        .select('refined_personal_category, subcategory');

      if (!error && data) {
        const personalSet = new Set();
        const subcatSet = new Set();
        data.forEach(({ refined_personal_category, subcategory }) => {
          if (refined_personal_category) personalSet.add(refined_personal_category);
          if (subcategory) subcatSet.add(subcategory);
        });
        setPersonalOptions(Array.from(personalSet).slice(0, 20));
        setSubcategoryOptions(Array.from(subcatSet).slice(0, 100));
      } else {
        console.error('候補取得失敗:', error?.message);
      }
    };

    fetchOptions();
  }, []);

  const handleToggle = (value, setFunc, state) => {
    setFunc(
      state.includes(value)
        ? state.filter((v) => v !== value)
        : [...state, value]
    );
  };

  const handleSave = async () => {
    const update = {
      structured_personal_category: checkedPersonal.join(', '),
      structured_subcategory: checkedSubcategory.join(', '),
    };

    const { error } = await scrapingClient
      .from('jnet_articles_public')
      .update(update)
      .eq('article_id', numericId);

    if (error) {
      console.error('保存エラー:', error.message);
    } else {
      router.push(`/admin-dashboard/news-control/edit/${id}`);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">カテゴリ手動編集</h1>

      <section className="mb-6">
        <p className="text-sm mb-1 text-gray-500">現在の「わたしごと」:</p>
        <div className="text-sm text-gray-800 mb-2">{currentPersonal.join(', ') || 'なし'}</div>
        <div className="grid grid-cols-2 gap-2">
          {personalOptions.map((item) => (
            <label key={item} className="flex items-center">
              <input
                type="checkbox"
                checked={checkedPersonal.includes(item)}
                onChange={() => handleToggle(item, setCheckedPersonal, checkedPersonal)}
              />
              <span className="ml-2">{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <p className="text-sm mb-1 text-gray-500">現在の「業種」:</p>
        <div className="text-sm text-gray-800 mb-2">{currentSubcategory.join(', ') || 'なし'}</div>
        <div className="grid grid-cols-2 gap-2">
          {subcategoryOptions.map((item) => (
            <label key={item} className="flex items-center">
              <input
                type="checkbox"
                checked={checkedSubcategory.includes(item)}
                onChange={() => handleToggle(item, setCheckedSubcategory, checkedSubcategory)}
              />
              <span className="ml-2">{item}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          保存
        </button>
        <button
          onClick={() => router.push(`/admin-dashboard/news-control/edit/${id}`)}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          戻る
        </button>
      </div>
    </div>
  );
}

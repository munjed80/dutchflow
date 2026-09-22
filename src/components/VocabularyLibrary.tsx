"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { CourseModule } from "@/lib/content";
import { filterVocabulary, type VocabularyEntry } from "@/lib/vocabulary";
import { AudioButton } from "./AudioButton";
import { SaveReviewButton } from "./SaveReviewButton";

const kinds: Record<string, string> = { noun: "اسم", verb: "فعل", expression: "تعبير" };
const pageSize = 24;

export function VocabularyLibrary({ entries, modules }: { entries: VocabularyEntry[]; modules: CourseModule[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [moduleId, setModuleId] = useState("all");
  const [limit, setLimit] = useState(pageSize);
  const input = useRef<HTMLInputElement>(null);
  const matches = filterVocabulary(entries, query, kind, moduleId);
  const visible = matches.slice(0, limit);
  function clear() {
    setQuery(""); setKind("all"); setModuleId("all"); setLimit(pageSize);
    input.current?.focus();
  }

  return <>
    <div className="panel vocabulary-tools">
      <label className="search-label" htmlFor="vocabulary-search">ابحث عن كلمة أو معنى</label>
      <input ref={input} id="vocabulary-search" type="search" dir="auto" className="lesson-search" maxLength={120}
        placeholder="مثلاً: kinderen، يسكن، mijn naam" value={query}
        onChange={(event) => { setQuery(event.target.value); setLimit(pageSize); }} />
      <div className="vocabulary-filters">
        <div className="vocabulary-filter"><label htmlFor="vocabulary-kind">نوع المفردة</label><select id="vocabulary-kind" value={kind}
          onChange={(event) => { setKind(event.target.value); setLimit(pageSize); }}>
          <option value="all">كل الأنواع</option>{Object.entries(kinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></div>
        <div className="vocabulary-filter"><label htmlFor="vocabulary-module">الوحدة</label><select id="vocabulary-module" value={moduleId}
          onChange={(event) => { setModuleId(event.target.value); setLimit(pageSize); }}>
          <option value="all">كل الوحدات</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
        </select></div>
        <button className="button button-secondary" type="button" onClick={clear}>مسح البحث والتصفية</button>
      </div>
      <p className="catalogue-results" role="status">النتائج: {matches.length} من {entries.length} مدخلاً · المعروض: {visible.length}</p>
    </div>
    {matches.length === 0 ? <div className="panel vocabulary-empty"><h2>لا توجد مفردات مطابقة</h2><p>جرّب جزءاً من الكلمة أو معناها، أو غيّر نوع المفردة والوحدة.</p></div> :
      <div className="vocabulary-grid">{visible.map((entry) => <article className="panel vocabulary-card" key={entry.id}>
        <span className="eyebrow">{kinds[entry.kind] ?? entry.kind} · {entry.lessonTitle}</span>
        <h2 lang="nl" dir="ltr">{entry.term}</h2>
        <p>{entry.meaning}</p>
        <p className="vocabulary-forms" lang="nl" dir="ltr">{entry.forms}</p>
        <h3>مثال من الدرس</h3>
        <p className="vocabulary-example" lang="nl" dir="ltr">{entry.example}</p>
        <p className="quiet">{entry.translation}</p>
        <AudioButton id={entry.phraseId} text={entry.example} />
        <div className="vocabulary-actions"><SaveReviewButton ids={[entry.phraseId]} compact />
          <Link className="text-link" href={`/learn/${entry.lessonSlug}`}>افتح الدرس ←</Link></div>
      </article>)}</div>}
    {matches.length > pageSize && <div className="vocabulary-more"><button className="button button-secondary" type="button"
      disabled={visible.length === matches.length} onClick={() => setLimit((current) => current + pageSize)}>
      {visible.length === matches.length ? "عُرضت جميع النتائج" : "اعرض المزيد من المفردات"}
    </button></div>}
  </>;
}

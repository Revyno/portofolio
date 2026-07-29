"use client";

import { PageChrome } from "@/components/site/Chrome";
import { Shell, Section, Eyebrow } from "@/components/site/primitives";
import { usePosts } from "@/lib/store";

function fmt(iso: string): string {
  // deterministic, locale-free date (avoid hydration drift)
  const [y, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(m) - 1]} ${Number(d)}, ${y}`;
}

export default function WritingPage() {
  const posts = usePosts()
    .filter((p) => p.published)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return (
    <PageChrome>
      <Shell>
        <Section border={false} className="pt-12 md:pt-20">
          <Eyebrow>{posts.length} posts</Eyebrow>
          <h1 className="text-[54px] font-bold leading-[0.9] tracking-[-0.05em] text-white md:text-[92px]">
            Writing
          </h1>

          <div className="mt-10 border-t border-[var(--line)]">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group grid grid-cols-1 gap-2 border-b border-[var(--line)] py-6 transition-colors hover:bg-[var(--accent-hover)] md:grid-cols-[140px_1fr_120px] md:items-baseline md:gap-6"
              >
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
                  {fmt(post.publishedAt)}
                </div>
                <div>
                  <h2 className="text-[20px] font-bold tracking-[-0.03em] text-white md:text-[24px]">
                    {post.title}
                  </h2>
                  <p className="mt-1 text-[14px] text-[var(--t-body)]">{post.dek}</p>
                </div>
                <div className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--t-label)] md:text-right">
                  {post.topic} · {post.readMinutes} min
                </div>
              </article>
            ))}
          </div>
        </Section>
      </Shell>
    </PageChrome>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityCategoryView } from "@/app/_components/CommunityCategoryView";
import {
  communityCategorySlugs,
  communityCopy,
  isCommunityCategorySlug,
} from "@/content/community";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return communityCategorySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = communityCopy.en.categories.items.find(
    (item) => item.slug === slug,
  );

  return {
    title: `${category?.name ?? "Community category"} | Fat Fitness Community`,
    description:
      category?.description ??
      "A planned forum category for the Fat Fitness Community peer-support forum.",
  };
}

export default async function CommunityCategoryPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isCommunityCategorySlug(slug)) {
    notFound();
  }

  return <CommunityCategoryView slug={slug} />;
}

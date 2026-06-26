'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CategoryPage() {
  const params = useParams();
  const catKey = Array.isArray(params.category) ? params.category[0] : params.category;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/#${catKey}`);
  }, [catKey, router]);

  return null;
}

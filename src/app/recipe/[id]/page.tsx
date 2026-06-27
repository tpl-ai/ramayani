'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RecipeRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  useEffect(() => { router.replace(`/resep/${id}`); }, [router, id]);
  return null;
}

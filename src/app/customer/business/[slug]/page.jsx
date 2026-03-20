"use client";

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft,
  Loader2,
  Bot,
  Info
} from 'lucide-react';
import { notFound } from 'next/navigation';
import BusinessStorefront from '@/components/business/BusinessStorefront';

export default function BusinessProfilePage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/businesses?slug=${slug}`);
        const data = await res.json();
        if (data.success && data.business) {
          setBusiness(data.business);
        } else {
          setBusiness(false); // Trigger not found
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [slug]);

  if (loading) {
    return (
      <DashboardLayout title="Loading Profile...">
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#00D18F]/20 border-t-[#00D18F] rounded-full animate-spin"></div>
            <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#00D18F]" />
          </div>
          <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Merchant Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (business === false) {
    notFound();
  }

  return (
    <DashboardLayout title={`${business?.name}`}>
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 p-6 md:p-10">
        <div className="flex items-center gap-6 pb-10 border-b border-zinc-100 dark:border-white/5">
          <Link href={`/customer/find-business`}>
            <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0A0A0A] hover:bg-zinc-50 dark:hover:bg-white/5 transition-all shadow-sm">
              <ChevronLeft className="w-6 h-6 text-zinc-500" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Merchant Presence</h1>
            <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white transition-colors">Official Storefront</p>
          </div>
        </div>

        <BusinessStorefront business={business} />
      </div>
    </DashboardLayout>
  );
}

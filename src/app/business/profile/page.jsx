"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft,
  Loader2,
  Edit,
  Eye,
  Bot
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import BusinessStorefront from '@/components/business/BusinessStorefront';

export default function BusinessProfilePreviewPage() {
  const { user, loading: authLoading } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await fetch('/api/businesses');
        const data = await res.json();
        if (data.success && data.business) {
          setBusiness(data.business);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchBusiness();
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <DashboardLayout title="Presence">
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#00D18F]/20 border-t-[#00D18F] rounded-full animate-spin"></div>
            <Eye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#00D18F]" />
          </div>
          <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px]">Preparing Preview...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Presence">
      <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 py-10 px-6">
        
        {/* Management Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-6">
            <Link href="/business/dashboard">
              <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0A0A0A] hover:bg-zinc-50 dark:hover:bg-white/5 transition-all shadow-sm">
                <ChevronLeft className="w-6 h-6 text-zinc-500" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white transition-colors">Storefront Preview</h1>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
                  Live View
                </Badge>
              </div>
              <p className="text-[14px] font-medium text-zinc-400 dark:text-zinc-600">See exactly what your customers see when they visit your storefront.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/business/settings" className="w-full sm:w-auto">
              <Button className="w-full h-14 px-10 bg-[#00D18F] hover:bg-[#00D18F]/90 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-[#00D18F]/20">
                <Edit size={16} />
                Modify Profile
              </Button>
            </Link>
            <Link href={`/business/${business?.slug}`} target="_blank">
               <Button variant="outline" className="w-full sm:w-auto h-14 px-6 rounded-2xl border-zinc-200 dark:border-white/5 font-black uppercase tracking-[0.2em] text-[10px]">
                 <Eye size={16} />
               </Button>
            </Link>
          </div>
        </div>

        {/* The Re-designed Storefront Component */}
        <BusinessStorefront business={business} isPreview={true} />

        {/* Bottom Tip */}
        <div className="mt-12 p-8 bg-zinc-50 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-6 transition-all hover:bg-zinc-100 dark:hover:bg-white/[0.04]">
          <div className="w-14 h-14 bg-white dark:bg-black rounded-2xl flex items-center justify-center shadow-xl border border-zinc-100 dark:border-white/5 shrink-0">
             <Bot className="w-7 h-7 text-[#00D18F]" />
          </div>
          <div className="text-center sm:text-left space-y-1">
             <h4 className="text-[13px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">AI Training Active</h4>
             <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 max-w-lg">Your AI assistant is currently learning from this profile. Any changes you make will be updated in its knowledge base immediately.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

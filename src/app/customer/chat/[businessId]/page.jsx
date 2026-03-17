"use client";

import React, { use, useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatInterface from '@/components/chat/ChatInterface';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function BusinessChatPage({ params }) {
  const resolvedParams = use(params);
  const { businessId: routeId } = resolvedParams;
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [initialConversationId, setInitialConversationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        // 1. Try to resolve the route id as a conversation id first.
        const convRes = await fetch(`/api/conversations?conversationId=${routeId}`);
        const convData = await convRes.json();
        if (convData.success && convData.conversations?.length > 0) {
          const existingConversation = convData.conversations[0];
          setInitialConversationId(existingConversation.id);

          const res = await fetch('/api/businesses?public=true');
          const data = await res.json();
          if (data.success) {
            const foundBusiness = data.businesses.find(b => b.id === existingConversation.business_id);
            if (foundBusiness) {
              setBusiness(foundBusiness);
              return;
            }
          }
        }

        // 2. Fallback: treat route id as business id (first-time chat).
        const res = await fetch('/api/businesses?public=true');
        const data = await res.json();
        if (data.success) {
          const found = data.businesses.find(b => b.id === routeId);
          if (found) {
            setBusiness(found);
            setInitialConversationId(null);
          } else {
            setBusiness(false);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Failed to load business details');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [routeId]);

  if (loading) {
    return (
      <DashboardLayout title="Loading Concierge...">
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="w-12 h-12 animate-spin text-[#00D18F]" />
        </div>
      </DashboardLayout>
    );
  }

  if (business === false) {
    notFound();
  }

  return (
    <DashboardLayout title={`Chat with ${business?.name}`}>
      <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col max-w-5xl mx-auto">
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            business={business}
            userName={user?.name}
            initialConversationId={initialConversationId}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

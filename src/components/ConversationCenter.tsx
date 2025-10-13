import React from 'react';
import { Chat } from '@/components/Chat';

interface ConversationCenterProps {
  selectedFileIds?: string[];
  className?: string;
}

export function ConversationCenter({ selectedFileIds = [], className = '' }: ConversationCenterProps) {
  return (
    <div className={`h-[900px] ${className}`}>
      <Chat selectedFileIds={selectedFileIds} className="h-full" />
    </div>
  );
}
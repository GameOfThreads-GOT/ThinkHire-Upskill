import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import GroupDiscussion from '../components/GroupDiscussion';

const GroupDiscussionPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
      <Header title="Group Discussion Practice" />
      
      <main className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-8 bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-6 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
          <h2 className="text-3xl mb-2 text-[var(--xai-text-primary)] font-bold">Practice Group Discussions</h2>
          <p className="text-[var(--xai-text-secondary)] mb-4">
            Improve your group discussion skills with AI-powered feedback
          </p>
          
          <div className="mt-6">
            <GroupDiscussion />
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupDiscussionPage;
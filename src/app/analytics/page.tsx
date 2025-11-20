// src/app/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SentimentChart from '@/components/SentimentChart';
import TopicsChart from '@/components/TopicsChart';
import TimelineChart from '@/components/TimelineChart';

interface Analytics {
  sentiment: { positive: number; negative: number; neutral: number; mixed: number };
  engagement: { high: number; medium: number; low: number };
  topics: string[];
  phrases: string[];
  averageToxicity: number;
  averageSentiment: number;
  totalAnalyzed: number;
  timeline: Array<{ date: string; sentiment: number }>;
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  const handleAnalyze = async () => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const platform = url.includes('youtube') ? 'youtube' : 'reddit';
      const endpoint = `/api/analyze/${platform}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const data = await response.json();
      setVideoId(data.videoId);

      // Fetch analytics
      const analyticsResponse = await fetch(
        `/api/analytics?videoId=${data.videoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">CommentIQ</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Analyze Comments</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube or Reddit URL..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {error && (
            <p className="text-red-600 mt-2">{error}</p>
          )}
        </div>

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SentimentChart data={analytics.sentiment} />
            <TopicsChart topics={analytics.topics} />
            <TimelineChart timeline={analytics.timeline} />
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Metrics</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Total Analyzed:</span> {analytics.totalAnalyzed}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Avg Toxicity:</span>{' '}
                  {(analytics.averageToxicity * 100).toFixed(1)}%
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Avg Sentiment:</span>{' '}
                  {(analytics.averageSentiment * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Search, Loader2, Globe, Wind, Droplets, Leaf, Volume2, ExternalLink, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const CACHE_KEY = 'ecowatch_news_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

const topics = [
    { label: 'Air Quality', query: 'air_quality', icon: Wind, color: 'bg-sky-50 text-sky-600 border-sky-100' },
    { label: 'Water Quality', query: 'water_quality', icon: Droplets, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Biodiversity', query: 'biodiversity', icon: Leaf, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Noise Pollution', query: 'noise', icon: Volume2, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Climate India', query: 'climate_india', icon: Globe, color: 'bg-violet-50 text-violet-600 border-violet-100' }
];

const fallbackArticles: Record<string, any[]> = {
    'Air Quality': [
        { headline: "Delhi Air Quality Strategy: 2026 Shift Towards Green Zones", summary: "Municipal authorities announce new protocol for localized air purification corridors across NCR to mitigate seasonal smog peaks.", source_name: "TOI News", url: "https://timesofindia.indiatimes.com/india/pollution", publication_date: "Feb 26, 2026", impact_level: "Medium" },
        { headline: "Industrial Emission Caps: New Guidelines for Factories", summary: "Central Pollution Control Board issues strict new particulate matter limits for thermal plants across northern India.", source_name: "HT News", url: "https://www.hindustantimes.com/india-news", publication_date: "Feb 26, 2026", impact_level: "High" }
    ],
    'Water Quality': [
        { headline: "Ganga Rejuvenation: New Treatment Hubs Active", summary: "The Clean Ganga mission reaches Phase 4 with 15 advanced bio-filtration plants coming online in Uttar Pradesh and Bihar.", source_name: "The Hindu", url: "https://www.thehindu.com/news/national", publication_date: "Feb 26, 2026", impact_level: "Low" },
        { headline: "River Oxygen Levels Monitoring: Real-time Sensors Deployed", summary: "Water quality sensors installed across major river stretches to monitor dissolved oxygen and toxin levels daily.", source_name: "Livemint", url: "https://www.livemint.com", publication_date: "Feb 26, 2026", impact_level: "Medium" }
    ],
    'General': [
        { headline: "National Environmental Policy Update: 2026 Roadmap", summary: "Ministry of Environment releases comprehensive roadmap for plastic neutrality and urban greening by 2030.", source_name: "PIB India", url: "https://pib.gov.in", publication_date: "Feb 26, 2026", impact_level: "Low" }
    ]
};

export default function NewsFeed({ initialCategory }: { initialCategory?: string }) {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [customQuery, setCustomQuery] = useState('');
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const fetchNews = useCallback(async (query: string, isManual = false, topicLabel: string | null = null) => {
        // Check cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (!isManual && cached) {
            const { timestamp, data, query: cachedQuery } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION && cachedQuery === query) {
                setArticles(data);
                setLastUpdated(timestamp);
                return;
            }
        }

        // Set local fallback articles immediately for responsiveness
        const category = topicLabel || activeTopic || 'General';
        const initialFallback = fallbackArticles[category] || fallbackArticles['General'] || [];

        // Only set fallback if we have no articles yet
        if (articles.length === 0) {
            setArticles(initialFallback);
        }

        setLoading(true);

        try {
            const url = `http://localhost:8001/api/v1/news?category=${query}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setArticles(data);
                const now = Date.now();
                setLastUpdated(now);
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: now,
                    data: data,
                    query: query
                }));
            }
        } catch (err) {
            console.error("News Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [articles.length, activeTopic]);

    useEffect(() => {
        const query = initialCategory || 'all';
        const topic = topics.find(t => t.query === query || t.label.toLowerCase().includes(query.toLowerCase()));
        fetchNews(query, false, topic?.label || 'General');
        if (topic) setActiveTopic(topic.label);
    }, [fetchNews, initialCategory]);

    const handleTopicClick = (topic: any) => {
        setActiveTopic(topic.label);
        fetchNews(topic.query, true, topic.label);
    };

    const handleCustomSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (customQuery.trim()) {
            setActiveTopic(null);
            fetchNews(customQuery.trim(), true, 'General');
        }
    };

    const getImpactColor = (level: string) => {
        const l = level?.toLowerCase();
        if (l?.includes('high')) return 'bg-rose-100 text-rose-600 border-rose-200';
        if (l?.includes('medium')) return 'bg-amber-100 text-amber-600 border-amber-200';
        if (l?.includes('low') || l?.includes('positive') || l?.includes('trend')) return 'bg-emerald-100 text-emerald-600 border-emerald-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
            {/* Header Section */}
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-100 group">
                            <Newspaper className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Environmental News & Intelligence</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-slate-800 text-slate-500 border-slate-100">Daily Updates</Badge>
                                {lastUpdated && (
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                        <Clock className="w-3 h-3" /> Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => fetchNews(activeTopic ? topics.find(t => t.label === activeTopic)?.query! : 'all', true)}
                            disabled={loading}
                            className="rounded-xl border-slate-200 h-10 px-4 font-bold text-xs gap-2 group hover:bg-slate-50 active:scale-95"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Filters & Search */}
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        {topics.map((topic) => (
                            <button
                                key={topic.label}
                                onClick={() => handleTopicClick(topic)}
                                disabled={loading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border transition-all active:scale-95 hover:shadow-lg ${activeTopic === topic.label
                                    ? `${topic.color.split(' ')[0]} ${topic.color.split(' ')[1]} ring-2 ring-teal-500 shadow-xl shadow-teal-100/30`
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-teal-200'
                                    }`}
                            >
                                <topic.icon className="w-3.5 h-3.5" />
                                {topic.label.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleCustomSearch} className="relative group">
                        <Input
                            placeholder="Search specific keywords (e.g. 'Yamuna Foam', 'Electric Buses Mumbai')..."
                            value={customQuery}
                            onChange={e => setCustomQuery(e.target.value)}
                            className="pl-5 pr-32 h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium text-sm focus:ring-2 focus:ring-teal-500 shadow-inner"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            disabled={loading || !customQuery.trim()}
                            className="absolute right-2 top-2 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold px-6 text-xs gap-2 shadow-lg shadow-teal-200 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                            SEARCH
                        </Button>
                    </form>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {loading && articles.length === 0 ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-32 gap-6"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-teal-50 border-t-teal-500 animate-spin" />
                                    <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-teal-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-1">Live Intelligence Active</p>
                                    <p className="text-xs text-slate-500 font-medium">Fetching newest reports for {activeTopic || 'India'}...</p>
                                </div>
                            </motion.div>
                        ) : articles.length > 0 ? (
                            <motion.div
                                key="articles"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                            >
                                {articles.map((article: any, i: number) => (
                                    <motion.a
                                        key={i}
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex flex-col bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-2xl hover:shadow-teal-900/10 hover:-translate-y-1 transition-all duration-500 relative cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <Badge variant="outline" className={`${getImpactColor(article.impact_level || article.risk_level)} border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1`}>
                                                {article.impact_level || article.risk_level || 'Medium'} Impact
                                            </Badge>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="w-4 h-4 text-teal-600" />
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-base font-black text-slate-900 dark:text-white mb-2 leading-tight line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                                {article.headline || article.title}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 line-clamp-3 italic">
                                                "{article.summary}"
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/20 flex items-center justify-center">
                                                    <Globe className="w-3 h-3 text-teal-600" />
                                                </div>
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                                                    {article.source_name || article.source}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                    {article.publication_date || article.date}
                                                </span>
                                                <div className="flex items-center gap-1 text-teal-600 font-bold text-[10px] uppercase tracking-tighter hover:underline decoration-2 underline-offset-4">
                                                    Read Full Story <ExternalLink className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.a>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-40 text-center"
                            >
                                <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 rotate-6 group hover:rotate-0 transition-transform">
                                    <AlertTriangle className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Intelligence Void</h3>
                                <p className="text-sm text-slate-500 font-medium max-w-sm leading-relaxed">
                                    The news engine returned no valid results for this query. Try widening your search parameters or check your network connection.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

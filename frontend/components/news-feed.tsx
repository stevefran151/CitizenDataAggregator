"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, Wind, Droplets, Mountain, ArrowUpRight, Clock, AlertTriangle } from "lucide-react";

interface NewsArticle {
    id: number;
    title: string;
    description: string;
    category: string;
    location: string;
    timestamp: string;
    url: string;
    impact_score: number;
}

export default function NewsFeed({ category }: { category?: string }) {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const url = category
                    ? `http://localhost:8000/api/v1/news?category=${category}`
                    : `http://localhost:8000/api/v1/news`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setNews(data);
                }
            } catch (error) {
                console.error("Failed to fetch news", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [category]);

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'air': return <Wind className="w-4 h-4" />;
            case 'water': return <Droplets className="w-4 h-4" />;
            case 'soil': return <Mountain className="w-4 h-4" />;
            default: return <Globe className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((article) => (
                <Card key={article.id} className="group overflow-hidden border-slate-200 hover:border-indigo-500 transition-all hover:shadow-xl hover:shadow-indigo-50/50">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {getIcon(article.category)}
                                {article.category} vector
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                <Clock className="w-3 h-3" />
                                {new Date(article.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <CardTitle className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                            {article.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            {article.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                <Globe className="w-3 h-3 inline mr-1" />
                                {article.location}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-black text-slate-400 uppercase leading-none">Impact</span>
                                    <span className="text-xs font-black text-rose-500">{article.impact_score}/10</span>
                                </div>
                                <a
                                    href={article.url}
                                    target="_blank"
                                    className="p-2 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition-all"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

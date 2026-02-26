"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    MessageSquare,
    Send,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Zap,
    Bug
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackForm() {
    const [formData, setFormData] = useState({
        user_name: '',
        email: '',
        category: 'general_query',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:8001/api/v1/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsSuccess(true);
                setFormData({ user_name: '', email: '', category: 'general_query', message: '' });
                setTimeout(() => setIsSuccess(false), 5000);
            }
        } catch (error) {
            console.error("Feedback submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { id: 'general_query', label: 'General Query', icon: HelpCircle, color: 'text-blue-500' },
        { id: 'feature_request', label: 'Feature Request', icon: Zap, color: 'text-amber-500' },
        { id: 'bug', label: 'Report a Bug', icon: Bug, color: 'text-red-500' },
    ];

    return (
        <Card className="max-w-2xl mx-auto border-none shadow-none bg-transparent">
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                    Planetary Feedback & Queries
                </CardTitle>
                <p className="text-slate-500 text-sm font-medium">
                    Help us refine the Mechovate engine. Your queries are cross-referenced with our scientific protocols to improve global data synthesis.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Name</label>
                            <Input
                                required
                                value={formData.user_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, user_name: e.target.value })}
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-indigo-500"
                                placeholder="Citizen Scientist"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                            <Input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-indigo-500"
                                placeholder="contact@domain.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Query Category</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${formData.category === cat.id
                                        ? 'border-indigo-600 bg-indigo-50/50'
                                        : 'border-slate-100 bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <cat.icon className={`w-5 h-5 ${cat.color} group-hover:scale-110 transition-transform`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message / Query Details</label>
                        <Textarea
                            required
                            value={formData.message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                            className="min-h-[160px] rounded-2xl bg-slate-50 border-slate-100 focus:ring-indigo-500 p-4 font-medium"
                            placeholder="Describe your environmental query or platform feedback here..."
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <AnimatePresence>
                            {isSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex items-center gap-2 text-emerald-600 font-bold text-sm"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Transmission Received!
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-14 px-10 bg-indigo-600 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95 ml-auto"
                        >
                            {isSubmitting ? "Transmitting..." : (
                                <div className="flex items-center gap-2">
                                    Secure Submit <Send className="w-4 h-4 ml-1" />
                                </div>
                            )}
                        </Button>
                    </div>
                </form>

                <div className="mt-12 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shrink-0">
                        <AlertCircle className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Scientific Integrity Notice</h4>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight">
                            All queries are stored in our distributed node network. For urgent environmental hazards or anomalies requiring immediate AI synthesis, please use the <span className="text-indigo-600">Citizen Assistant</span> tab.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

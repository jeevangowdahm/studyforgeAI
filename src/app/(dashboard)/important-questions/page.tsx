'use client';
import { useState } from 'react';
import { DEMO_QUESTIONS, PRIORITY_LABELS } from '@/lib/constants';
import { Sparkles, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ImportantQuestionsPage(){
 const [priority,setPriority]=useState('all'); const [search,setSearch]=useState('');
 const questions=DEMO_QUESTIONS.map((q,i)=>({...q,id:String(i)})).filter(q=>(priority==='all'||q.priority===priority)&&q.question.toLowerCase().includes(search.toLowerCase()));
 return <div className='max-w-5xl mx-auto space-y-6'><div><h1 className='text-3xl font-bold'>Important Questions</h1><p className='text-slate-400'>Predicted VTU-style questions ranked by exam priority.</p></div><div className='glass p-4 flex flex-col sm:flex-row gap-3'><div className='relative flex-1'><Search className='absolute left-3 top-3 w-4 h-4 text-slate-500'/><input className='input-neon pl-10' value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search questions...'/></div><select className='input-neon sm:w-48' value={priority} onChange={e=>setPriority(e.target.value)}><option value='all'>All Priority</option><option value='high'>High</option><option value='medium'>Medium</option><option value='low'>Low</option></select></div><div className='space-y-4'>{questions.map(q=><div key={q.id} className='glass card-hover p-5'><div className='flex flex-wrap gap-2 mb-3'><span className={cn('px-2 py-1 rounded-full text-xs',PRIORITY_LABELS[q.priority].bg,PRIORITY_LABELS[q.priority].color)}>{q.priority.toUpperCase()}</span><span className='px-2 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-400'>{q.marks} Marks</span><span className='px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400'>{q.module}</span></div><p className='text-lg text-slate-100'>{q.question}</p><a className='btn-neon-primary mt-4 inline-flex text-sm' href={`/answer-generator?question=${encodeURIComponent(q.question)}&marks=${q.marks}`}><Sparkles className='w-4 h-4 mr-1'/>Generate Answer</a></div>)}</div></div>
}

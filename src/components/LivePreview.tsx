import React, { memo } from 'react';
import { FileCode, Folder, Terminal, Play, Settings, Search, Bell, MessageSquare, Mic, Send, Paperclip, FileText, Upload } from 'lucide-react';

// --- Mocks ---
const Skeleton = ({ width, height, className }: any) => (
    <div style={{ width, height }} className={`bg-gray-100 animate-pulse rounded ${className}`} />
);

// --- Types ---
interface Blueprint {
    name: string;
    vertical: string;
    theme: string;
    components: string[];
    layout?: string; // dashboard, chat, document, multimodal, ide
}

interface LivePreviewProps {
    blueprint: Blueprint | null;
    isGenerating: boolean;
}

// --- Layouts ---

const IDELayout = ({ blueprint }: { blueprint: Blueprint }) => {
    return (
        <div className="flex flex-col h-full bg-editor-bg-dark text-slate-300 font-mono text-sm overflow-hidden rounded-lg shadow-2xl border border-editor-border">
            {/* Top Bar (Mac style but dark) */}
            <div className="h-9 bg-gradient-to-r from-editor-bg to-editor-bg-dark flex items-center justify-between px-4 border-b border-editor-border">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 cursor-pointer"/>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 cursor-pointer"/>
                    <div className="w-3 h-3 rounded-full bg-editor-success hover:bg-editor-success/80 cursor-pointer"/>
                </div>
                <span className="text-[11px] text-editor-comment font-medium tracking-wide">Codlylabs Code Studio — {blueprint.name}</span>
                <Play size={12} className="text-editor-string hover:text-[#4bff06] cursor-pointer" />
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Cobalt Dark Blue) */}
                <div className="w-60 bg-editor-bg-dark border-r border-editor-border flex flex-col">
                     <div className="flex items-center justify-between px-4 py-3 text-[10px] font-bold text-[#859900] tracking-wider uppercase bg-editor-bg/30">
                        <span>Project Explorer</span>
                        <Settings size={10} />
                     </div>
                     <div className="px-2 py-2 space-y-0.5">
                        <div className="flex items-center gap-2 px-2 py-1.5 text-editor-text hover:bg-editor-bg rounded cursor-pointer group">
                            <Folder size={14} className="text-editor-tag group-hover:text-[#4da6ff]" />
                            <span>src</span>
                        </div>
                        <div className="pl-5 space-y-0.5 border-l border-editor-bg ml-3">
                             <div className="flex items-center gap-2 px-2 py-1.5 bg-editor-bg text-white rounded cursor-pointer border-l-2 border-editor-function">
                                <FileCode size={14} className="text-editor-function" />
                                <span>App.tsx</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 text-editor-comment hover:bg-editor-bg rounded cursor-pointer">
                                <FileCode size={14} className="text-[#2aa198]" />
                                <span>components</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 text-editor-comment hover:bg-editor-bg rounded cursor-pointer">
                                <Terminal size={14} className="text-[#d33682]" />
                                <span>utils.ts</span>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Editor Area (Main Cobalt Blue) */}
                <div className="flex-1 flex flex-col bg-editor-bg relative">
                     {/* Tabs */}
                     <div className="flex bg-editor-bg-dark">
                         <div className="px-4 py-2 bg-editor-bg text-white text-xs flex items-center gap-2 relative">
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-editor-function"/>
                            <FileCode size={12} className="text-editor-function" />
                             App.tsx
                         </div>
                         <div className="px-4 py-2 text-editor-muted bg-[#121f28] text-xs flex items-center gap-2 border-r border-editor-border hover:bg-editor-bg/50 cursor-pointer transition-colors">
                             utils.ts
                         </div>
                         {/* AI Assistant badge hidden */}
                     </div>
                     
                     {/* Code Editor Content */}
                     <div className="flex-1 flex overflow-hidden">
                        {/* Line Numbers */}
                        <div className="w-10 bg-editor-bg-dark text-editor-muted text-right pr-3 pt-6 font-mono text-xs select-none border-r border-editor-bg">
                            {Array.from({length: 20}).map((_, i) => (
                                <div key={i} className="leading-6">{i + 1}</div>
                            ))}
                        </div>

                        {/* Code Text */}
                        <div className="flex-1 p-6 font-mono text-xs leading-6 text-white relative bg-editor-bg">

                             {/* Diff View Simulation (Cobalt Style) */}
                             <div className="absolute top-0 right-0 w-[40%] h-full bg-editor-bg-dark border-l border-[#005075] shadow-2xl transform translate-x-0 transition-transform duration-500 z-10">
                                <div className="h-8 bg-editor-border flex items-center justify-between px-3 border-b border-[#005075]">
                                    <span className="text-[10px] text-[#2aa198] font-bold uppercase flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#2aa198] animate-pulse"/>
                                        AI Context
                                    </span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-editor-muted uppercase">User Prompt</div>
                                        <div className="p-2 bg-editor-bg rounded text-[11px] text-editor-comment border border-[#005075]">
                                            "Explique los cambios en App.tsx..."
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-editor-muted uppercase">PoC Architect</div>
                                        <div className="p-3 bg-[#005075]/30 border border-[#005075] rounded text-[11px] text-editor-text">
                                            Se añadió el componente <code className="text-editor-function bg-editor-bg px-1 rounded">{blueprint.components[0]}</code> según el requerimiento.
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <p><span className="text-editor-keyword">import</span> React <span className="text-editor-keyword">from</span> <span className="text-editor-string">'react'</span>;</p>
                             <p className="mt-2"><span className="text-editor-keyword">export const</span> <span className="text-editor-function">App</span> = () <span className="text-editor-keyword">&gt;</span> {'{'}</p>
                             <div className="pl-4 border-l border-editor-tag/30 ml-1">
                                <p className="text-editor-muted italic">// Generated by Codlylabs SDK</p>
                                <p><span className="text-editor-keyword">return</span> (</p>
                                {/* Added Block highlight */}
                                <div className="bg-editor-success/10 border-l-2 border-editor-success pl-2 -ml-2 py-0.5 my-1">
                                    <p className="text-editor-text">  {'<'}<span className="text-editor-function">{blueprint.components[0]?.replace('_', '') || 'Dashboard'}</span> {'/>'}</p>
                                </div>
                                <p>);</p>
                             </div>
                             <p>{'}'};</p>
                        </div>
                     </div>

                     {/* Terminal (Cobalt Footer) */}
                     <div className="h-32 border-t border-editor-border bg-editor-bg-dark p-0 font-mono text-xs">
                         <div className="flex bg-editor-border px-4 py-1 gap-4">
                             <div className="text-[10px] text-editor-text border-b-2 border-editor-string pb-1 uppercase font-bold tracking-wider">Terminal</div>
                             <div className="text-[10px] text-editor-muted uppercase tracking-wider hover:text-editor-comment cursor-pointer">Output</div>
                             <div className="text-[10px] text-editor-muted uppercase tracking-wider hover:text-editor-comment cursor-pointer">Problems</div>
                         </div>
                         <div className="p-3 space-y-1 font-mono text-[11px]">
                             <p className="text-editor-comment">$ npm install dependencies...</p>
                             <p className="text-editor-success">✓ added 142 packages in 2s</p>
                             <p className="text-editor-comment">$ npm run dev</p>
                             <div className="flex items-center gap-2">
                                <p className="text-editor-tag">➜  Local:   http://localhost:5173/</p>
                                <div className="flex gap-1 h-3 items-end">
                                    <div className="w-1 bg-editor-success h-2 animate-bounce" style={{animationDelay: '0ms'}}/>
                                    <div className="w-1 bg-editor-success h-3 animate-bounce" style={{animationDelay: '100ms'}}/>
                                    <div className="w-1 bg-editor-success h-1 animate-bounce" style={{animationDelay: '200ms'}}/>
                                </div>
                             </div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
}

const DashboardLayout = ({ blueprint }: { blueprint: Blueprint }) => {
    return (
        <div className="flex h-full bg-gray-50 text-gray-900 font-sans rounded-xl shadow-xl border border-gray-200 overflow-hidden relative">
            
            {/* Sidebar Mock */}
            <div className="w-16 md:w-56 bg-white border-r border-gray-100 flex flex-col relative z-20">
                <div className="h-14 flex items-center px-6 border-b border-gray-50">
                    <div className="w-6 h-6 rounded bg-brand-600"></div>
                    <span className="ml-3 font-bold text-gray-800 hidden md:block">Acme Inc</span>
                </div>
                <div className="flex-1 p-4 space-y-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-8 rounded-md w-full flex items-center px-2 gap-3 ${i === 1 ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-400'}`}>
                            <div className={`w-4 h-4 rounded ${i === 1 ? 'bg-brand-200' : 'bg-gray-100'}`} />
                            <span className="hidden md:block text-sm">Item {i}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-gray-50/50">
                {/* Header */}
                <div className="h-14 border-b border-gray-100 bg-white px-6 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">{blueprint.name}</span>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><Search size={16}/></div>
                        <div className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><Bell size={16}/></div>
                        <div className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm" />
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                        <span className="text-sm text-gray-500">Last updated: Just now</span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Metric {i}</div>
                                <div className="text-2xl font-bold text-gray-900">{(Math.random() * 1000).toFixed(0)}</div>
                                <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                    <span>↑ 12%</span>
                                    <span className="text-gray-300">vs last month</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Table Mock */}
                         <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-sm text-gray-700 mb-4">Recent Transactions</h3>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-50" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-800">Transaction #{i}</div>
                                                <div className="text-[10px] text-gray-400">2 min ago</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">+$250.00</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chart Mock */}
                        <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                             <h3 className="font-semibold text-sm text-gray-700 mb-4">Performance</h3>
                             <div className="flex-1 flex items-end gap-2 px-2 pb-2">
                                 {[40, 60, 45, 70, 30, 80, 50].map((h, i) => (
                                     <div key={i} style={{height: `${h}%`}} className="flex-1 bg-brand-50 hover:bg-brand-100 rounded-t-sm transition-colors relative group">
                                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                             {h}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// --- New Dynamic Layouts ---

const ChatLayout = ({ blueprint }: { blueprint: Blueprint }) => {
    return (
        <div className="flex h-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden relative">
             {/* Sidebar List */}
             <div className="w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 font-bold text-gray-700">Conversations</div>
                <div className="flex-1 p-2 space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`p-3 rounded-lg text-sm cursor-pointer ${i===1 ? 'bg-white shadow-sm border border-gray-100 text-brand-600 font-medium' : 'hover:bg-gray-100 text-gray-600'}`}>
                           History Item #{i}
                        </div>
                    ))}
                </div>
             </div>

             {/* Chat Area */}
             <div className="flex-1 flex flex-col bg-white">
                <div className="h-16 border-b border-gray-100 flex items-center px-6 justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white">
                            <MessageSquare size={16} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">{blueprint.name}</div>
                            <div className="text-xs text-green-500 flex items-center gap-1">● Online</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/30">
                     <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex-shrink-0" />
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm text-gray-700 text-sm max-w-[80%]">
                            Hello! I am your <strong>{blueprint.name}</strong> assistant. I can help you with {blueprint.components.join(', ')}.
                        </div>
                     </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                        <Paperclip size={18} className="text-gray-400 cursor-pointer"/>
                        <input className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700" placeholder="Type your message..." />
                        <Mic size={18} className="text-gray-400 cursor-pointer"/>
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-brand-700 transition-colors">
                            <Send size={14} />
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
}

const DocumentLayout = ({ blueprint: _ }: { blueprint: Blueprint }) => {
    return (
        <div className="flex h-full bg-gray-100 rounded-xl shadow-xl overflow-hidden border border-gray-200">
             <div className="flex-1 bg-gray-500 m-2 rounded-lg shadow-inner flex items-center justify-center relative overflow-hidden group">
                 <div className="w-[60%] h-[90%] bg-white shadow-2xl rounded-sm p-8 text-[6px] text-gray-400 overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-500 cursor-grab">
                     <div className="h-4 w-1/3 bg-gray-800 mb-6 rounded-sm"/>
                     <div className="space-y-2">
                        {Array.from({length: 30}).map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-sm ${Math.random() > 0.3 ? 'w-full bg-gray-200' : 'w-2/3 bg-gray-300'}`} />
                        ))}
                     </div>
                 </div>
             </div>

             <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                <div className="h-14 border-b border-gray-100 flex items-center px-4 justify-between font-semibold text-gray-700">
                    <span>Document Analysis</span>
                    <FileText size={18} className="text-gray-400"/>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    <div className="bg-brand-50 border border-brand-100 p-3 rounded-lg">
                        <div className="text-xs font-bold text-brand-700 uppercase mb-2">Key Insights</div>
                        <ul className="text-xs text-brand-900 space-y-1.5 list-disc pl-3">
                             <li>Contract expires in 30 days.</li>
                             <li>Liability clause is missing.</li>
                        </ul>
                    </div>
                </div>
             </div>
        </div>
    );
}

const MultimodalLayout = ({ blueprint: _ }: { blueprint: Blueprint }) => {
    return (
        <div className="flex h-full bg-slate-900 text-white rounded-xl shadow-2xl overflow-hidden border border-slate-700 font-sans">
            <div className="flex-1 relative bg-black flex flex-col">
                 <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs text-red-500 font-bold flex items-center gap-2 border border-red-500/30">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/> LIVE FEED
                 </div>
                 <div className="flex-1 flex items-center justify-center relative overflow-hidden group">
                     <div className="text-slate-600 text-6xl font-black opacity-10 select-none">VISION AI</div>
                 </div>
                 <div className="h-16 bg-slate-800 border-t border-slate-700 flex items-center px-4 gap-4">
                     <Play size={20} className="text-white fill-white cursor-pointer hover:scale-110 transition-transform" />
                     <div className="flex-1 h-8 bg-slate-700 rounded relative overflow-hidden cursor-pointer group">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 flex items-end gap-[1px] opacity-40">
                             {Array.from({length: 100}).map((_, i) => (
                                 <div key={i} style={{height: `${Math.random() * 100}%`}} className="w-1 bg-brand-400"/>
                             ))}
                        </div>
                     </div>
                 </div>
            </div>
            <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col">
                <div className="h-14 border-b border-slate-700 flex items-center px-4 font-bold tracking-wide">
                    CONTROLS
                </div>
                <div className="p-4 border-t border-slate-700">
                    <button className="w-full bg-white text-slate-900 font-bold py-2 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                        <Upload size={14}/> Upload Media
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Main ---

const LivePreviewComponent: React.FC<LivePreviewProps> = ({ blueprint, isGenerating }) => {
    
    // Waiting State
    if (!blueprint && !isGenerating) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-4 bg-gray-50/50">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center animate-pulse">
                    <span className="text-4xl opacity-20">✨</span>
                </div>
                <p className="text-sm font-medium">Esperando requerimientos...</p>
            </div>
        );
    }

    // Generating State (Generic Loader)
    if (isGenerating && !blueprint) {
         return (
            <div className="h-full w-full p-8 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-full max-w-4xl h-[80%] bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col gap-4">
                     <Skeleton width="40%" height={32} />
                     <div className="grid grid-cols-3 gap-4 mt-8">
                         <Skeleton width="100%" height={100} />
                         <Skeleton width="100%" height={100} />
                         <Skeleton width="100%" height={100} />
                     </div>
                     <div className="flex-1 mt-4">
                        <Skeleton width="100%" height="100%" /> 
                     </div>
                </div>
            </div>
         );
    }

    // Render by Layout Type
    const layout = blueprint?.layout?.toLowerCase() || 'dashboard';

    if (layout === 'ide' || blueprint?.vertical === 'DevTools') {
        return (
            <div className={`h-full w-full p-6 flex flex-col items-center justify-center bg-gray-200/50`}>
                <div className="w-full max-w-5xl h-[85%] transition-all duration-700 animate-slide-up">
                    <IDELayout blueprint={blueprint!} />
                </div>
            </div>
        );
    }

    if (layout === 'chat') {
        return (
             <div className={`h-full w-full p-6 flex flex-col items-center justify-center bg-gray-100`}>
                <div className="w-full max-w-4xl h-[85%] transition-all duration-700 animate-slide-up">
                    <ChatLayout blueprint={blueprint!} />
                </div>
            </div>
        );
    }
    
    if (layout === 'document') {
        return (
             <div className={`h-full w-full p-6 flex flex-col items-center justify-center bg-slate-200`}>
                <div className="w-full max-w-5xl h-[85%] transition-all duration-700 animate-slide-up">
                    <DocumentLayout blueprint={blueprint!} />
                </div>
            </div>
        );
    }

    if (layout === 'multimodal') {
        return (
             <div className={`h-full w-full p-6 flex flex-col items-center justify-center bg-slate-950`}>
                <div className="w-full max-w-6xl h-[90%] transition-all duration-700 animate-slide-up">
                    <MultimodalLayout blueprint={blueprint!} />
                </div>
            </div>
        );
    }

    // Default Dashboard
    return (
        <div className="h-full w-full p-6 flex flex-col items-center justify-center bg-gray-100">
             <div className="w-full max-w-5xl h-[85%] transition-all duration-700 animate-slide-up">
                <DashboardLayout blueprint={blueprint!} />
            </div>
        </div>
    );
};

export const LivePreview = memo(LivePreviewComponent);

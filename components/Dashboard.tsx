
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { AnalysisResult, Comment } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  CartesianGrid, XAxis, YAxis, Sector, Brush, BarChart, Bar
} from 'recharts';
import { 
  MessageSquare, ThumbsUp, TrendingUp, Download, Search, Filter, 
  Activity, BrainCircuit, Target, Database, PlayCircle, Eye, Hexagon,
  RefreshCw, FileText, ArrowLeft
} from 'lucide-react';

interface DashboardProps {
  analysis: AnalysisResult;
  comments: Comment[];
  onReset: () => void;
}

// Custom Active Shape for Pie Chart
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="var(--text-main)" className="text-xl font-bold">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={15} textAnchor="middle" fill="var(--text-muted)" className="text-sm">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-theme-card/95 backdrop-blur-xl border border-theme-border p-4 rounded-xl shadow-2xl">
        <p className="font-bold text-theme-text mb-2 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-theme-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
            {entry.name}: <span className="text-theme-text font-mono font-bold">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ analysis, comments, onReset }) => {
  const theme = { primary: '#ef4444', secondary: '#222222', accent: '#ff0000', bg: 'from-red-900/20' };
  const [activeTab, setActiveTab] = useState<'overview' | 'audience' | 'strategy' | 'explorer'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [minLikes, setMinLikes] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  // --- Derived Data ---
  const filteredComments = useMemo(() => {
    return comments.filter(c => 
      (c.text.toLowerCase().includes(searchTerm.toLowerCase()) || c.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
      c.likes >= minLikes
    );
  }, [comments, searchTerm, minLikes]);

  const timelineData = useMemo(() => {
    const bins: Record<string, number> = {};
    comments.forEach(c => {
       const date = new Date(c.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
       bins[date] = (bins[date] || 0) + 1;
    });
    // Sort chronologically
    return Object.entries(bins)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [comments]);

  const questionsData = useMemo(() => {
    return analysis.topQuestions.slice(0, 5).map(q => ({
      name: q.text.substring(0, 20) + '...',
      fullName: q.text,
      count: q.frequency
    }));
  }, [analysis]);

  const radarData = useMemo(() => [
    { subject: 'Trust', A: analysis.brandHealth.trust, fullMark: 100 },
    { subject: 'Excitement', A: analysis.brandHealth.excitement, fullMark: 100 },
    { subject: 'Innovation', A: analysis.brandHealth.innovation, fullMark: 100 },
    { subject: 'Value', A: analysis.brandHealth.value, fullMark: 100 },
    { subject: 'Community', A: analysis.brandHealth.community, fullMark: 100 },
  ], [analysis]);

  const downloadCSV = () => {
    const headers = ['Author', 'Date', 'Likes', 'Platform', 'Content'];
    const rows = filteredComments.map(c => [
      `"${c.author.replace(/"/g, '""')}"`,
      c.publishedAt,
      c.likes,
      c.platform,
      `"${c.text.replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CommentIQ_Analysis_${new Date().toISOString()}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const StatCard = ({ label, value, icon: Icon, trend }: any) => (
    <div className="bg-theme-card/60 backdrop-blur-md border border-theme-border p-6 rounded-2xl relative overflow-hidden group hover:border-theme-border transition-all shadow-sm">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all`}></div>
      <div className="flex justify-between items-start mb-4">
         <div className="p-3 bg-theme-glass rounded-xl text-theme-muted"><Icon size={20}/></div>
         {trend && <span className="flex items-center text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20"><TrendingUp size={12} className="mr-1"/> {trend}</span>}
      </div>
      <div className="text-3xl font-bold text-theme-text mb-1 tracking-tight">{value}</div>
      <div className="text-xs text-theme-muted uppercase tracking-widest font-medium">{label}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20 w-full">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-theme-card border border-theme-border p-4 rounded-2xl shadow-lg relative z-20 no-print">
         <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={onReset}
              className="md:hidden p-2 mr-2 bg-theme-bg rounded-lg text-theme-muted"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-theme-text px-2">Analysis Report</h2>
            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20">YouTube</span>
         </div>
         <div className="flex gap-3 w-full md:w-auto justify-end">
             <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-theme-glass border border-theme-border hover:bg-theme-bg text-theme-text transition-colors text-sm font-medium flex-1 md:flex-none whitespace-nowrap min-w-[120px]"
             >
                <FileText size={16} /> Export PDF
             </button>
             <button 
                onClick={onReset}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20 transition-all text-sm font-medium flex-1 md:flex-none whitespace-nowrap min-w-[140px]"
             >
                <RefreshCw size={16} /> New Analysis
             </button>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-20 z-30 flex justify-center no-print w-full px-2">
        <div className="bg-theme-glass backdrop-blur-xl border border-theme-border p-1.5 rounded-2xl flex gap-1 shadow-lg overflow-x-auto max-w-full w-full md:w-auto no-scrollbar">
          {[
             { id: 'overview', label: 'Overview', icon: Activity },
             { id: 'audience', label: 'Audience', icon: BrainCircuit },
             { id: 'strategy', label: 'Strategy', icon: Target },
             { id: 'explorer', label: 'Explorer', icon: Database },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? `bg-red-600 text-white shadow-lg` 
                  : 'text-theme-muted hover:text-theme-text hover:bg-theme-bg/50'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print-layout">
           {/* KPI Row */}
           <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 page-break">
              <StatCard label="Total Volume" value={comments.length.toLocaleString()} icon={MessageSquare} trend="+100%" />
              <StatCard label="Engagement Score" value={(comments.reduce((a,b) => a + b.likes, 0) / comments.length).toFixed(1)} icon={ThumbsUp} />
              <StatCard label="Brand Trust" value={`${analysis.brandHealth.trust}/100`} icon={Hexagon} trend={analysis.brandHealth.trust > 70 ? 'High' : 'Med'} />
              <StatCard label="Commercial Intent" value={analysis.commercialIntent} icon={Target} />
           </div>

           {/* Executive Summary */}
           <div className="lg:col-span-8 bg-theme-card backdrop-blur-md border border-theme-border p-6 md:p-8 rounded-3xl shadow-sm">
              <h3 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2"><Activity className="text-brand-500"/> Executive AI Brief</h3>
              <p className="text-theme-text text-base md:text-lg leading-relaxed opacity-90">{analysis.summary}</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                    <h4 className="text-green-500 text-xs font-bold uppercase mb-1">Strategic Opportunity</h4>
                    <p className="text-theme-text text-sm opacity-90">{analysis.marketingAdvice}</p>
                 </div>
                 <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <h4 className="text-red-500 text-xs font-bold uppercase mb-1">Primary Pain Point</h4>
                    <p className="text-theme-text text-sm opacity-90">{analysis.painPoints[0] || "None detected."}</p>
                 </div>
              </div>
           </div>

           {/* Brand Radar */}
           <div className="lg:col-span-4 bg-theme-card backdrop-blur-md border border-theme-border p-4 rounded-3xl flex flex-col items-center justify-center relative shadow-sm min-h-[300px]">
              <h3 className="absolute top-6 left-6 text-sm font-bold text-theme-muted uppercase">Brand Resonance</h3>
              <div className="w-full h-72">
                <ResponsiveContainer>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Brand Score" dataKey="A" stroke={theme.accent} fill={theme.primary} fillOpacity={0.5} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Sentiment Donut */}
           <div className="lg:col-span-4 bg-theme-card backdrop-blur-md border border-theme-border p-8 rounded-3xl flex flex-col items-center justify-center shadow-sm page-break min-h-[300px]">
              <h3 className="text-sm font-bold text-theme-muted uppercase mb-4 w-full text-left">Sentiment Split</h3>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      {...({ activeIndex } as any)}
                      activeShape={renderActiveShape}
                      data={[
                        { name: 'Positive', value: analysis.sentiment.positive, color: '#22c55e' },
                        { name: 'Neutral', value: analysis.sentiment.neutral, color: '#94a3b8' },
                        { name: 'Negative', value: analysis.sentiment.negative, color: '#ef4444' }
                      ]} 
                      innerRadius={60} 
                      outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      <Cell fill="#22c55e" stroke="none"/>
                      <Cell fill="#94a3b8" stroke="none"/>
                      <Cell fill="#ef4444" stroke="none"/>
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Interactive Timeline Area Chart */}
           <div className="lg:col-span-8 bg-theme-card backdrop-blur-md border border-theme-border p-6 md:p-8 rounded-3xl shadow-sm min-h-[300px]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                <h3 className="text-lg font-bold text-theme-text">Engagement Velocity</h3>
                <span className="text-xs text-theme-muted no-print">Drag the slider below to zoom & pan</span>
              </div>
              <div className="h-64 w-full">
                 <ResponsiveContainer>
                    <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor={theme.primary} stopOpacity={0.3}/>
                             <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                       <XAxis 
                          dataKey="name" 
                          stroke="var(--text-muted)" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                       />
                       <YAxis 
                          stroke="var(--text-muted)" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                       />
                       <Tooltip content={<CustomTooltip />} />
                       <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke={theme.primary} 
                          fillOpacity={1} 
                          fill="url(#colorCount)" 
                          strokeWidth={3} 
                          animationDuration={1500}
                       />
                       <Brush 
                          dataKey="name" 
                          height={30} 
                          stroke={theme.accent} 
                          fill="var(--card-bg)"
                          tickFormatter={() => ""} 
                          className="no-print"
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      {/* STRATEGY TAB */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
           {/* Competitors & Topics */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-theme-card backdrop-blur-md border border-theme-border p-8 rounded-3xl shadow-sm">
                  <h3 className="text-lg font-bold text-theme-text mb-6">Dominant Discussion Clusters</h3>
                  <div className="flex flex-wrap gap-4">
                     {analysis.topics.map((topic, i) => (
                        <div key={i} className="group relative">
                           <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-500 rounded-lg blur opacity-10 group-hover:opacity-30 transition-opacity"></div>
                           <div className="relative bg-theme-bg border border-theme-border px-6 py-4 rounded-lg flex items-center gap-3">
                              <span className="text-lg font-bold text-theme-text">{topic.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${topic.sentiment === 'positive' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                 {topic.count}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
              </div>
              <div className="lg:col-span-4 bg-theme-card backdrop-blur-md border border-theme-border p-8 rounded-3xl shadow-sm">
                  <h3 className="text-lg font-bold text-theme-text mb-6">Competitor Mentions</h3>
                  {analysis.competitors.length > 0 ? (
                    <div className="space-y-3">
                       {analysis.competitors.map((comp, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-theme-glass rounded-lg border border-theme-border">
                             <span className="text-theme-text">{comp}</span>
                             <span className="text-xs bg-theme-bg px-2 py-1 rounded text-theme-muted">Detected</span>
                          </div>
                       ))}
                    </div>
                  ) : (
                    <div className="text-theme-muted italic">No direct competitors detected in this sample.</div>
                  )}
              </div>
           </div>
           
           {/* Top Questions Bar Chart (New) */}
           <div className="bg-theme-card backdrop-blur-md border border-theme-border p-8 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-theme-text mb-6">Top Audience Questions</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <BarChart data={questionsData} layout="vertical" margin={{ left: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                     <XAxis type="number" stroke="var(--text-muted)" hide />
                     <YAxis dataKey="name" type="category" width={150} stroke="var(--text-text)" tick={{fontSize: 12}} />
                     <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                     <Bar dataKey="count" fill={theme.primary} radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Hero Recommendations */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 page-break">
              {analysis.contentIdeas.map((idea, i) => (
                 <div key={i} className="group relative bg-theme-card border border-theme-border hover:border-brand-500/50 p-6 rounded-3xl transition-all hover:-translate-y-1 overflow-hidden shadow-sm hover:shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-4">
                       <span className="bg-brand-500/10 text-brand-500 text-xs font-bold px-2 py-1 rounded border border-brand-500/20">Viral Score: {idea.score}/10</span>
                       <PlayCircle className="text-theme-muted group-hover:text-theme-text transition-colors" size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-theme-text mb-3 leading-snug">"{idea.title}"</h3>
                    <p className="text-theme-muted text-sm mb-4">{idea.reasoning}</p>
                    <div className="bg-theme-bg p-3 rounded-xl border border-theme-border">
                       <div className="text-xs text-theme-muted uppercase font-bold mb-1 flex items-center gap-2"><Eye size={10}/> Thumbnail Concept</div>
                       <p className="text-xs text-theme-text italic opacity-80">{idea.thumbnailSuggestion}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* AUDIENCE TAB */}
      {activeTab === 'audience' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-theme-card backdrop-blur-md border border-theme-border p-8 rounded-3xl shadow-sm">
               <h3 className="text-lg font-bold text-theme-text mb-4">Psychographic Profile</h3>
               <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 p-6 rounded-2xl border border-theme-border mb-6">
                  <p className="text-lg text-theme-text italic leading-relaxed opacity-90">"{analysis.audiencePersona}"</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-theme-glass rounded-xl border border-theme-border">
                     <div className="text-2xl font-bold text-theme-text">{analysis.sarcasmCount}</div>
                     <div className="text-xs text-theme-muted uppercase">Sarcastic Comments</div>
                  </div>
                  <div className="p-4 bg-theme-glass rounded-xl border border-theme-border">
                     <div className="text-2xl font-bold text-theme-text">{analysis.languages.length}</div>
                     <div className="text-xs text-theme-muted uppercase">Languages Detected</div>
                  </div>
               </div>
            </div>

            <div className="bg-theme-card backdrop-blur-md border border-theme-border p-8 rounded-3xl shadow-sm">
               <h3 className="text-lg font-bold text-theme-text mb-4">Emerging Trends</h3>
               <div className="flex flex-wrap gap-2">
                  {analysis.emergingTrends.map((trend, i) => (
                     <span key={i} className="px-4 py-2 rounded-full bg-theme-glass border border-theme-border text-sm text-theme-text hover:bg-theme-bg hover:border-brand-500/50 transition-colors cursor-default">
                        # {trend}
                     </span>
                  ))}
               </div>
               <h3 className="text-lg font-bold text-theme-text mt-8 mb-4">Geo-Linguistics</h3>
               <div className="space-y-2">
                  {analysis.languages.map((l, i) => (
                     <div key={i} className="flex justify-between items-center p-3 bg-theme-glass rounded-lg border border-theme-border">
                        <span className="text-sm text-theme-text">{l.language}</span>
                        <span className="text-xs font-mono text-theme-muted">{l.count}%</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* EXPLORER TAB */}
      {activeTab === 'explorer' && (
        <div className="bg-theme-card border border-theme-border rounded-3xl shadow-xl flex flex-col h-[700px] overflow-hidden no-print">
           {/* Toolbar */}
           <div className="p-4 border-b border-theme-border bg-theme-glass flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-4 items-center flex-1 min-w-[200px]">
                 <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16}/>
                    <input 
                       type="text" 
                       placeholder="Search inside comments..." 
                       className="w-full bg-theme-input border border-theme-border rounded-lg pl-10 pr-4 py-2 text-sm text-theme-text focus:ring-1 focus:ring-brand-500 focus:outline-none placeholder-theme-muted"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="hidden md:flex items-center gap-2 text-sm text-theme-muted">
                    <Filter size={16}/>
                    <span>Min Likes:</span>
                    <input 
                      type="number" 
                      className="bg-theme-input border border-theme-border rounded w-16 px-2 py-1 text-theme-text" 
                      value={minLikes}
                      onChange={(e) => setMinLikes(Number(e.target.value))}
                    />
                 </div>
              </div>
              <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors shadow-md whitespace-nowrap">
                 <Download size={16}/> Export CSV
              </button>
           </div>
           
           {/* Table */}
           <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                 <thead className="bg-theme-glass text-theme-muted text-xs uppercase font-bold sticky top-0 backdrop-blur-md z-10">
                    <tr>
                       <th className="p-4 border-b border-theme-border">Author</th>
                       <th className="p-4 border-b border-theme-border w-1/2">Comment</th>
                       <th className="p-4 border-b border-theme-border">Likes</th>
                       <th className="p-4 border-b border-theme-border">Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-theme-border">
                    {filteredComments.slice(0, 100).map(c => (
                       <tr key={c.id} className="hover:bg-theme-bg/50 transition-colors">
                          <td className="p-4 text-sm text-brand-500 font-medium whitespace-nowrap">{c.author}</td>
                          <td className="p-4 text-sm text-theme-text leading-relaxed opacity-90">{c.text}</td>
                          <td className="p-4 text-sm text-theme-muted font-mono">{c.likes.toLocaleString()}</td>
                          <td className="p-4 text-sm text-theme-muted whitespace-nowrap">{new Date(c.publishedAt).toLocaleDateString()}</td>
                       </tr>
                    ))}
                    {filteredComments.length === 0 && (
                       <tr><td colSpan={4} className="p-8 text-center text-theme-muted">No comments match your filters.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
           <div className="p-2 bg-theme-glass border-t border-theme-border text-center text-xs text-theme-muted">
              Showing top 100 of {filteredComments.length} loaded comments. Export CSV to view all.
           </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;

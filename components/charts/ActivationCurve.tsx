'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

interface DataPoint {
  time: string;
  concentration: number;
  focus: number;
  timestamp: number;
}

interface ActivationCurveProps {
  data: DataPoint[];
  medications: Array<{ name: string; color: string; doseTime: number }>;
  currentTime: number;
}

export default function ActivationCurve({ data, medications, currentTime }: ActivationCurveProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="card-base p-3 border border-card-border/50">
          <p className="text-xs font-medium text-foreground">{payload[0].payload.time}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTimingInfo = () => {
    if (data.length < 2) return null;

    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];

    const peakIndex = data.reduce((maxIdx, point, idx) =>
      point.concentration > data[maxIdx].concentration ? idx : maxIdx, 0);
    const peakPoint = data[peakIndex];

    const firstTime = new Date(firstPoint.timestamp);
    const peakTime = new Date(peakPoint.timestamp);
    const lastTime = new Date(lastPoint.timestamp);

    return {
      firstLabel: firstTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      peakLabel: peakTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      lastLabel: lastTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      peakPercent: (peakIndex / data.length) * 100,
    };
  };

  if (data.length === 0) {
    return (
      <div className="card-base p-6 col-span-full">
        <p className="text-label mb-2">Cognitive Activation Curve</p>
        <p className="text-muted text-sm">Loading data...</p>
      </div>
    );
  }

  const timing = getTimingInfo();

  return (
    <div className="card-base p-6 space-y-4 col-span-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-title font-medium">Cognitive Activation Curve</h3>
          <p className="text-label text-muted">Pharmacokinetic trajectory & effect duration</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <AreaChart data={data} margin={{ top: 40, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorConcentration" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="onsetZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="peakZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="declineZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgb(51, 65, 85, 0.3)" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: 'rgb(100, 116, 139)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: 'rgb(100, 116, 139)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Concentration', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend height={20} wrapperStyle={{ paddingBottom: 0 }} />

          {timing && (
            <>
              <ReferenceLine
                x={timing.firstLabel}
                stroke="rgb(16, 185, 129)"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ value: 'Onset', position: 'top', fill: 'rgb(16, 185, 129)', fontSize: 11, offset: 20 }}
              />
              <ReferenceLine
                x={timing.peakLabel}
                stroke="rgb(34, 211, 238)"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: 'Peak', position: 'top', fill: 'rgb(34, 211, 238)', fontSize: 11, offset: 20, fontWeight: 'bold' }}
              />
              <ReferenceLine
                x={timing.lastLabel}
                stroke="rgb(245, 158, 11)"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ value: 'End', position: 'top', fill: 'rgb(245, 158, 11)', fontSize: 11, offset: 20 }}
              />
            </>
          )}

          <Area
            type="monotone"
            dataKey="concentration"
            stroke="#22d3ee"
            strokeWidth={3}
            fill="url(#colorConcentration)"
            isAnimationActive={true}
            animationDuration={500}
            name="Actual"
          />

          <Area
            type="monotone"
            dataKey="optimalFocus"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="none"
            isAnimationActive={false}
            name="Ideal"
            opacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-card-border/30">
        <div>
          <p className="text-xs text-muted mb-1">Onset (Start)</p>
          <p className="text-sm font-medium text-accent-green">{timing?.firstLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Peak Effect</p>
          <p className="text-sm font-medium text-accent-cyan">{timing?.peakLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Wears Off</p>
          <p className="text-sm font-medium text-accent-amber">{timing?.lastLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Current Level</p>
          <p className="text-sm font-medium text-accent-cyan">
            {(() => {
              const current = data.find(d => d.timestamp >= currentTime) || data[data.length - 1];
              return (current?.concentration.toFixed(2) || '0.00') + ' / 100%';
            })()}
          </p>
        </div>
      </div>

      <div className="bg-card-border/10 rounded-lg p-3 space-y-2">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-green/50" />
            <span className="text-muted">Onset phase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-cyan/50" />
            <span className="text-muted">Peak duration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent-amber/50" />
            <span className="text-muted">Decline phase</span>
          </div>
        </div>
      </div>
    </div>
  );
}

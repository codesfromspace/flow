'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Legend, Brush } from 'recharts';
import { normalizeEffectiveRange } from '@/lib/utils/cognitive-math';
import { EffectiveRange } from '@/types';

interface DataPoint {
  time: string;
  concentration: number;

  focus: number;
  timestamp: number;
}

interface ActivationCurveProps {
  data: DataPoint[];
  medications: Array<{ name: string; color: string; doseTime: number }>;
  doses?: Array<{ timestamp: number; time: string; label: string; color: string }>;
  currentTime: number;
  effectiveRange?: EffectiveRange;
  height?: number;
  mini?: boolean;
}

export default function ActivationCurve({ data, medications, doses, currentTime, effectiveRange, height = 480, mini = false }: ActivationCurveProps) {
  const range = normalizeEffectiveRange(effectiveRange);
  const maxConcentration = Math.max(...data.map((point) => point.concentration), range.upper, 1);
  const yMax = Math.min(1.25, Math.max(1.1, Math.ceil(maxConcentration * 10 + 1) / 10));
  const yTicks = yMax > 1 ? [0, 0.25, 0.5, 0.75, 1, yMax] : [0, 0.25, 0.5, 0.75, 1];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="card-base p-3 border border-card-border/50">
          <p className="text-xs font-medium text-foreground">{payload[0].payload.time}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {Math.round(entry.value * 100)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTimingInfo = () => {
    if (data.length < 2) return null;

    const firstPoint = data.find(d => d.concentration > 0.02) || data[0];
    const lastPoint = [...data].reverse().find(d => d.concentration > 0.02) || data[data.length - 1];

    const peakIndex = data.reduce((maxIdx, point, idx) =>
      point.concentration > data[maxIdx].concentration ? idx : maxIdx, 0);
    const peakPoint = data[peakIndex];

    const firstTime = new Date(firstPoint.timestamp);
    const peakTime = new Date(peakPoint.timestamp);
    const lastTime = new Date(lastPoint.timestamp);

    return {
      firstLabel: firstTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
      firstTimestamp: firstPoint.timestamp,
      peakLabel: peakTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
      peakTimestamp: peakPoint.timestamp,
      lastLabel: lastTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
      lastTimestamp: lastPoint.timestamp,
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

      <ResponsiveContainer width="100%" height={480}>
        <AreaChart data={data} margin={{ top: 40, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorConcentration" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="onsetZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="peakZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="declineZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgb(51, 65, 85, 0.3)" vertical={false} />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(val) => {
              const d = new Date(val);
              const dataMin = data[0]?.timestamp || 0;
              const dataMax = data[data.length - 1]?.timestamp || 0;
              const isMultiDay = dataMax - dataMin > 25 * 60 * 60 * 1000;
              let s = d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
              if (isMultiDay) {
                s = d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) + ' ' + s;
              }
              return s;
            }}
            tick={{ fill: 'rgb(100, 116, 139)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: 'rgb(100, 116, 139)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={[0, (dataMax: number) => Math.max(1, dataMax)]}
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            label={{ value: 'Relative activation', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend height={20} wrapperStyle={{ paddingBottom: 0 }} />

          <ReferenceArea
            y1={range.lower}
            y2={range.upper}
            fill="#10b981"
            fillOpacity={0.08}
            stroke="#10b981"
            strokeOpacity={0.28}
            label={{ value: 'Estimated useful range', position: 'insideTopRight', fill: '#10b981', fontSize: 11 }}
          />

          {doses?.map((dose, idx) => (
            <ReferenceLine
              key={`dose-${idx}`}
              x={dose.timestamp}
              stroke={dose.color}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: dose.label, position: 'insideBottomLeft', fill: dose.color, fontSize: 11, offset: 20, angle: -90 }}
            />
          ))}

          {timing && data.length <= 100 && (
            <>
              <ReferenceLine
                x={timing.firstTimestamp}
                stroke="rgb(16, 185, 129)"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ value: 'Onset', position: 'top', fill: 'rgb(16, 185, 129)', fontSize: 11, offset: 20 }}
              />
              <ReferenceLine
                x={timing.peakTimestamp}
                stroke="rgb(34, 211, 238)"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: 'Peak', position: 'top', fill: 'rgb(34, 211, 238)', fontSize: 11, offset: 20, fontWeight: 'bold' }}
              />
              <ReferenceLine
                x={timing.lastTimestamp}
                stroke="rgb(245, 158, 11)"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ value: 'End', position: 'top', fill: 'rgb(245, 158, 11)', fontSize: 11, offset: 20 }}
              />
            </>
          )}

          <ReferenceLine
            x={currentTime}
            stroke="rgb(239, 68, 68)"
            strokeDasharray="3 3"
            strokeWidth={1.5}
            label={{ value: 'Nyní', position: 'insideTopLeft', fill: 'rgb(239, 68, 68)', fontSize: 11, offset: 10 }}
          />

          <Area 
            type="monotone" 
            dataKey="concentration" 
            stroke="#14b8a6" 
            fillOpacity={1} 
            fill="url(#colorConcentration)" 
            strokeWidth={3} 
            isAnimationActive={true}
            animationDuration={500}
            name="Actual concentration"
          />
          <Brush
            dataKey="timestamp"
            height={30}
            stroke="#0e9fa8"
            fill="transparent"
            tickFormatter={() => ''}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-card-border/30">
        <div>
          <p className="text-xs text-muted mb-1">Onset (Start)</p>
          <p className="text-sm font-medium text-accent-green">{timing?.firstLabel ?? 'No dose'}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Peak Effect</p>
          <p className="text-sm font-medium text-accent-cyan">{timing?.peakLabel ?? 'No dose'}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Wears Off</p>
          <p className="text-sm font-medium text-accent-amber">{timing?.lastLabel ?? 'No dose'}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Current Level</p>
          <p className="text-sm font-medium text-accent-cyan">
            {(() => {
              const current = data.find(d => d.timestamp >= currentTime) || data[data.length - 1];
              return Math.round((current?.concentration ?? 0) * 100) + '% relative';
            })()}
          </p>
        </div>
      </div>

      <div className="bg-card-border/10 rounded-lg p-3 space-y-3">
        <div>
          <p className="text-xs font-medium mb-2">Křivky vysvětleny:</p>
          <ul className="text-xs text-muted space-y-1">
            <li><strong>Modrá křivka</strong> = Relativní aktivace podle času, dávky, onsetu, peaku a half-life. Není to krevní koncentrace v procentech.</li>
            <li><strong>Zelené pásmo</strong> = Odhad užitečného rozsahu efektu. Není univerzální cíl a má se kalibrovat podle tvé zkušenosti.</li>
          </ul>
        </div>
        <div className="border-t border-card-border/20 pt-2">
          <p className="text-xs text-muted">
            <strong>Tip:</strong> Pokud dobrý fokus pravidelně přichází níž nebo výš než pásmo, uprav useful range v nastavení podle své zkušenosti.
          </p>
        </div>
      </div>
    </div>
  );
}

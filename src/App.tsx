import { useState, useEffect, useRef } from 'react';

// Cesium-133 hyperfine transition frequency
const CESIUM_FREQUENCY = 9192631770;

function App() {
  const [time, setTime] = useState(new Date());
  const [drift, setDrift] = useState(0);
  const frameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(performance.now());

  useEffect(() => {
    const updateTime = () => {
      const now = performance.now();
      const expectedDelta = 16.67; // ~60fps
      const actualDelta = now - lastUpdateRef.current;
      setDrift(prev => prev * 0.99 + (actualDelta - expectedDelta) * 0.01);
      lastUpdateRef.current = now;
      setTime(new Date());
      frameRef.current = requestAnimationFrame(updateTime);
    };

    frameRef.current = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const formatWithPrecision = (num: number, decimals: number) => {
    return num.toFixed(decimals).padStart(decimals + 3, '0');
  };

  const getJulianDate = (date: Date) => {
    const time = date.getTime();
    return (time / 86400000) + 2440587.5;
  };

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const milliseconds = time.getMilliseconds().toString().padStart(3, '0');
  const microseconds = Math.floor(performance.now() % 1 * 1000).toString().padStart(3, '0');

  const utcHours = time.getUTCHours().toString().padStart(2, '0');
  const utcMinutes = time.getUTCMinutes().toString().padStart(2, '0');
  const utcSeconds = time.getUTCSeconds().toString().padStart(2, '0');

  const unixTimestamp = Math.floor(time.getTime() / 1000);
  const julianDate = getJulianDate(time);

  const oscillationPhase = (time.getTime() % 1000) / 1000;
  const cesiumCycles = Math.floor((time.getTime() % 1000) * (CESIUM_FREQUENCY / 1000));

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#00ff88] overflow-hidden relative flex flex-col">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1a3a4a 1px, transparent 1px),
            linear-gradient(to bottom, #1a3a4a 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)'
        }}
      />

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* Header */}
        <header className="mb-6 md:mb-12 text-center">
          <h1 className="font-orbitron text-xl sm:text-2xl md:text-4xl tracking-[0.3em] md:tracking-[0.5em] uppercase text-[#00ff88] mb-2">
            Atomic Clock
          </h1>
          <div className="font-mono text-[10px] sm:text-xs text-[#ffaa00] tracking-widest">
            CESIUM-133 HYPERFINE TRANSITION REFERENCE
          </div>
        </header>

        {/* Primary time display */}
        <div className="relative mb-6 md:mb-12">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-3xl bg-[#00ff88] opacity-20 scale-150" />

          <div className="relative bg-[#0a0a0f]/80 border border-[#00ff88]/30 p-4 sm:p-6 md:p-10 rounded-sm">
            <div className="font-mono text-[clamp(2.5rem,12vw,8rem)] md:text-[10rem] leading-none tracking-tight flex items-baseline">
              <span className="text-[#00ff88] drop-shadow-[0_0_20px_#00ff88]">
                {hours}:{minutes}:{seconds}
              </span>
              <span className="text-[#ffaa00] text-[clamp(1rem,4vw,2.5rem)] md:text-[3rem] ml-1 md:ml-2 drop-shadow-[0_0_10px_#ffaa00]">
                .{milliseconds}
              </span>
              <span className="text-[#00ff88]/50 text-[clamp(0.6rem,2vw,1.25rem)] md:text-[1.5rem] ml-0.5 md:ml-1">
                {microseconds}
              </span>
            </div>

            {/* Precision indicator */}
            <div className="mt-3 md:mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-4 font-mono text-[10px] sm:text-xs text-[#00ff88]/60">
              <span>PRECISION: 10<sup>-6</sup>s</span>
              <span className="hidden sm:inline">|</span>
              <span>DRIFT: {drift.toFixed(4)}ms</span>
              <span className="hidden sm:inline">|</span>
              <span className="text-[#ffaa00]">SYNC: ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Cesium oscillation visualizer */}
        <div className="w-full max-w-3xl mb-6 md:mb-12">
          <div className="bg-[#0a0a0f]/60 border border-[#1a3a4a] p-3 md:p-4 rounded-sm">
            <div className="flex justify-between items-center mb-2 md:mb-3 font-mono text-[9px] sm:text-[10px] text-[#00ff88]/60">
              <span>CESIUM-133 OSCILLATION</span>
              <span className="text-[#ffaa00]">{CESIUM_FREQUENCY.toLocaleString()} Hz</span>
            </div>

            <div className="relative h-16 md:h-24 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                {/* Wave animation */}
                {[...Array(3)].map((_, i) => (
                  <path
                    key={i}
                    d={generateWavePath(oscillationPhase + i * 0.1, 50, 30 - i * 5)}
                    fill="none"
                    stroke={i === 0 ? '#00ff88' : '#00ff88'}
                    strokeWidth={3 - i}
                    opacity={1 - i * 0.3}
                    style={{
                      filter: i === 0 ? 'drop-shadow(0 0 8px #00ff88)' : 'none'
                    }}
                  />
                ))}

                {/* Vertical scanning line */}
                <line
                  x1={oscillationPhase * 400}
                  y1="0"
                  x2={oscillationPhase * 400}
                  y2="100"
                  stroke="#ffaa00"
                  strokeWidth="2"
                  opacity="0.6"
                />
              </svg>

              {/* Cycle counter */}
              <div className="absolute bottom-0 sm:bottom-1 right-1 sm:right-2 font-mono text-[8px] sm:text-[10px] text-[#00ff88]/40">
                CYCLES: {cesiumCycles.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary displays grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <TimeBlock
            label="UTC TIME"
            value={`${utcHours}:${utcMinutes}:${utcSeconds}`}
            sublabel="COORDINATED UNIVERSAL TIME"
          />
          <TimeBlock
            label="UNIX EPOCH"
            value={unixTimestamp.toString()}
            sublabel="SECONDS SINCE 1970-01-01"
          />
          <TimeBlock
            label="JULIAN DATE"
            value={formatWithPrecision(julianDate, 5)}
            sublabel="ASTRONOMICAL DAY NUMBER"
          />
          <TimeBlock
            label="TAI OFFSET"
            value="+37s"
            sublabel="INTERNATIONAL ATOMIC TIME"
            accent
          />
        </div>

        {/* Status bar */}
        <div className="mt-6 md:mt-12 w-full max-w-4xl">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 font-mono text-[9px] sm:text-[10px] text-[#00ff88]/40">
            <StatusIndicator label="SIGNAL" status="nominal" />
            <StatusIndicator label="FREQUENCY LOCK" status="nominal" />
            <StatusIndicator label="TEMPERATURE" status="nominal" />
            <StatusIndicator label="MAGNETIC FIELD" status="nominal" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 md:py-6 text-center">
        <p className="font-mono text-[10px] sm:text-xs text-[#00ff88]/30 tracking-wide">
          Requested by @stringer_kade · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

function generateWavePath(phase: number, centerY: number, amplitude: number): string {
  const points: string[] = [];
  for (let x = 0; x <= 400; x += 2) {
    const y = centerY + Math.sin((x / 20) + phase * Math.PI * 2) * amplitude;
    points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  return points.join(' ');
}

interface TimeBlockProps {
  label: string;
  value: string;
  sublabel: string;
  accent?: boolean;
}

function TimeBlock({ label, value, sublabel, accent }: TimeBlockProps) {
  return (
    <div className="bg-[#0a0a0f]/60 border border-[#1a3a4a] p-3 md:p-4 rounded-sm group hover:border-[#00ff88]/50 transition-colors">
      <div className="font-mono text-[9px] sm:text-[10px] text-[#00ff88]/60 mb-1 md:mb-2 tracking-wider">
        {label}
      </div>
      <div className={`font-mono text-lg sm:text-xl md:text-2xl ${accent ? 'text-[#ffaa00]' : 'text-[#00ff88]'} tracking-wide truncate`}>
        {value}
      </div>
      <div className="font-mono text-[7px] sm:text-[8px] text-[#00ff88]/30 mt-1 md:mt-2 tracking-wider">
        {sublabel}
      </div>
    </div>
  );
}

interface StatusIndicatorProps {
  label: string;
  status: 'nominal' | 'warning' | 'error';
}

function StatusIndicator({ label, status }: StatusIndicatorProps) {
  const colors = {
    nominal: 'bg-[#00ff88]',
    warning: 'bg-[#ffaa00]',
    error: 'bg-red-500'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${colors[status]} animate-pulse`} />
      <span>{label}</span>
    </div>
  );
}

export default App;

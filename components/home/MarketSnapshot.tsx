'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { mockTransactions } from '@/lib/mock';

const MARKET_DATA = [
  { month: 'Jan', hdb: 171, private: 186 },
  { month: 'Feb', hdb: 172, private: 188 },
  { month: 'Mar', hdb: 173, private: 191 },
  { month: 'Apr', hdb: 174, private: 192 },
  { month: 'May', hdb: 175, private: 194 },
  { month: 'Jun', hdb: 177, private: 196 },
  { month: 'Jul', hdb: 178, private: 198 },
  { month: 'Aug', hdb: 179, private: 199 },
  { month: 'Sep', hdb: 180, private: 201 },
  { month: 'Oct', hdb: 182, private: 202 },
  { month: 'Nov', hdb: 183, private: 204 },
  { month: 'Dec', hdb: 185, private: 205 },
];

function formatTransactionPrice(price: number): string {
  if (price >= 1_000_000) return `S$${(price / 1_000_000).toFixed(2)}M`;
  return `S$${price.toLocaleString()}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' });
}

const recentTransactions = [...mockTransactions]
  .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime())
  .slice(0, 5);

export function MarketSnapshot() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E293B]">
            Singapore Market Snapshot
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Live data
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Chart — 60% */}
          <div className="flex-[60]">
            <p className="text-sm text-gray-500 mb-4 font-medium">
              Price Index 2024 — HDB Resale vs Private Residential
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={MARKET_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="hdbGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="privateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[160, 215]}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="hdb"
                  name="HDB Resale Index"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#hdbGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#10B981' }}
                />
                <Area
                  type="monotone"
                  dataKey="private"
                  name="Private Residential Index"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#privateGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#6366F1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions — 40% */}
          <div className="flex-[40]">
            <p className="text-sm text-gray-500 mb-4 font-medium">Recent Transactions</p>
            <div className="space-y-3">
              {recentTransactions.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">No recent transactions available.</p>
              )}
              {recentTransactions.map((tx) => (
                <div
                  key={`${tx.propertyId}-${String(tx.transactionDate.getTime())}`}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1E293B] truncate max-w-[200px]">
                      {tx.propertyId}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(tx.transactionDate)}
                      {tx.psf && (
                        <span className="ml-2 text-gray-400">· S${tx.psf}/psf</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-[#10B981]">
                      {formatTransactionPrice(tx.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/insights"
              className="mt-4 inline-block text-sm font-semibold text-[#6366F1] hover:text-indigo-400 transition-colors"
            >
              View all transactions →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

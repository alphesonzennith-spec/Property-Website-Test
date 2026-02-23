'use client';

import { Property } from '@/types/property';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceHistoryTabProps {
  property: Property;
}

export function PriceHistoryTab({ property }: PriceHistoryTabProps) {
  // Mock price history data (6 months)
  const generateMockPriceHistory = () => {
    const months = 6;
    const data = [];
    const currentPrice = property.price;
    const variance = currentPrice * 0.05; // 5% variance

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const randomChange = (Math.random() - 0.5) * variance;
      const price = i === 0 ? currentPrice : currentPrice + randomChange;

      data.push({
        date: date.toLocaleDateString('en-SG', { month: 'short', year: 'numeric' }),
        price: Math.round(price),
        psf: property.psf ? Math.round((price / property.floorAreaSqft) * 100) / 100 : 0,
      });
    }

    return data;
  };

  const priceHistory = generateMockPriceHistory();

  // Chart data
  const chartData = {
    labels: priceHistory.map((d) => d.date),
    datasets: [
      {
        label: 'Property Price (SGD)',
        data: priceHistory.map((d) => d.price),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `SGD $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: any) {
            return `$${(value / 1000).toFixed(0)}k`;
          },
        },
      },
    },
  };

  // Calculate price change
  const firstPrice = priceHistory[0].price;
  const lastPrice = priceHistory[priceHistory.length - 1].price;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Price Trend Summary */}
      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Price Trend (Last 6 Months)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-emerald-200">
              <p className="text-xs text-gray-500 font-medium mb-1">Current Price</p>
              <p className="text-2xl font-extrabold text-emerald-600">
                ${property.price.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-emerald-200">
              <p className="text-xs text-gray-500 font-medium mb-1">6-Month Change</p>
              <p className={`text-2xl font-extrabold ${priceChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-emerald-200">
              <p className="text-xs text-gray-500 font-medium mb-1">Percentage Change</p>
              <p className={`text-2xl font-extrabold ${priceChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChangePercent}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price History Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Price History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Historical Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">Price (SGD)</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">PSF (SGD)</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">Change</th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.map((record, index) => {
                  const prevPrice = index > 0 ? priceHistory[index - 1].price : record.price;
                  const change = record.price - prevPrice;
                  const changePercent = prevPrice > 0 ? ((change / prevPrice) * 100).toFixed(2) : '0.00';

                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{record.date}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ${record.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        ${record.psf.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {index === 0 ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className={change >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {change >= 0 ? '+' : ''}{changePercent}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg">Market Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This price history data is simulated for demonstration purposes.
                Actual historical pricing data would come from transaction records and market data providers.
              </p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Price trends are influenced by various factors including location, market conditions,
              nearby developments, and economic indicators. Contact us for detailed market analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

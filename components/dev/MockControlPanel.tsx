'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Beaker, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { MOCK_CONTROLS, resetMockControls, getControlLabel, type MockControls } from '@/lib/mock/mockControls';

/**
 * Development-only Mock Control Panel
 *
 * Floating panel (bottom-left) for testing failure states, latency, and edge cases.
 * Only rendered when NODE_ENV === 'development'.
 *
 * Features:
 * - Toggle failure simulations (errors, empty states, etc.)
 * - Adjust artificial latency
 * - Test loading states
 * - Reset all controls
 */
export function MockControlPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [controls, setControls] = useState<MockControls>(MOCK_CONTROLS);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Sync local state with global MOCK_CONTROLS
  useEffect(() => {
    const interval = setInterval(() => {
      setControls({ ...MOCK_CONTROLS });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Toggle a boolean control
  const toggleControl = (key: keyof MockControls) => {
    if (typeof MOCK_CONTROLS[key] === 'boolean') {
      (MOCK_CONTROLS[key] as boolean) = !(MOCK_CONTROLS[key] as boolean);
      setControls({ ...MOCK_CONTROLS });
    }
  };

  // Update a number control
  const updateNumber = (key: keyof MockControls, value: number) => {
    if (typeof MOCK_CONTROLS[key] === 'number') {
      (MOCK_CONTROLS[key] as number) = value;
      setControls({ ...MOCK_CONTROLS });
    }
  };

  // Reset all controls to defaults
  const handleReset = () => {
    resetMockControls();
    setControls({ ...MOCK_CONTROLS });
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
        title="Open Mock Controls"
      >
        <Beaker className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-96 shadow-2xl border-purple-200 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-base">Mock Controls</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">
          Test failures, latency & edge cases
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Latency Controls */}
          <div className="space-y-3 pb-3 border-b">
            <h4 className="text-sm font-semibold text-gray-700">Latency Simulation</h4>

            <div className="space-y-2">
              <Label htmlFor="baseDelay" className="text-xs text-gray-600">
                Base Delay: {controls.artificialDelay}ms
              </Label>
              <Input
                id="baseDelay"
                type="range"
                min="0"
                max="3000"
                step="50"
                value={controls.artificialDelay}
                onChange={(e) => updateNumber('artificialDelay', Number(e.target.value))}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variance" className="text-xs text-gray-600">
                Random Variance: {controls.randomDelayVariance}ms
              </Label>
              <Input
                id="variance"
                type="range"
                min="0"
                max="2000"
                step="50"
                value={controls.randomDelayVariance}
                onChange={(e) => updateNumber('randomDelayVariance', Number(e.target.value))}
                className="h-2"
              />
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Total: {controls.artificialDelay}ms + 0-{controls.randomDelayVariance}ms
            </div>
          </div>

          {/* Failure Simulation */}
          <div className="space-y-3 pb-3 border-b">
            <h4 className="text-sm font-semibold text-gray-700">Failure Simulation</h4>

            {(['failPropertiesList', 'failPropertyDetail', 'failRegulatoryRates', 'failAuth'] as const).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-xs text-gray-700 cursor-pointer">
                  {getControlLabel(key)}
                </Label>
                <Switch
                  id={key}
                  checked={controls[key] as boolean}
                  onCheckedChange={() => toggleControl(key)}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          {/* Edge Cases */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Edge Cases</h4>

            {(['returnEmptyListings', 'returnNullImages', 'returnSlowImages', 'simulateExpiredSession'] as const).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-xs text-gray-700 cursor-pointer">
                  {getControlLabel(key)}
                </Label>
                <Switch
                  id={key}
                  checked={controls[key] as boolean}
                  onCheckedChange={() => toggleControl(key)}
                  className="data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="default"
              size="sm"
              className="flex-1 text-xs"
            >
              Done
            </Button>
          </div>

          {/* Active Controls Indicator */}
          {Object.entries(controls).some(([key, value]) =>
            typeof value === 'boolean' && value && !key.startsWith('artificial') && !key.startsWith('random')
          ) && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
              <strong>⚠️ Active:</strong> Some failures/edge cases are enabled
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

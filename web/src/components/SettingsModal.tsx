'use client';

import { X, Clock, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/settingsStore';
import { UpdateFrequency, TemperatureUnit } from '@/types/settings';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, setUpdateFrequency, setTemperatureUnit } = useSettingsStore();

  const updateFrequencyOptions: { value: UpdateFrequency; label: string }[] = [
    { value: '30min', label: 'Every 30 minutes' },
    { value: '1hour', label: 'Every hour' },
    { value: '1day', label: 'Every day' },
  ];

  const temperatureUnitOptions: { value: TemperatureUnit; label: string }[] = [
    { value: 'celsius', label: 'Celsius (°C)' },
    { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl transform transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          {/* Header */}
          <div className="text-center text-white mb-8">
            <h2 className="text-2xl font-light mb-1">Settings</h2>
            <p className="text-white/80 text-sm">Customize your weather experience</p>
          </div>

          {/* Update Frequency Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-5 h-5 text-white/70" />
              <h3 className="text-white text-lg font-medium">Update Frequency</h3>
            </div>
            
            <div className="space-y-2">
              {updateFrequencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setUpdateFrequency(option.value)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    settings.updateFrequency === option.value
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {settings.updateFrequency === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Unit Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Thermometer className="w-5 h-5 text-white/70" />
              <h3 className="text-white text-lg font-medium">Temperature Unit</h3>
            </div>
            
            <div className="space-y-2">
              {temperatureUnitOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTemperatureUnit(option.value)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    settings.temperatureUnit === option.value
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {settings.temperatureUnit === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="glass"
            className="w-full text-white border-white/30"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

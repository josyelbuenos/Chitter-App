'use client';

import { useTheme } from '@/contexts/theme-context';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEMES } from '@/lib/themes';

export default function ThemesSettingsPage() {
  const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Tema da Interface</h3>
        <RadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark')} className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light">Claro</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark">Escuro</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Cor Principal</h3>
        <div className="grid grid-cols-5 md:grid-cols-8 gap-4">
          {THEMES.map((colorOption) => (
            <div key={colorOption.name} className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'h-12 w-12 rounded-full border-4 transition-all',
                  primaryColor === colorOption.name
                    ? 'border-ring'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
                style={{ backgroundColor: `hsl(${colorOption.hsl})` }}
                onClick={() => setPrimaryColor(colorOption.name)}
                aria-label={`Selecionar cor ${colorOption.label}`}
              >
                {primaryColor === colorOption.name && <Check className="h-6 w-6 text-white" />}
              </Button>
              <span className="text-xs text-muted-foreground">{colorOption.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

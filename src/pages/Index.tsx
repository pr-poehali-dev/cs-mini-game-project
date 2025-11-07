import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
        
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-7xl text-primary pixel-text animate-fade-in mb-4">
              CS 2D STRIKE
            </h1>
            
            <p className="text-sm md:text-base text-foreground/80 pixel-text animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Классический 2D шутер в пиксельном стиле
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                onClick={() => navigate('/game')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground retro-shadow text-xs px-8 py-6"
              >
                🎮 ИГРАТЬ СЕЙЧАС
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 bg-card border-2 border-border retro-shadow hover:scale-105 transition-transform">
            <div className="text-center space-y-4">
              <div className="text-4xl">🔫</div>
              <h3 className="text-sm text-primary pixel-text">АРСЕНАЛ ОРУЖИЯ</h3>
              <p className="text-xs text-foreground/70">
                Desert Eagle, AK-47, AWP и другое легендарное оружие
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-2 border-border retro-shadow hover:scale-105 transition-transform">
            <div className="text-center space-y-4">
              <div className="text-4xl">✨</div>
              <h3 className="text-sm text-primary pixel-text">СИСТЕМА СКИНОВ</h3>
              <p className="text-xs text-foreground/70">
                Кастомизируй своё оружие уникальными скинами
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-2 border-border retro-shadow hover:scale-105 transition-transform">
            <div className="text-center space-y-4">
              <div className="text-4xl">🌊</div>
              <h3 className="text-sm text-primary pixel-text">ВОЛНЫ ВРАГОВ</h3>
              <p className="text-xs text-foreground/70">
                Выживай против бесконечных волн противников
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <Card className="p-8 max-w-3xl mx-auto bg-card border-2 border-secondary retro-shadow">
          <h2 className="text-2xl md:text-3xl text-secondary pixel-text text-center mb-8">
            КАК ИГРАТЬ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-foreground">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⌨️</div>
                <div>
                  <div className="text-primary pixel-text mb-1">ДВИЖЕНИЕ</div>
                  <div className="text-foreground/70">WASD или стрелки</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">🖱️</div>
                <div>
                  <div className="text-primary pixel-text mb-1">ПРИЦЕЛ</div>
                  <div className="text-foreground/70">Наведи мышью</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💥</div>
                <div>
                  <div className="text-primary pixel-text mb-1">СТРЕЛЬБА</div>
                  <div className="text-foreground/70">Клик мыши</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">🛒</div>
                <div>
                  <div className="text-primary pixel-text mb-1">МАГАЗИН</div>
                  <div className="text-foreground/70">Нажми B</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-4xl text-primary pixel-text">
            СТРАТЕГИЯ ПОБЕДЫ
          </h2>
          <div className="max-w-2xl mx-auto space-y-4 text-xs text-foreground/80">
            <p>💰 Зарабатывай деньги за убийства врагов</p>
            <p>🔫 Улучшай оружие в магазине между волнами</p>
            <p>🎨 Покупай скины для стиля и статуса</p>
            <p>🏆 Выживай как можно дольше и побей свой рекорд</p>
          </div>
          <Button 
            onClick={() => navigate('/game')}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground retro-shadow text-xs px-8 py-6 mt-8"
          >
            🚀 НАЧАТЬ БИТВУ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

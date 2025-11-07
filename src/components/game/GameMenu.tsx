import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GameMenuProps {
  gameStarted: boolean;
  playerHealth: number;
  kills: number;
  wave: number;
  startGame: () => void;
  onNavigateHome: () => void;
}

const GameMenu = ({
  gameStarted,
  playerHealth,
  kills,
  wave,
  startGame,
  onNavigateHome
}: GameMenuProps) => {
  if (gameStarted && playerHealth > 0) {
    return null;
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-2xl w-full bg-card border-2 border-primary retro-shadow">
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-5xl text-primary pixel-text mb-8">
              CS 2D STRIKE
            </h1>
            <div className="space-y-4 text-sm text-foreground">
              <p>🎮 WASD или стрелки - движение</p>
              <p>🖱️ Мышь - прицеливание</p>
              <p>💥 Клик - стрельба</p>
              <p>🛒 B - открыть магазин</p>
            </div>
            <div className="flex gap-4 justify-center mt-8">
              <Button 
                onClick={startGame}
                className="bg-primary hover:bg-primary/90 text-primary-foreground retro-shadow text-xs px-6 py-6"
              >
                НАЧАТЬ ИГРУ
              </Button>
              <Button 
                onClick={onNavigateHome}
                variant="outline"
                className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground retro-shadow text-xs px-6 py-6"
              >
                ГЛАВНАЯ
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (playerHealth <= 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full bg-card border-2 border-destructive retro-shadow">
          <div className="text-center space-y-6">
            <h2 className="text-3xl text-destructive pixel-text">GAME OVER</h2>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">Убийств: {kills}</p>
              <p className="text-foreground">Волна: {wave}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground retro-shadow text-xs px-6 py-4"
            >
              ЗАНОВО
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default GameMenu;

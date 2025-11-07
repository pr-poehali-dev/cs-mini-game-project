import { RefObject } from 'react';

interface Player {
  x: number;
  y: number;
  health: number;
  money: number;
  currentWeapon: string;
  angle: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
}

interface GameCanvasProps {
  canvasRef: RefObject<HTMLDivElement>;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  selectedSkin: string;
  isMobile: boolean;
  joystickPos: { x: number; y: number };
  isJoystickActive: boolean;
  setJoystickPos: (pos: { x: number; y: number }) => void;
  setIsJoystickActive: (active: boolean) => void;
  setShowShop: (show: boolean | ((prev: boolean) => boolean)) => void;
  shoot: () => void;
}

const GameCanvas = ({
  canvasRef,
  player,
  enemies,
  bullets,
  selectedSkin,
  isMobile,
  joystickPos,
  isJoystickActive,
  setJoystickPos,
  setIsJoystickActive,
  setShowShop,
  shoot
}: GameCanvasProps) => {
  return (
    <div 
      ref={canvasRef}
      className="relative w-full bg-muted border-0 md:border-4 border-border overflow-hidden retro-shadow"
      style={{ 
        height: isMobile ? 'calc(100vh - 60px)' : 'auto',
        aspectRatio: isMobile ? 'auto' : '4/3',
        maxHeight: isMobile ? 'none' : '600px',
        cursor: 'crosshair' 
      }}
    >
      <div
        className="absolute w-8 h-8 bg-secondary border-2 border-foreground transition-all"
        style={{
          left: `${player.x}px`,
          top: `${player.y}px`,
          transform: `translate(-50%, -50%) rotate(${player.angle}rad)`
        }}
      >
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-xl">
          {selectedSkin}
        </div>
      </div>

      {enemies.map(enemy => (
        <div
          key={enemy.id}
          className="absolute w-8 h-8 bg-destructive border-2 border-foreground"
          style={{
            left: `${enemy.x}px`,
            top: `${enemy.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-xs">
            👾
          </div>
        </div>
      ))}

      {bullets.map(bullet => (
        <div
          key={bullet.id}
          className="absolute w-2 h-2 bg-primary rounded-full"
          style={{
            left: `${bullet.x}px`,
            top: `${bullet.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {isMobile && (
        <>
          <button
            onClick={() => setShowShop(prev => !prev)}
            className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-3 py-2 text-xs border-2 border-foreground retro-shadow z-10"
          >
            🛒
          </button>
          <div
            className="absolute bottom-4 left-4 w-24 h-24 md:w-32 md:h-32 bg-muted/50 border-2 border-border rounded-full"
            onTouchStart={(e) => {
              setIsJoystickActive(true);
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              setJoystickPos({
                x: touch.clientX - centerX,
                y: touch.clientY - centerY
              });
            }}
            onTouchMove={(e) => {
              if (!isJoystickActive) return;
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const deltaX = touch.clientX - centerX;
              const deltaY = touch.clientY - centerY;
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              const maxDistance = 50;
              
              if (distance > maxDistance) {
                setJoystickPos({
                  x: (deltaX / distance) * maxDistance,
                  y: (deltaY / distance) * maxDistance
                });
              } else {
                setJoystickPos({ x: deltaX, y: deltaY });
              }
            }}
            onTouchEnd={() => {
              setIsJoystickActive(false);
              setJoystickPos({ x: 0, y: 0 });
            }}
          >
            <div
              className="absolute w-12 h-12 bg-secondary border-2 border-foreground rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
              }}
            />
          </div>

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              shoot();
            }}
            className="absolute bottom-4 right-4 w-16 h-16 md:w-20 md:h-20 bg-primary border-4 border-foreground rounded-full flex items-center justify-center text-2xl md:text-3xl active:scale-95 retro-shadow"
          >
            💥
          </button>
        </>
      )}
    </div>
  );
};

export default GameCanvas;

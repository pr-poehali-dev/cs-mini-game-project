import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import GameMenu from '@/components/game/GameMenu';
import GameCanvas from '@/components/game/GameCanvas';
import WeaponShop from '@/components/game/WeaponShop';

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

const WEAPONS = {
  'Desert Eagle': { damage: 50, price: 700, fireRate: 400, skin: '🔫' },
  'AK-47': { damage: 36, price: 2700, fireRate: 100, skin: '🔴' },
  'AWP': { damage: 115, price: 4750, fireRate: 1500, skin: '🎯' }
};

const Game = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [player, setPlayer] = useState<Player>({
    x: 400,
    y: 300,
    health: 100,
    money: 800,
    currentWeapon: 'Desert Eagle',
    angle: 0
  });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [kills, setKills] = useState(0);
  const [wave, setWave] = useState(1);
  const [selectedSkin, setSelectedSkin] = useState<string>('🔫');
  const [isMobile, setIsMobile] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastShot = useRef<number>(0);
  const mousePos = useRef({ x: 0, y: 0 });

  const spawnEnemies = useCallback((count: number) => {
    const newEnemies: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      if (side === 0) { x = Math.random() * 800; y = -20; }
      else if (side === 1) { x = 820; y = Math.random() * 600; }
      else if (side === 2) { x = Math.random() * 800; y = 620; }
      else { x = -20; y = Math.random() * 600; }
      
      newEnemies.push({
        id: Date.now() + i,
        x,
        y,
        health: 100 + (wave * 10)
      });
    }
    setEnemies(prev => [...prev, ...newEnemies]);
  }, [wave]);

  const shoot = useCallback(() => {
    const now = Date.now();
    const weapon = WEAPONS[player.currentWeapon as keyof typeof WEAPONS];
    if (now - lastShot.current < weapon.fireRate) return;
    
    lastShot.current = now;
    const newBullet: Bullet = {
      id: Date.now(),
      x: player.x,
      y: player.y,
      angle: player.angle,
      speed: 10
    };
    setBullets(prev => [...prev, newBullet]);
  }, [player]);

  const buyWeapon = (weaponName: string) => {
    const weapon = WEAPONS[weaponName as keyof typeof WEAPONS];
    if (player.money >= weapon.price) {
      setPlayer(prev => ({
        ...prev,
        money: prev.money - weapon.price,
        currentWeapon: weaponName
      }));
      setSelectedSkin(weapon.skin);
    }
  };

  const buySkin = (weaponName: string, skin: string) => {
    if (player.currentWeapon === weaponName && player.money >= 500) {
      setPlayer(prev => ({ ...prev, money: prev.money - 500 }));
      setSelectedSkin(skin);
    }
  };

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (e.key.toLowerCase() === 'b') setShowShop(prev => !prev);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mousePos.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };

    const handleClick = () => {
      shoot();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [gameStarted, shoot]);

  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = setInterval(() => {
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 3;

        if (keysPressed.current.has('w')) newY -= speed;
        if (keysPressed.current.has('s')) newY += speed;
        if (keysPressed.current.has('a')) newX -= speed;
        if (keysPressed.current.has('d')) newX += speed;

        if (isJoystickActive) {
          newX += joystickPos.x * speed * 0.02;
          newY += joystickPos.y * speed * 0.02;
        }

        newX = Math.max(20, Math.min(780, newX));
        newY = Math.max(20, Math.min(580, newY));

        const dx = mousePos.current.x - newX;
        const dy = mousePos.current.y - newY;
        const angle = Math.atan2(dy, dx);

        return { ...prev, x: newX, y: newY, angle };
      });

      setBullets(prev => {
        const updated = prev.map(bullet => ({
          ...bullet,
          x: bullet.x + Math.cos(bullet.angle) * bullet.speed,
          y: bullet.y + Math.sin(bullet.angle) * bullet.speed
        }));
        return updated.filter(b => b.x > 0 && b.x < 800 && b.y > 0 && b.y < 600);
      });

      setEnemies(prev => {
        return prev.map(enemy => {
          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 5) {
            setPlayer(p => ({ ...p, health: Math.max(0, p.health - 5) }));
          }
          return {
            ...enemy,
            x: enemy.x + (dx / dist) * 0.8,
            y: enemy.y + (dy / dist) * 0.8
          };
        });
      });

      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        setEnemies(prevEnemies => {
          let newEnemies = [...prevEnemies];
          remainingBullets.forEach(bullet => {
            newEnemies = newEnemies.filter(enemy => {
              const dx = bullet.x - enemy.x;
              const dy = bullet.y - enemy.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 20) {
                const weapon = WEAPONS[player.currentWeapon as keyof typeof WEAPONS];
                enemy.health -= weapon.damage;
                if (enemy.health <= 0) {
                  setKills(k => k + 1);
                  setPlayer(p => ({ ...p, money: p.money + 300 }));
                  return false;
                }
              }
              return true;
            });
          });
          return newEnemies;
        });
        return remainingBullets;
      });

      if (enemies.length === 0) {
        setWave(w => w + 1);
        spawnEnemies(3 + wave);
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameStarted, player.x, player.y, player.currentWeapon, enemies.length, wave, spawnEnemies, isJoystickActive, joystickPos.x, joystickPos.y]);

  const startGame = () => {
    setGameStarted(true);
    spawnEnemies(3);
  };

  return (
    <>
      <GameMenu
        gameStarted={gameStarted}
        playerHealth={player.health}
        kills={kills}
        wave={wave}
        startGame={startGame}
        onNavigateHome={() => navigate('/')}
      />

      {gameStarted && player.health > 0 && (
        <div className="min-h-screen bg-background p-0 md:p-4">
          <div className="max-w-6xl mx-auto space-y-2 md:space-y-4">
            <div className="flex justify-between items-center px-2 py-2 md:px-0">
              <div className="flex gap-2 md:gap-4 text-xs text-foreground flex-wrap">
                <div className="bg-card px-2 py-1 md:px-3 md:py-2 border border-border retro-shadow">
                  ❤️ {player.health}
                </div>
                <div className="bg-card px-2 py-1 md:px-3 md:py-2 border border-border retro-shadow">
                  💰 ${player.money}
                </div>
                <div className="bg-card px-2 py-1 md:px-3 md:py-2 border border-border retro-shadow">
                  💀 {kills}
                </div>
                <div className="bg-card px-2 py-1 md:px-3 md:py-2 border border-border retro-shadow">
                  🌊 {wave}
                </div>
              </div>
              {!isMobile && (
                <Button
                  onClick={() => setShowShop(!showShop)}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground retro-shadow text-xs px-4 py-2"
                >
                  🛒 МАГАЗИН (B)
                </Button>
              )}
            </div>

            <GameCanvas
              canvasRef={canvasRef}
              player={player}
              enemies={enemies}
              bullets={bullets}
              selectedSkin={selectedSkin}
              isMobile={isMobile}
              joystickPos={joystickPos}
              isJoystickActive={isJoystickActive}
              setJoystickPos={setJoystickPos}
              setIsJoystickActive={setIsJoystickActive}
              setShowShop={setShowShop}
              shoot={shoot}
            />

            <WeaponShop
              showShop={showShop}
              player={player}
              isMobile={isMobile}
              buyWeapon={buyWeapon}
              buySkin={buySkin}
              setShowShop={setShowShop}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Game;

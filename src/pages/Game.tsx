import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

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

const WEAPON_SKINS = {
  'Desert Eagle': ['🔫', '💛', '💙', '💚'],
  'AK-47': ['🔴', '🟠', '🟡', '🟢'],
  'AWP': ['🎯', '⭐', '🌟', '✨']
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
  }, [gameStarted, player.x, player.y, player.currentWeapon, enemies.length, wave, spawnEnemies]);

  const startGame = () => {
    setGameStarted(true);
    spawnEnemies(3);
  };

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
                onClick={() => navigate('/')}
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

  if (player.health <= 0) {
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

  return (
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
                onClick={() => setShowShop(!showShop)}
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

        {showShop && (
          <Card className={`p-4 md:p-6 bg-card border-2 border-primary retro-shadow ${isMobile ? 'fixed inset-4 z-50 overflow-y-auto' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl text-primary pixel-text">МАГАЗИН ОРУЖИЯ</h3>
              {isMobile && (
                <button
                  onClick={() => setShowShop(false)}
                  className="text-foreground text-xl px-2"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(WEAPONS).map(([name, weapon]) => (
                <div key={name} className="border-2 border-border p-4 space-y-3">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{weapon.skin}</div>
                    <div className="text-xs text-foreground mb-2">{name}</div>
                    <div className="text-xs text-muted-foreground">
                      💥 Урон: {weapon.damage}
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      💰 ${weapon.price}
                    </div>
                  </div>
                  <Button
                    onClick={() => buyWeapon(name)}
                    disabled={player.money < weapon.price || player.currentWeapon === name}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-2"
                  >
                    {player.currentWeapon === name ? 'ВЫБРАНО' : 'КУПИТЬ'}
                  </Button>
                  <div className="pt-3 border-t border-border">
                    <div className="text-xs text-foreground mb-2">Скины ($500):</div>
                    <div className="flex gap-2 justify-center">
                      {WEAPON_SKINS[name as keyof typeof WEAPON_SKINS].map(skin => (
                        <button
                          key={skin}
                          onClick={() => buySkin(name, skin)}
                          disabled={player.currentWeapon !== name || player.money < 500}
                          className="text-2xl hover:scale-110 transition-transform disabled:opacity-50"
                        >
                          {skin}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Game;
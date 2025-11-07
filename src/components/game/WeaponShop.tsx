import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Player {
  x: number;
  y: number;
  health: number;
  money: number;
  currentWeapon: string;
  angle: number;
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

interface WeaponShopProps {
  showShop: boolean;
  player: Player;
  isMobile: boolean;
  buyWeapon: (weaponName: string) => void;
  buySkin: (weaponName: string, skin: string) => void;
  setShowShop: (show: boolean) => void;
}

const WeaponShop = ({
  showShop,
  player,
  isMobile,
  buyWeapon,
  buySkin,
  setShowShop
}: WeaponShopProps) => {
  if (!showShop) {
    return null;
  }

  return (
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
  );
};

export default WeaponShop;

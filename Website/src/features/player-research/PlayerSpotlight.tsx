import { PlayerCutout } from "@/components/media/PlayerCutout";
import type { Player, Team } from "@/data/types";

interface PlayerSpotlightProps {
  player: Player;
  team: Team;
}

/**
 * The player whose page this is, at the top of the side panel. It plays a
 * short intro once when the player is opened: the team's glow opens, the
 * player rises into it, then the name arrives. After that it rests as a
 * banner. The delays are in the class names below; the whole intro takes
 * about a second and a half and nothing waits for it.
 */
export function PlayerSpotlight({ player, team }: PlayerSpotlightProps) {
  return (
    <div className="relative mx-4 mt-3 h-28 shrink-0 overflow-hidden rounded-xl bg-inset">
      <div
        aria-hidden="true"
        className="absolute inset-0 origin-bottom-right animate-glow-in"
        style={{
          background: `radial-gradient(85% 130% at 78% 100%, color-mix(in srgb, ${team.color} 55%, transparent), transparent 70%)`,
        }}
      />
      <PlayerCutout
        headshotKey={player.headshotKey}
        className="absolute bottom-0 right-0 h-[94%] animate-cutout-in [animation-delay:250ms]"
      />
      <div className="relative flex h-full max-w-[58%] flex-col justify-end p-3.5">
        <p className="animate-rise-in font-mono text-[10px] uppercase tracking-wider text-fg-muted [animation-delay:800ms]">
          {team.abbr} · {player.position}
        </p>
        <p className="mt-0.5 animate-rise-in text-[15px] font-bold leading-tight tracking-tight text-fg [animation-delay:950ms]">
          {player.name}
        </p>
      </div>
    </div>
  );
}

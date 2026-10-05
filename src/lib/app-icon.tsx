const RACING_RED = "#c2192b";
const CARBON = "#17130f";
const GOLD = "#f4b728";

/**
 * Shared JSX for the app's generated icons (ImageResponse). `safeZone`
 * shrinks the monogram and stripes for maskable icons, whose corners/edges
 * may be cropped by the OS.
 */
export function AppIconMark({
  size,
  safeZone = false,
}: {
  size: number;
  safeZone?: boolean;
}) {
  const fontSize = safeZone ? size * 0.3 : size * 0.44;
  const bandWidth = size * (safeZone ? 0.95 : 1.6);
  const bandLeft = safeZone ? size * 0.025 : -size * 0.3;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: RACING_RED,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: bandWidth,
          height: size * 0.17,
          background: CARBON,
          transform: "rotate(-32deg)",
          top: size * 0.64,
          left: bandLeft,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: bandWidth,
          height: size * 0.05,
          background: GOLD,
          transform: "rotate(-32deg)",
          top: size * 0.54,
          left: bandLeft,
        }}
      />
      <span
        style={{
          fontSize,
          fontWeight: 800,
          color: "white",
          fontFamily: "sans-serif",
          letterSpacing: -1,
          transform: "skewX(-8deg)",
          position: "relative",
        }}
      >
        IL
      </span>
    </div>
  );
}

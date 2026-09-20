const VIOLET = "#7c3aed";

/**
 * Shared JSX for the app's generated icons (ImageResponse). `safeZone`
 * shrinks the monogram for maskable icons, whose corners/edges may be
 * cropped by the OS.
 */
export function AppIconMark({
  size,
  safeZone = false,
}: {
  size: number;
  safeZone?: boolean;
}) {
  const fontSize = safeZone ? size * 0.32 : size * 0.46;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: VIOLET,
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: 700,
          color: "white",
          fontFamily: "sans-serif",
          letterSpacing: -1,
        }}
      >
        IL
      </span>
    </div>
  );
}

import { ImageResponse } from "next/og";
import { AppIconMark } from "@/lib/app-icon";

export function GET() {
  return new ImageResponse(<AppIconMark size={512} safeZone />, {
    width: 512,
    height: 512,
  });
}

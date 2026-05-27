import { IOS_SPLASH_SCREENS } from "@/lib/pwa/splash-screens";

export function IosSplashLinks() {
  return (
    <>
      {IOS_SPLASH_SCREENS.map(({ href, media }) => (
        <link
          key={href}
          rel="apple-touch-startup-image"
          href={href}
          media={media}
        />
      ))}
    </>
  );
}

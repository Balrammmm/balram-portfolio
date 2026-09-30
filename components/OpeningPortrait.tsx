import Image from 'next/image';
/** The portrait is isolated from the baked-in reference lettering. */
export default function OpeningPortrait({background=false}:{background?:boolean}) {
  if (background) return <div className="opening-backdrop" aria-hidden="true"/>;
  return <Image className="opening-portrait" src="/images/hero-cutout-v2.png" width={1379} height={1141} sizes="(max-width:700px) 170vw, 80vw" alt="Balram Maurya seated in a dark suit" fetchPriority="high" loading="eager"/>;
}

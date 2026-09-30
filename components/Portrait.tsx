import Image from 'next/image';
// The original photographs stay untouched. SVG silhouettes separate the person
// from the reference's baked typography while keeping the supplied identity.
const portraits = {
  hero: { width: 1415, height: 1112, path: 'M170 1112 L174 989 Q176 941 214 886 L272 708 Q289 650 322 604 L465 587 L550 575 L608 552 L632 532 L651 516 L653 500 L636 476 Q611 448 607 405 L602 369 L597 343 L579 303 L590 266 L596 231 L613 208 L637 182 L661 172 L677 153 L700 162 L720 147 L744 159 L772 146 L798 154 L819 146 L839 163 L855 161 L875 182 L891 204 L899 227 L916 247 L916 271 L906 298 L909 321 L900 346 L884 368 L873 408 L857 453 L825 491 L812 548 L918 619 L1007 641 Q1038 650 1041 694 L1042 773 L1051 827 L1083 895 L1111 963 L1144 1112 Z' },
  about: { width: 820, height: 672, path: 'M366 514 L395 490 L427 460 L445 420 L448 371 L431 346 L417 321 L409 296 L417 273 L420 260 L411 253 L411 239 L425 229 L432 211 L412 206 L398 205 L405 190 L400 179 L411 167 L410 150 L426 141 L426 123 L443 121 L449 105 L461 102 L467 88 L482 86 L492 77 L507 86 L521 81 L539 86 L554 82 L570 90 L586 87 L601 100 L619 97 L627 113 L643 111 L650 130 L666 133 L668 151 L681 158 L679 177 L695 193 L703 215 L710 239 L706 267 L695 296 L682 321 L659 346 L629 369 L621 400 L646 437 L681 460 L725 491 L753 514 Z' },
  mind: { width: 1078, height: 1459, path: 'M325 1109 L304 1000 L348 948 L377 909 L405 887 L402 860 L386 833 L369 797 L374 770 L364 735 L368 695 L380 660 L389 637 L406 622 L402 600 L422 584 L437 563 L459 552 L478 552 L496 530 L515 538 L534 525 L555 535 L574 526 L590 539 L612 538 L625 551 L644 552 L653 569 L677 576 L683 592 L704 602 L703 624 L720 643 L711 665 L716 686 L707 708 L695 723 L681 733 L680 747 L696 763 L702 778 L691 786 L687 803 L676 813 L674 827 L661 842 L635 856 L622 885 L621 923 L647 970 L696 1027 L725 1082 L747 1126 Z' },
};
export default function Portrait({kind, className = ''}: {kind: keyof typeof portraits; className?: string}) {
  if(kind === "mind") return <Image className="portrait portrait-mind" src="/images/mind-clean.png" width={1078} height={1459} sizes="(max-width:700px) 80vw, 35vw" alt="Balram Maurya, looking upward"/>;
  const p = portraits[kind];
  return <svg className={`portrait portrait-${kind} ${className}`} viewBox={`0 0 ${p.width} ${p.height}`} aria-label="Portrait of Balram Maurya" role="img">
    <defs><filter id={`edge-${kind}`}><feGaussianBlur stdDeviation="1.35"/></filter><mask id={`silhouette-${kind}`} maskUnits="userSpaceOnUse" x="0" y="0" width={p.width} height={p.height}><path d={p.path} fill="white" filter={`url(#edge-${kind})`}/></mask></defs>
    <image href={`/images/${kind}.png`} width={p.width} height={p.height} mask={`url(#silhouette-${kind})`}/>
  </svg>;
}

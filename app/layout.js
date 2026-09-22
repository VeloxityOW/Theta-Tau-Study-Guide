import "./globals.css";

export const metadata = { title: "Theta Tau Pledge Portal", description: "Private pledge-class study portal" };

export default function RootLayout({ children }) {
  return <html lang="en"><head><style>{`
    @property --reveal-radius{syntax:"<percentage>";inherits:false;initial-value:0%}
    #initial-launch-mask{position:fixed;z-index:9999;inset:0;overflow:hidden;background:radial-gradient(circle at 50% 42%,rgba(174,49,43,.42),transparent 34%),linear-gradient(155deg,#4a090b 0%,#260304 52%,#120101 100%)}
    #initial-launch-mask.exiting{pointer-events:none;animation:initial-ripple-out 1.5s cubic-bezier(.22,.8,.25,1) both;-webkit-mask-image:radial-gradient(circle at 50% 50%,transparent 0%,transparent var(--reveal-radius),#000 calc(var(--reveal-radius) + .3%),#000 100%);mask-image:radial-gradient(circle at 50% 50%,transparent 0%,transparent var(--reveal-radius),#000 calc(var(--reveal-radius) + .3%),#000 100%)}
    @keyframes initial-ripple-out{from{--reveal-radius:0%}to{--reveal-radius:150%}}
    @media(prefers-reduced-motion:reduce){#initial-launch-mask.exiting{animation:none;display:none}}
  `}</style></head><body><div id="initial-launch-mask" aria-hidden="true" /><script dangerouslySetInnerHTML={{ __html: `window.setTimeout(function(){var mask=document.getElementById('initial-launch-mask');if(mask)mask.classList.add('exiting');},250);window.setTimeout(function(){document.getElementById('initial-launch-mask')?.remove();},1750);` }} />{children}</body></html>;
}

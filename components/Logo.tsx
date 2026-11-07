import Image from "next/image";

export default function Logo({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <div className={`relative h-10 w-[150px] ${className}`}>
      <Image
        src="/brand/logo.png"
        alt="ThinkUp Innovation Services — Empowering Innovative Minds"
        fill
        className="object-contain object-left"
        style={
          dark
            ? { filter: "invert(1) hue-rotate(180deg)", mixBlendMode: "screen" }
            : undefined
        }
        priority
      />
    </div>
  );
}

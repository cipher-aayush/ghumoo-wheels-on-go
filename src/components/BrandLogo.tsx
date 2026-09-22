import driveEasyLogo from "@/assets/driveeasy-logo-road.png";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "size-9" }: BrandLogoProps) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary/70 p-1 ring-1 ring-border ${className}`}
      aria-hidden="true"
    >
      <img
        src={driveEasyLogo}
        alt=""
        width={1024}
        height={1024}
        className="size-full object-contain"
      />
    </span>
  );
}
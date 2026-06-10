import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",

      // Light + dark friendly gradient
      background =
        "linear-gradient(135deg, rgb(156 175 136) 0%, rgb(165 200 158) 100%)",

      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <>
        <style>
          {`
            @keyframes shimmer-slide {
              0% {
                transform: translate3d(-100%, 0, 0);
              }
              100% {
                transform: translate3d(100%, 0, 0);
              }
            }

            @keyframes spin-around {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }

            .shimmer-bg-sparkle {
              animation: spin-around 6s linear infinite;
            }
          `}
        </style>

        <button
          style={
            {
              "--spread": "90deg",
              "--shimmer-color": shimmerColor,
              "--radius": borderRadius,
              "--speed": shimmerDuration,
              "--cut": shimmerSize,
              "--bg": background,
            } as CSSProperties
          }
        className={cn(
  // Base
  "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden",
  "[border-radius:var(--radius)] px-6 py-3 whitespace-nowrap",
  "font-medium transition-all duration-300 transform-gpu",
  "hover:-translate-y-[1px] active:translate-y-px",

  // Light theme
  "border border-neutral-300/40 text-slate-800",

  // softer normal shadow
  "shadow-[0_2px_8px_rgba(165,200,158,0.18)]",

  // softer hover glow
  "hover:shadow-[0_4px_10px_rgba(165,200,158,0.25)]",

  // Dark theme
"border border-neutral-300/40 text-slate-800",
"dark:border-white/10 dark:text-black",

  // softer dark shadow
  "dark:shadow-[0_2px_10px_rgba(0,0,0,0.28)]",

  // softer dark hover
  "dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.35)]",

  // Background
  "[background:var(--bg)]",

  className
)}
          ref={ref}
          {...props}
        >
          {/* Spark container */}
          <div
            className={cn(
              "absolute inset-0 overflow-hidden -z-30 blur-[2px]"
            )}
          >
            <div className="absolute inset-0 aspect-[1] h-full rounded-none [mask:none]">
              <div className="shimmer-bg-sparkle absolute -inset-full w-auto rotate-0 [translate:0_0] [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
            </div>
          </div>

          {/* Content */}
          <span className="relative z-10 flex items-center gap-2">
            {children}
          </span>

          {/* Highlight layer */}
          <div
            className={cn(
              "absolute inset-0 size-full pointer-events-none rounded-full",
              "px-4 py-1.5 text-sm font-medium",

              // Light
              "shadow-[inset_0_-8px_10px_#ffffff1f]",
              "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
              "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]",

              // Dark
              "dark:shadow-[inset_0_-8px_14px_rgba(255,255,255,0.06)]",
              "dark:group-hover:shadow-[inset_0_-6px_14px_rgba(255,255,255,0.10)]",

              "transition-all duration-300 ease-in-out"
            )}
          />

          {/* Backdrop */}
          <div
            className={cn(
              "absolute inset-[2px] -z-20 [border-radius:var(--radius)]",
              "[background:var(--bg)]",

              // subtle dark overlay
              "dark:bg-black/10"
            )}
          />
        </button>
      </>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
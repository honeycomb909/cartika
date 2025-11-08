declare module 'canvas-confetti' {
  export interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  export type CreateTypes = (options?: Options) => Promise<void>;

  const confetti: {
    (options?: Options): Promise<void>;
    create: (canvas: HTMLCanvasElement, options?: {resize?: boolean}) => {
      (options?: Options): Promise<void>;
    };
  };

  export default confetti;
}
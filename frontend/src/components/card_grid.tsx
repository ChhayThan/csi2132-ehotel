import type { ReactNode } from "react";

type CardGridProps = {
  children: ReactNode;
  className?: string;
};

const CardGrid = ({ children, className = "" }: CardGridProps) => {
  return (
    <div
      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export default CardGrid;

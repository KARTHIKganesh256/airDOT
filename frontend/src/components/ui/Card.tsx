import clsx from "clsx";
import { motion } from "framer-motion";
import type { MotionProps } from "framer-motion";
import type {
  PropsWithChildren,
  AriaAttributes,
  DOMAttributes,
} from "react";

interface AccessibilityProps
  extends Pick<
      DOMAttributes<HTMLDivElement>,
      "onClick" | "onMouseEnter" | "onMouseLeave"
    >,
    Pick<
      AriaAttributes,
      "aria-label" | "aria-labelledby" | "aria-describedby"
    > {
  id?: string;
  role?: string;
}

interface CardProps extends PropsWithChildren, AccessibilityProps {
  title?: string;
  className?: string;
  actions?: React.ReactNode;
  motionProps?: MotionProps;
}

export function Card({
  title,
  actions,
  className,
  children,
  motionProps,
  id,
  role,
  ...rest
}: CardProps) {
  return (
    <motion.div
      {...motionProps}
      id={id}
      role={role}
      {...rest}
      className={clsx(
        "rounded-3xl border border-slate-800/40 bg-black/40 p-6 shadow-card backdrop-blur supports-[backdrop-filter]:bg-black/30 dark:bg-white/[0.02] dark:border-white/5",
        "transition duration-300 ease-out hover:border-accent-subtle/60",
        className,
      )}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && (
            <h3 className="text-lg font-semibold text-white/90 dark:text-white">
              {title}
            </h3>
          )}
          {actions}
        </div>
      )}
      {children}
    </motion.div>
  );
}


"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  href?: string;
  download?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  href,
  download,
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const cls = buttonClass(variant, size, `${fullWidth ? "w-full" : ""} ${className}`);

  if (href) {
    return (
      <Link href={href} download={download} className={cls}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...props}>
      {icon}
      {children}
    </button>
  );
}

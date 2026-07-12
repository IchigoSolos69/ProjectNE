import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ className = "", children, ...props }) => {
  return (
    <button
      {...props}
      className={`py-2.5 px-6 bg-brand-royal hover:bg-brand-ocean text-white text-xs font-semibold uppercase tracking-wide rounded-md shadow-sm active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans ${className}`}
    >
      {children}
    </button>
  );
};

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
}

export const SectionHeading: React.FC<HeadingProps> = ({ className = "", children, ...props }) => {
  return (
    <h2
      {...props}
      className={`font-serif text-3xl md:text-4xl font-bold tracking-tight text-brand-midnight ${className}`}
    >
      {children}
    </h2>
  );
};

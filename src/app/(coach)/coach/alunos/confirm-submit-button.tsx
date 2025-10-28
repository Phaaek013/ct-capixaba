"use client";

import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
};

export function ConfirmSubmitButton({ message, onClick, ...props }: Props) {
  return (
    <button
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}

"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

export default function GoogleLogin() {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

     authClient.oneTap({
      button: {
        container: buttonRef.current,
        config: {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "continue_with",
        },
      },
      callbackURL: "/dashboard",
    });
  }, []);

  return <div ref={buttonRef} />;
}

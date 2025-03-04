import type { Config } from "tailwindcss"
import baseConfig from "@workspace/ui/tailwind.config"

export default {
  ...baseConfig,
  content: [
    ...baseConfig.content,
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/components/**/*.{ts,tsx}",
  ],
} satisfies Config
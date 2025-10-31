import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"

export default function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const nextTheme = theme === "dark" ? "light" : "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme as any)}
      className="relative h-9 w-9"
      aria-label="Toggle theme"
      title={`Switch to ${nextTheme} mode`}
    >
      <span className="transition-opacity duration-200 dark:opacity-0">☀️</span>
      <span className="absolute transition-opacity duration-200 opacity-0 dark:opacity-100">🌙</span>
    </Button>
  )
}



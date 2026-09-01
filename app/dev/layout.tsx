import { notFound } from "next/navigation";

// Playground zyje wylacznie w developmencie. W produkcyjnym buildzie kazda
// sciezka pod /dev oddaje 404 (AC F1-05).
export default function LayoutDev({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <>{children}</>;
}

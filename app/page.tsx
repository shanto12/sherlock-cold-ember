import type { Metadata } from "next";
import { Casebook } from "./Casebook";

export const metadata: Metadata = {
  description:
    "Ride through 1895 London in an interactive Sherlock Holmes mystery with opt-in cinematic sound, character conversations, and source-aware captions.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <Casebook />;
}

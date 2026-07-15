import type { Metadata } from "next";
import { Casebook } from "./Casebook";

export const metadata: Metadata = {
  description:
    "Ride through 1895 London in an interactive Sherlock Holmes mystery. Examine a hansom-cab route, tobacco ash, footprints, and casebooks to solve The Cold Ember.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <Casebook />;
}

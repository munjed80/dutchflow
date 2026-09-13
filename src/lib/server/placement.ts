import "server-only";
import data from "@/data/placement.json";
import type { PlacementBank } from "@/lib/placement-types";

// Only server modules and content-validation tests may import the answer bank.
// Content shape and cross-references are checked by the required native test gate.
export const placementBank = data as PlacementBank;

import type { ComponentType } from "react";
import OsmiornicaTrzySerca from "./OsmiornicaTrzySerca";
import WenusObracaSieZle from "./WenusObracaSieZle";
import EmuMarsz from "./EmuMarsz";
import MlotekIPiorko from "./MlotekIPiorko";
import SlimakSpi from "./SlimakSpi";

// Rejestr signature z plan/06 D. Pytania bez wpisu maja na razie pusty slot -
// dokladaja je kolejne issues F4-02b i F4-02c.
export const SIGNATURE: Record<string, ComponentType> = {
  "osmiornica-trzy-serca": OsmiornicaTrzySerca,
  "wenus-obraca-sie-zle": WenusObracaSieZle,
  "emu-marsz": EmuMarsz,
  "mlotek-i-piorko": MlotekIPiorko,
  "slimak-spi": SlimakSpi,
};

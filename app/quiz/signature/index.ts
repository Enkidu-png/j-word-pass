import type { ComponentType } from "react";
import OsmiornicaTrzySerca from "./OsmiornicaTrzySerca";
import WenusObracaSieZle from "./WenusObracaSieZle";
import EmuMarsz from "./EmuMarsz";
import MlotekIPiorko from "./MlotekIPiorko";
import SlimakSpi from "./SlimakSpi";
import RosjaStrefy from "./RosjaStrefy";
import GalTopnieje from "./GalTopnieje";
import SaunaParowa from "./SaunaParowa";
import KoscUdowa from "./KoscUdowa";
import MyszDrewniana from "./MyszDrewniana";
import RekinStarszyOdDrzew from "./RekinStarszyOdDrzew";
import MozartKanon from "./MozartKanon";
import MrowkiHodowcy from "./MrowkiHodowcy";
import SkalaTwardosci from "./SkalaTwardosci";
import WombatKostka from "./WombatKostka";

// Rejestr signature z plan/06 D: nazwa z data/quiz.json -> komponent sceny.
export const SIGNATURE: Record<string, ComponentType> = {
  "osmiornica-trzy-serca": OsmiornicaTrzySerca,
  "wenus-obraca-sie-zle": WenusObracaSieZle,
  "emu-marsz": EmuMarsz,
  "mlotek-i-piorko": MlotekIPiorko,
  "slimak-spi": SlimakSpi,
  "rosja-strefy": RosjaStrefy,
  "gal-topnieje": GalTopnieje,
  "sauna-parowa": SaunaParowa,
  "kosc-udowa": KoscUdowa,
  "mysz-drewniana": MyszDrewniana,
  "rekin-starszy-od-drzew": RekinStarszyOdDrzew,
  "mozart-kanon": MozartKanon,
  "mrowki-hodowcy": MrowkiHodowcy,
  "skala-twardosci": SkalaTwardosci,
  "wombat-kostka": WombatKostka,
};

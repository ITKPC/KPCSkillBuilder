"use client";

import { useMemo, useState } from "react";
import { agilityDrills } from "./agility-drills";
import { consistencyDrills } from "./consistency-drills";
import { defenseDrills } from "./defense-drills";
import { offenseDrills } from "./offense-drills";
import { returnDrills, serveDrills, type Drill } from "./drill-library";
import { explainRecommendation
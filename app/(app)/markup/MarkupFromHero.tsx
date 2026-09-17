"use client";

import { useSearchParams } from "next/navigation";
import { readHeroAmount } from "@/lib/pricingIntent";
import MarkupClient from "./MarkupClient";

export default function MarkupFromHero() {
  const params = useSearchParams();
  const cost = readHeroAmount(params.get("costo"));
  const price = readHeroAmount(params.get("precio"));
  return <MarkupClient key={`${cost}:${price}`} initialCost={cost} initialPrice={price} />;
}

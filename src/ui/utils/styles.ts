import { Gender } from "../../members/types";
import { cn } from "./cn";

export function getGenderStyle(gender: string): string {
  return cn(
    "flex items-center justify-center",
    gender === Gender.enum.male && "bg-gender-male-bg text-gender-male-text",
    gender === Gender.enum.female && "bg-gender-female-bg text-gender-female-text",
    gender === Gender.enum.other && "bg-stone-100 text-stone-600",
  );
}

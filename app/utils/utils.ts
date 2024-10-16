import { isAddress } from "viem";
import { Rating, RGBColor } from "../types";

export function generateRandomString(length: number, seed?: string) {
  let result = "";
  const characters =
    seed ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function clampValue(
  value: number,
  { min, max }: { min?: number; max?: number },
) {
  let ans = value;
  if (max && min && max < min) {
    return value;
  }
  if (min && ans < min) {
    ans = min;
  }
  if (max && ans > max) {
    ans = max;
  }
  return ans;
}

export function linearMap(
  value: number,
  mapFrom: { from: number; to: number },
  mapTo: { from: number; to: number },
  clamp = true,
) {
  const slope = (mapTo.to - mapTo.from) / (mapFrom.to - mapFrom.from);
  const ans = slope * (value - mapFrom.from) + mapTo.from;
  return clamp
    ? clampValue(ans, {
        min: Math.min(mapTo.from, mapTo.to),
        max: Math.max(mapTo.from, mapTo.to),
      })
    : ans;
}

export function convertColorToRGBVec(color: string): [number, number, number] {
  let rgb: [number, number, number] = [0, 0, 0];

  if (color.startsWith("#")) {
    color = color.slice(1);

    if (color.length === 3) {
      color = color
        .split("")
        .map((char) => char + char)
        .join("");
    }

    rgb = [
      parseInt(color.substr(0, 2), 16) / 255,
      parseInt(color.substr(2, 2), 16) / 255,
      parseInt(color.substr(4, 2), 16) / 255,
    ];
  } else if (color.startsWith("rgb(")) {
    const values = color
      .substring(4, color.length - 1)
      .split(",")
      .map((value) => parseInt(value.trim(), 10));

    rgb = values.map((value) => value / 255) as [number, number, number];
  }

  return rgb;
}

export function getCoords(elem: HTMLElement) {
  var box = elem.getBoundingClientRect();

  var body = document.body;
  var docEl = document.documentElement;

  var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

  var clientTop = docEl.clientTop || body.clientTop || 0;
  var clientLeft = docEl.clientLeft || body.clientLeft || 0;

  var top = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return { top: Math.round(top), left: Math.round(left) };
}

export function mapValueToColor(
  value: number,
  ranges: number[],
  colors: number[][],
) {
  value = Math.min(Math.max(value, ranges[0]), ranges[ranges.length - 1]);
  let index = 0;
  while (value > ranges[index + 1]) {
    index++;
  }

  const rangeStart = ranges[index];
  const rangeEnd = ranges[index + 1];
  const colorStart = colors[index];
  const colorEnd = colors[index + 1];

  const t = (value - rangeStart) / (rangeEnd - rangeStart);

  const r = Math.round(colorStart[0] + (colorEnd[0] - colorStart[0]) * t)
    .toString(16)
    .padStart(2, "0");
  const g = Math.round(colorStart[1] + (colorEnd[1] - colorStart[1]) * t)
    .toString(16)
    .padStart(2, "0");
  const b = Math.round(colorStart[2] + (colorEnd[2] - colorStart[2]) * t)
    .toString(16)
    .padStart(2, "0");

  return `#${r}${g}${b}`;
}

export function isEmail(script: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(script);
}

export function getObjectKeys<T extends object>(obj: T) {
  if (typeof obj !== "object")
    throw new Error("Not a valid object to get keys");

  return Object.keys(obj) as Array<keyof T>;
}

export function getRandomFromArray<T>(array: Array<T>): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function linearMapColor(
  x: number,
  from: { from: number; to: number },
  to: { from: RGBColor; to: RGBColor },
): RGBColor {
  const percent = (x - from.from) / (from.to - from.from);
  const result: RGBColor = [0, 0, 0];

  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(to.from[i] + percent * (to.to[i] - to.from[i]));
  }

  return result;
}

export function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(rgb: RGBColor): string {
  const [r, g, b] = rgb;
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function closestTimeUnit(milliseconds: number) {
  var seconds = milliseconds / 1000;

  var hours = seconds / 3600;
  if (hours < 1) {
    return milliseconds + " milliseconds";
  } else if (hours < 24) {
    return Math.floor(hours) + " hours";
  }

  var days = hours / 24;
  if (days < 30) {
    var remainingHours = hours % 24;
    if (remainingHours > 0) {
      return (
        Math.floor(days) + " days and " + Math.floor(remainingHours) + " hours"
      );
    } else {
      return Math.floor(days) + " days";
    }
  }

  var months = days / 30;
  if (months < 12) {
    return Math.floor(months) + " months";
  }

  var years = months / 12;
  return Math.floor(years) + " years";
}

export const twInputStyle =
  "text-lg rounded-md p-2 bg-background border border-border shadow shadow-mute/30";

export function formatEvmAddress(address: string) {
  if (isAddress(address))
    return (
      address.slice(0, 7) +
      "..." +
      address.slice(address.length - 5, address.length)
    );
  return address;
}

// generate shades for chart
export function generateShades(
  primaryColor: string,
  numberOfShades: number,
): string[] {
  // check if primaryColor is in rgb format
  if (!primaryColor.startsWith("rgb(")) {
    primaryColor = "rgb(11, 128, 182)";
  }

  const shades: string[] = [];
  const baseColor = primaryColor.match(/\d+/g)?.map(Number);

  if (!baseColor || baseColor.length < 3) {
    throw new Error("Invalid primary color format. Use 'rgb(r, g, b)' format.");
  }

  for (let i = 0; i < numberOfShades; i++) {
    const alpha = ((numberOfShades - i) / numberOfShades).toFixed(2);
    shades.push(
      `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`,
    );
  }

  return shades;
}

export function extractErrorFromTx(error: string): string {
  const match = error.match(/reason:\s*(.*?)\s*Contract Call/);
  return match ? `${match[1]}..` : "Transaction Failed..";
}

export function formatCompactNumber(number: number) {
  if (number < 1000) {
    return number;
  } else if (number >= 1000 && number < 1_000_000) {
    return (number / 1000).toFixed(1) + "k";
  } else if (number >= 1_000_000 && number < 1_000_000_000) {
    return (number / 1_000_000).toFixed(1) + "m";
  } else if (number >= 1_000_000_000 && number < 1_000_000_000_000) {
    return (number / 1_000_000_000).toFixed(1) + "b";
  } else if (number >= 1_000_000_000_000 && number < 1_000_000_000_000_000) {
    return (number / 1_000_000_000_000).toFixed(1) + "t";
  } else {
    return number;
  }
}

export function calculateAverageRating({ ratings }: { ratings: Rating[] }) {
  if (ratings.length === 0) return 0;
  return (
    ratings.reduce((total, { rating }) => total + rating, 0) / ratings.length
  );
}

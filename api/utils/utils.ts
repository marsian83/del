export function generateRandomHex(length: number): string {
  const characters = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function isFunction(obj: any) {
  return typeof obj === "function";
}

export const generateTokenSymbol = (name: string): string => {
  if (!name) {
    return "NUL";
  }

  const words = name.split(" ");
  let symbol = "";

  if (words.length === 1) {
    const word = words[0].toUpperCase();
    const consonants = word.replace(/[AEIOU]/gi, "");
    const vowels = word.replace(/[^AEIOU]/gi, "");
    symbol = consonants.substring(0, 3);
    if (symbol.length < 3) {
      symbol += vowels.substring(0, 3 - symbol.length);
    }
    if (symbol.length < 3) {
      symbol += consonants.substring(0, 3 - symbol.length);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      if (i < words.length) {
        symbol += words[i][0].toUpperCase();
      } else {
        symbol += words[i % words.length][0].toUpperCase();
      }
    }
  }

  return symbol;
};

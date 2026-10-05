import { searchWordPress } from "../../utils/wordpress";
import type { Platform, PlatformSearchResult } from "../../types";

async function search(game: string): Promise<PlatformSearchResult> {
  try {
    const items = await searchWordPress(game, "https://xxacg.net/");
    return { count: items.length, items };
  } catch (error) {
    return { count: -1, items: [], error: error instanceof Error ? error.message : String(error) };
  }
}

const xxacg: Platform = {
  name: "xxacg", color: "white", tags: ["Login", "magic", "NoSplDrive"], magic: true, search,
};
export default xxacg;

import { searchWordPress } from "../../utils/wordpress";
import type { Platform, PlatformSearchResult } from "../../types";

async function search(game: string): Promise<PlatformSearchResult> {
  try {
    const items = await searchWordPress(game, "https://lzacg.cc/");
    return { count: items.length, items };
  } catch (error) {
    return { count: -1, items: [], error: error instanceof Error ? error.message : String(error) };
  }
}

const LiangZiACG: Platform = {
  name: "量子acg", color: "lime", tags: ["NoReq", "SuDrive"], magic: false, search,
};
export default LiangZiACG;

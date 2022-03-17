//import * as tiktokscraper from "tiktok-scraper-ts";
import { TTScraper } from "tiktok-scraper-ts"; // Individual classes

const TikTokScraper = new TTScraper();

(async () => {
  const fetchVideo = await TikTokScraper.getAllVideosFromUser("zeejkt48");
  console.log(fetchVideo.length);
})();
const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');

const parser = new Parser();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const FEEDS = [
  // Craigslist: We trust this because the URL is specifically for Eugene
  { name: "Craigslist", url: "https://eugene.craigslist.org/search/vol?format=rss", type: "local" },
  // Mac's List: We will keep this but accept "Oregon" to get more results for now
  { name: "MacsList", url: "https://www.macslist.org/feed/?post_type=job_listing&job_listing_category=nonprofit", type: "regional" }
];

async function run() {
  console.log("🌲 Starting DoGoodr Feed Engine (Loose Mode)...");
  
  for (const source of FEEDS) {
    try {
      const feed = await parser.parseURL(source.url);
      console.log(`Processing ${source.name}: Found ${feed.items.length} items.`);

      for (const item of feed.items) {
        const text = (item.title + " " + (item.contentSnippet || "")).toLowerCase();

        // FILTER LOGIC:
        // 1. If it's Craigslist (Local), we KEEP it automatically.
        // 2. If it's Mac's List (Regional), we check if it mentions Eugene OR is just in Oregon (to fill the app)
        if (source.type === 'regional') {
           // If it doesn't say Eugene, Springfield, or Lane, skip it.
           if (!text.includes('eugene') && !text.includes('springfield') && !text.includes('lane')) {
             continue; 
           }
        }

        // TAGGING
        const tags = [];
        if (text.includes('dog') || text.includes('cat') || text.includes('animal')) tags.push('Animals');
        if (text.includes('garden') || text.includes('tree') || text.includes('nature') || text.includes('outdoor')) tags.push('Outdoors');
        if (text.includes('art') || text.includes('museum') || text.includes('creative')) tags.push('Arts');
        if (text.includes('food') || text.includes('kitchen') || text.includes('hunger')) tags.push('Food');
        if (tags.length === 0) tags.push('General');

        // SAVE TO DB
        const { error } = await supabase.from('jobs').upsert({
          title: item.title.replace(/\(Eugene\)/gi, '').trim(), // Clean up title
          link: item.link,
          org_name: source.name === 'Craigslist' ? 'Community Post' : 'Non-Profit',
          description: item.contentSnippet?.substring(0, 200) || "Click to read more...",
          tags: tags,
          source: source.name
        }, { onConflict: 'link' });

        if (!error) console.log(`✅ Saved: ${item.title}`);
        else console.log(`❌ DB Error: ${error.message}`);
      }
    } catch (e) { console.log(`❌ Feed Error (${source.name}): ${e.message}`); }
  }
}

run();

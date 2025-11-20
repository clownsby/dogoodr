const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');

// CONFIGURATION
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const parser = new Parser();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FEEDS = [
  { name: "Craigslist", url: "https://eugene.craigslist.org/search/vol?format=rss" },
  { name: "MacsList", url: "https://www.macslist.org/feed/?post_type=job_listing&job_listing_category=nonprofit" }
];

async function run() {
  console.log("🌲 Starting DoGoodr Feed Engine...");
  
  for (const source of FEEDS) {
    try {
      const feed = await parser.parseURL(source.url);
      for (const item of feed.items) {
        // FILTER: Must be local
        const text = (item.title + item.contentSnippet).toLowerCase();
        if (source.name === 'MacsList' && !text.includes('eugene') && !text.includes('lane county')) continue;

        // TAGGING
        const tags = [];
        if (text.includes('dog') || text.includes('cat') || text.includes('animal')) tags.push('Animals');
        if (text.includes('garden') || text.includes('tree') || text.includes('nature')) tags.push('Outdoors');
        if (tags.length === 0) tags.push('General');

        // SAVE TO DB
        const { error } = await supabase.from('jobs').upsert({
          title: item.title,
          link: item.link,
          org_name: source.name === 'Craigslist' ? 'Community Post' : 'Non-Profit',
          description: item.contentSnippet?.substring(0, 200),
          tags: tags,
          source: source.name
        }, { onConflict: 'link' });

        if (!error) console.log(`✅ Saved: ${item.title}`);
      }
    } catch (e) { console.log(`❌ Error with ${source.name}: ${e.message}`); }
  }
}

run();
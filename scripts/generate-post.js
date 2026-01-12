/**
 * Detour Japan - Automated Blog Post Generator
 *
 * This script generates blog posts about lesser-known Japan destinations
 * using Claude API for content and Unsplash for images.
 *
 * Required environment variables:
 * - ANTHROPIC_API_KEY: Your Claude API key
 * - UNSPLASH_ACCESS_KEY: Your Unsplash API key
 * - RESEND_API_KEY: Your Resend API key (for email notifications)
 * - NOTIFICATION_EMAIL: Email address to receive notifications
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefecture data with visitor statistics and center coordinates
const PREFECTURES = [
  { name: "Tottori", visitors: "low", region: "Chugoku", lat: 35.5, lng: 134.2, zoom: 9 },
  { name: "Shimane", visitors: "low", region: "Chugoku", lat: 35.1, lng: 132.5, zoom: 9 },
  { name: "Kochi", visitors: "low", region: "Shikoku", lat: 33.5, lng: 133.5, zoom: 9 },
  { name: "Tokushima", visitors: "low", region: "Shikoku", lat: 33.9, lng: 134.4, zoom: 9 },
  { name: "Saga", visitors: "low", region: "Kyushu", lat: 33.3, lng: 130.0, zoom: 9 },
  { name: "Akita", visitors: "low", region: "Tohoku", lat: 39.7, lng: 140.1, zoom: 8 },
  { name: "Iwate", visitors: "low", region: "Tohoku", lat: 39.5, lng: 141.5, zoom: 8 },
  { name: "Yamagata", visitors: "low", region: "Tohoku", lat: 38.2, lng: 140.0, zoom: 9 },
  { name: "Fukui", visitors: "low", region: "Chubu", lat: 35.8, lng: 136.2, zoom: 9 },
  { name: "Toyama", visitors: "low", region: "Chubu", lat: 36.7, lng: 137.2, zoom: 9 },
  { name: "Niigata", visitors: "medium", region: "Chubu", lat: 37.5, lng: 139.0, zoom: 8 },
  { name: "Ishikawa", visitors: "medium", region: "Chubu", lat: 36.6, lng: 136.6, zoom: 9 },
  { name: "Ehime", visitors: "medium", region: "Shikoku", lat: 33.8, lng: 132.8, zoom: 9 },
  { name: "Kagawa", visitors: "medium", region: "Shikoku", lat: 34.2, lng: 134.0, zoom: 10 },
  { name: "Oita", visitors: "medium", region: "Kyushu", lat: 33.2, lng: 131.5, zoom: 9 },
  { name: "Miyazaki", visitors: "low", region: "Kyushu", lat: 32.2, lng: 131.4, zoom: 9 },
  { name: "Kumamoto", visitors: "medium", region: "Kyushu", lat: 32.8, lng: 130.7, zoom: 9 },
  { name: "Nagasaki", visitors: "medium", region: "Kyushu", lat: 32.9, lng: 129.9, zoom: 9 },
  { name: "Yamaguchi", visitors: "medium", region: "Chugoku", lat: 34.2, lng: 131.5, zoom: 9 },
  { name: "Okayama", visitors: "medium", region: "Chugoku", lat: 34.7, lng: 133.9, zoom: 9 },
  { name: "Wakayama", visitors: "medium", region: "Kansai", lat: 33.9, lng: 135.5, zoom: 9 },
  { name: "Mie", visitors: "medium", region: "Kansai", lat: 34.5, lng: 136.5, zoom: 9 },
  { name: "Shiga", visitors: "medium", region: "Kansai", lat: 35.2, lng: 136.1, zoom: 9 },
  { name: "Nara", visitors: "high", region: "Kansai", lat: 34.4, lng: 135.8, zoom: 10 },
  { name: "Gifu", visitors: "medium", region: "Chubu", lat: 35.8, lng: 137.0, zoom: 9 },
  { name: "Nagano", visitors: "medium", region: "Chubu", lat: 36.2, lng: 138.0, zoom: 8 },
  { name: "Yamanashi", visitors: "medium", region: "Chubu", lat: 35.6, lng: 138.6, zoom: 9 },
  { name: "Gunma", visitors: "medium", region: "Kanto", lat: 36.5, lng: 139.0, zoom: 9 },
  { name: "Tochigi", visitors: "medium", region: "Kanto", lat: 36.7, lng: 139.9, zoom: 9 },
  { name: "Ibaraki", visitors: "medium", region: "Kanto", lat: 36.3, lng: 140.3, zoom: 9 },
  { name: "Saitama", visitors: "medium", region: "Kanto", lat: 35.9, lng: 139.6, zoom: 10 },
  { name: "Chiba", visitors: "medium", region: "Kanto", lat: 35.5, lng: 140.2, zoom: 9 },
  { name: "Aomori", visitors: "medium", region: "Tohoku", lat: 40.8, lng: 140.7, zoom: 8 },
  { name: "Miyagi", visitors: "medium", region: "Tohoku", lat: 38.4, lng: 140.9, zoom: 9 },
  { name: "Fukushima", visitors: "medium", region: "Tohoku", lat: 37.4, lng: 140.0, zoom: 8 },
  { name: "Kagoshima", visitors: "medium", region: "Kyushu", lat: 31.6, lng: 130.5, zoom: 9 },
  { name: "Fukuoka", visitors: "high", region: "Kyushu", lat: 33.6, lng: 130.7, zoom: 9 },
  { name: "Hiroshima", visitors: "high", region: "Chugoku", lat: 34.4, lng: 132.5, zoom: 9 },
  { name: "Hyogo", visitors: "high", region: "Kansai", lat: 35.0, lng: 134.8, zoom: 9 },
  { name: "Aichi", visitors: "high", region: "Chubu", lat: 35.0, lng: 137.0, zoom: 9 },
  { name: "Shizuoka", visitors: "high", region: "Chubu", lat: 35.0, lng: 138.4, zoom: 9 },
  { name: "Kanagawa", visitors: "high", region: "Kanto", lat: 35.4, lng: 139.4, zoom: 10 },
  { name: "Hokkaido", visitors: "high", region: "Hokkaido", lat: 43.5, lng: 142.5, zoom: 7 },
  { name: "Okinawa", visitors: "high", region: "Okinawa", lat: 26.5, lng: 127.9, zoom: 9 },
  { name: "Kyoto", visitors: "very_high", region: "Kansai", lat: 35.0, lng: 135.8, zoom: 9 },
  { name: "Osaka", visitors: "very_high", region: "Kansai", lat: 34.7, lng: 135.5, zoom: 10 },
  { name: "Tokyo", visitors: "very_high", region: "Kanto", lat: 35.7, lng: 139.7, zoom: 10 },
];

// Track which prefectures we've covered
async function getExistingPrefectures() {
  const postsDir = path.join(__dirname, "../src/content/posts");
  const draftsDir = path.join(__dirname, "../src/content/drafts");

  const prefectures = new Set();

  for (const dir of [postsDir, draftsDir]) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (file.endsWith(".md")) {
          const content = await fs.readFile(path.join(dir, file), "utf-8");
          const match = content.match(/prefecture:\s*["']?(\w+)["']?/);
          if (match) {
            prefectures.add(match[1]);
          }
        }
      }
    } catch {
      // Directory might not exist yet
    }
  }

  return prefectures;
}

// Select next prefecture (prioritize least visited, avoid repeats)
async function selectPrefecture() {
  // Check for override via environment variable
  const prefectureOverride = process.env.PREFECTURE;
  if (prefectureOverride) {
    const specified = PREFECTURES.find(
      (p) => p.name.toLowerCase() === prefectureOverride.toLowerCase()
    );
    if (specified) {
      console.log(`Using specified prefecture: ${specified.name}`);
      return specified;
    } else {
      console.warn(`Prefecture "${prefectureOverride}" not found, using random selection`);
    }
  }

  const existing = await getExistingPrefectures();

  // Filter out already covered prefectures
  const available = PREFECTURES.filter((p) => !existing.has(p.name));

  if (available.length === 0) {
    // All prefectures covered, start fresh with least visited
    return PREFECTURES.filter((p) => p.visitors === "low")[
      Math.floor(
        Math.random() *
          PREFECTURES.filter((p) => p.visitors === "low").length
      )
    ];
  }

  // Prioritize least visited
  const lowVisited = available.filter((p) => p.visitors === "low");
  if (lowVisited.length > 0) {
    return lowVisited[Math.floor(Math.random() * lowVisited.length)];
  }

  const mediumVisited = available.filter((p) => p.visitors === "medium");
  if (mediumVisited.length > 0) {
    return mediumVisited[Math.floor(Math.random() * mediumVisited.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

// Fetch image from Unsplash
async function fetchUnsplashImage(query) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log("No Unsplash API key, using placeholder");
    return {
      url: `https://source.unsplash.com/featured/?japan,${encodeURIComponent(query)}`,
      credit: "Unsplash",
    };
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query + " japan"
      )}&orientation=landscape&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      return {
        url: photo.urls.regular,
        credit: `${photo.user.name} on Unsplash`,
      };
    }
  } catch (error) {
    console.error("Unsplash error:", error);
  }

  return {
    url: `https://source.unsplash.com/featured/?japan,${encodeURIComponent(query)}`,
    credit: "Unsplash",
  };
}

// Extract image placeholders from content
function extractImagePlaceholders(content) {
  const regex = /\[IMAGE:\s*([^\]]+)\]/g;
  const placeholders = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    placeholders.push({
      fullMatch: match[0],
      searchTerm: match[1].trim(),
    });
  }

  return placeholders;
}

// Fetch multiple images from Unsplash for inline content
// IMPORTANT: Only fetches images specifically from the target prefecture to avoid
// pulling images from other regions (e.g., Osaka images appearing in Tottori posts)
async function fetchContentImages(placeholders, prefecture) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const images = [];

  // All fallback searches MUST include the prefecture name to ensure location accuracy
  // It's better to have fewer images than images from the wrong prefecture
  const prefectureFallbackSearches = [
    `${prefecture.name} Japan landscape`,
    `${prefecture.name} Japan scenery`,
    `${prefecture.name} Prefecture`,
    `${prefecture.name} Japan`,
  ];

  async function searchUnsplash(query) {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&orientation=landscape&per_page=5`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );
    return response.json();
  }

  for (const placeholder of placeholders) {
    if (!accessKey) {
      console.warn(`No Unsplash API key, skipping image for: ${placeholder.searchTerm}`);
      // Remove placeholder entirely if no API key
      images.push({
        placeholder: placeholder.fullMatch,
        url: null,
        credit: null,
        alt: placeholder.searchTerm,
      });
      continue;
    }

    try {
      // Try specific search with prefecture - this is the preferred search
      const searchQuery = `${placeholder.searchTerm} ${prefecture.name} Japan`;
      let data = await searchUnsplash(searchQuery);

      // If no results, try with just prefecture name + keywords (still prefecture-specific)
      if (!data.results || data.results.length === 0) {
        const keywords = placeholder.searchTerm.split(" ").slice(0, 2).join(" ");
        const prefectureKeywordSearch = `${keywords} ${prefecture.name} Japan`;
        console.log(`No results for "${searchQuery}", trying: "${prefectureKeywordSearch}"`);
        data = await searchUnsplash(prefectureKeywordSearch);
      }

      // If still no results, use prefecture-only fallback searches
      // These ensure we only get images from the correct prefecture
      if (!data.results || data.results.length === 0) {
        for (const fallbackQuery of prefectureFallbackSearches) {
          console.log(`Trying prefecture-specific fallback: "${fallbackQuery}"`);
          data = await searchUnsplash(fallbackQuery);
          if (data.results && data.results.length > 0) break;
        }
      }

      if (data.results && data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5));
        const photo = data.results[randomIndex];
        images.push({
          placeholder: placeholder.fullMatch,
          url: photo.urls.regular,
          credit: `${photo.user.name} on Unsplash`,
          alt: placeholder.searchTerm,
        });
        console.log(`Found image for ${prefecture.name}: ${placeholder.searchTerm}`);
      } else {
        // No prefecture-specific image found - remove placeholder rather than use wrong location
        console.warn(`No ${prefecture.name}-specific image found for: ${placeholder.searchTerm} (placeholder will be removed)`);
        images.push({
          placeholder: placeholder.fullMatch,
          url: null,
          credit: null,
          alt: placeholder.searchTerm,
        });
      }
    } catch (error) {
      console.error(`Unsplash error for "${placeholder.searchTerm}":`, error);
      images.push({
        placeholder: placeholder.fullMatch,
        url: null,
        credit: null,
        alt: placeholder.searchTerm,
      });
    }
  }

  return images;
}

// Replace image placeholders with markdown images
function replaceImagePlaceholders(content, images) {
  let updatedContent = content;

  for (const image of images) {
    if (image.url) {
      const markdownImage = `![${image.alt}](${image.url})\n*Photo: ${image.credit}*`;
      updatedContent = updatedContent.replace(image.placeholder, markdownImage);
    } else {
      // No image found - remove the placeholder entirely
      updatedContent = updatedContent.replace(image.placeholder, "");
    }
  }

  return updatedContent;
}

// Generate blog post content using Claude
async function generateContent(prefecture) {
  const client = new Anthropic();

  const prompt = `Write a travel essay about ${prefecture.name} Prefecture, Japan (${prefecture.region} region), focusing on hidden gems and lesser-known destinations.

Write in a natural, literary style with flowing multi-paragraph prose. Avoid listicle formats, bullet points, and typical blog structures. Instead, let your writing breathe—use longer paragraphs that paint vivid pictures and weave practical information naturally into the narrative.

Your essay should feel like a personal travel piece in a quality magazine. Describe the atmosphere, the light, the feeling of discovery. When mentioning places, use both English and Japanese names where appropriate.

IMPORTANT: Include exactly 2-3 image placeholders throughout your essay, placed between paragraphs at natural break points. Use this exact format:
[IMAGE: descriptive search term for the location]

For example: [IMAGE: Tottori sand dunes sunset] or [IMAGE: traditional Japanese temple garden]

The search terms should be specific and descriptive enough to find relevant photos on Unsplash. Focus on the actual attractions, landscapes, or scenes you're describing in that section of the essay.

Cover these elements organically throughout the piece:
- Why this prefecture captivates travelers seeking authentic Japan
- Three or four specific hidden gems worth the journey (temples, coastal towns, mountain villages, local markets)
- Seasonal considerations and when the region shows its best character
- Practical notes on getting around once there (local trains, buses, cycling)
- Ways to travel economically in this area

Do not include travel times from major cities like Tokyo or Osaka. Do not include specific prices or costs in yen, as these fluctuate over time. Focus on the destination itself.

Aim for 800-1000 words. Format as markdown without a title.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.content[0].text;
}

// Generate map locations based on content
async function generateMapLocations(prefecture, content) {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Based on this blog post about ${prefecture.name} Prefecture, Japan, identify 3-4 specific locations mentioned and provide their coordinates.

Blog content:
${content}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
[
  {"name": "Location Name", "lat": 35.1234, "lng": 134.5678},
  {"name": "Another Location", "lat": 35.2345, "lng": 134.6789}
]

Use accurate coordinates for real places in ${prefecture.name} Prefecture. Include only places specifically mentioned in the post.`,
      },
    ],
  });

  try {
    const text = response.content[0].text.trim();
    const locations = JSON.parse(text);
    return locations;
  } catch (error) {
    console.error("Failed to parse map locations:", error);
    return [];
  }
}

// Generate title and description
async function generateMeta(prefecture, content) {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Based on this blog post about ${prefecture.name} Prefecture, generate:
1. A compelling blog title (max 60 characters)
2. A meta description (max 155 characters)

Blog content:
${content.substring(0, 500)}...

Respond in this exact format:
TITLE: [your title]
DESCRIPTION: [your description]`,
      },
    ],
  });

  const text = response.content[0].text;
  const titleMatch = text.match(/TITLE:\s*(.+)/);
  const descMatch = text.match(/DESCRIPTION:\s*(.+)/);

  return {
    title:
      titleMatch?.[1]?.trim() ||
      `Discovering ${prefecture.name}: Japan's Hidden Gem`,
    description:
      descMatch?.[1]?.trim() ||
      `Explore the lesser-known attractions of ${prefecture.name} Prefecture with our complete guide to hidden destinations.`,
  };
}

// Create slug from title
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Send email notification
async function sendNotification(title, prefecture) {
  const apiKey = process.env.RESEND_API_KEY;
  const email = process.env.NOTIFICATION_EMAIL;

  if (!apiKey || !email) {
    console.log("Email notification skipped (no API key or email configured)");
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Detour Japan <noreply@resend.dev>",
        to: email,
        subject: `New Post Published: ${title}`,
        html: `
          <h2>New Blog Post Published</h2>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Prefecture:</strong> ${prefecture}</p>
          <p>A new blog post has been automatically generated and published to your site.</p>
          <p><a href="https://detourjapan.github.io">View Your Blog</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message from Detour Japan.</p>
        `,
      }),
    });
    console.log("Notification email sent");
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

// Main execution
async function main() {
  console.log("Starting blog post generation...\n");

  // Select prefecture
  const prefecture = await selectPrefecture();
  console.log(
    `Selected prefecture: ${prefecture.name} (${prefecture.region})\n`
  );

  // Generate content
  console.log("Generating content with Claude...");
  let content = await generateContent(prefecture);

  // Generate meta
  console.log("Generating title and description...");
  const meta = await generateMeta(prefecture, content);

  // Fetch hero image
  console.log("Fetching hero image from Unsplash...");
  const image = await fetchUnsplashImage(prefecture.name);

  // Extract and fetch inline content images
  console.log("Processing inline images...");
  const imagePlaceholders = extractImagePlaceholders(content);
  console.log(`Found ${imagePlaceholders.length} image placeholders`);

  if (imagePlaceholders.length > 0) {
    const contentImages = await fetchContentImages(imagePlaceholders, prefecture);
    content = replaceImagePlaceholders(content, contentImages);
    console.log(`Replaced ${contentImages.length} images in content`);
  }

  // Generate map locations
  console.log("Generating map locations...");
  const mapLocations = await generateMapLocations(prefecture, content);

  // Create frontmatter
  const slug = slugify(meta.title);
  const date = new Date().toISOString();

  // Build map YAML
  let mapYaml = `map:
  center:
    lat: ${prefecture.lat}
    lng: ${prefecture.lng}
  zoom: ${prefecture.zoom}`;

  if (mapLocations.length > 0) {
    mapYaml += `
  locations:`;
    for (const loc of mapLocations) {
      mapYaml += `
    - name: "${loc.name}"
      lat: ${loc.lat}
      lng: ${loc.lng}`;
    }
  }

  const frontmatter = `---
title: "${meta.title}"
description: "${meta.description}"
pubDate: ${date}
heroImage: "${image.url}"
heroImageAlt: "Scenic view of ${prefecture.name} Prefecture, Japan"
heroImageCredit: "${image.credit}"
prefecture: ${prefecture.name}
tags: ["${prefecture.region}", "hidden gems", "off the beaten path"]
draft: false
${mapYaml}
---

`;

  // Write to posts folder (publish directly)
  const postsDir = path.join(__dirname, "../src/content/posts");
  await fs.mkdir(postsDir, { recursive: true });

  const filePath = path.join(postsDir, `${slug}.md`);
  await fs.writeFile(filePath, frontmatter + content);

  console.log(`\nPost saved to: ${filePath}`);

  // Send notification
  await sendNotification(meta.title, prefecture.name);

  console.log("\nGeneration complete!");
  console.log(`Title: ${meta.title}`);
  console.log(`Prefecture: ${prefecture.name}`);
}

main().catch(console.error);

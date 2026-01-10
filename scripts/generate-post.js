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

// Prefecture data with visitor statistics (lower = less visited)
const PREFECTURES = [
  { name: "Tottori", visitors: "low", region: "Chugoku" },
  { name: "Shimane", visitors: "low", region: "Chugoku" },
  { name: "Kochi", visitors: "low", region: "Shikoku" },
  { name: "Tokushima", visitors: "low", region: "Shikoku" },
  { name: "Saga", visitors: "low", region: "Kyushu" },
  { name: "Akita", visitors: "low", region: "Tohoku" },
  { name: "Iwate", visitors: "low", region: "Tohoku" },
  { name: "Yamagata", visitors: "low", region: "Tohoku" },
  { name: "Fukui", visitors: "low", region: "Chubu" },
  { name: "Toyama", visitors: "low", region: "Chubu" },
  { name: "Niigata", visitors: "medium", region: "Chubu" },
  { name: "Ishikawa", visitors: "medium", region: "Chubu" },
  { name: "Ehime", visitors: "medium", region: "Shikoku" },
  { name: "Kagawa", visitors: "medium", region: "Shikoku" },
  { name: "Oita", visitors: "medium", region: "Kyushu" },
  { name: "Miyazaki", visitors: "low", region: "Kyushu" },
  { name: "Kumamoto", visitors: "medium", region: "Kyushu" },
  { name: "Nagasaki", visitors: "medium", region: "Kyushu" },
  { name: "Yamaguchi", visitors: "medium", region: "Chugoku" },
  { name: "Okayama", visitors: "medium", region: "Chugoku" },
  { name: "Wakayama", visitors: "medium", region: "Kansai" },
  { name: "Mie", visitors: "medium", region: "Kansai" },
  { name: "Shiga", visitors: "medium", region: "Kansai" },
  { name: "Nara", visitors: "high", region: "Kansai" },
  { name: "Gifu", visitors: "medium", region: "Chubu" },
  { name: "Nagano", visitors: "medium", region: "Chubu" },
  { name: "Yamanashi", visitors: "medium", region: "Chubu" },
  { name: "Gunma", visitors: "medium", region: "Kanto" },
  { name: "Tochigi", visitors: "medium", region: "Kanto" },
  { name: "Ibaraki", visitors: "medium", region: "Kanto" },
  { name: "Saitama", visitors: "medium", region: "Kanto" },
  { name: "Chiba", visitors: "medium", region: "Kanto" },
  { name: "Aomori", visitors: "medium", region: "Tohoku" },
  { name: "Miyagi", visitors: "medium", region: "Tohoku" },
  { name: "Fukushima", visitors: "medium", region: "Tohoku" },
  { name: "Kagoshima", visitors: "medium", region: "Kyushu" },
  { name: "Fukuoka", visitors: "high", region: "Kyushu" },
  { name: "Hiroshima", visitors: "high", region: "Chugoku" },
  { name: "Hyogo", visitors: "high", region: "Kansai" },
  { name: "Aichi", visitors: "high", region: "Chubu" },
  { name: "Shizuoka", visitors: "high", region: "Chubu" },
  { name: "Kanagawa", visitors: "high", region: "Kanto" },
  { name: "Hokkaido", visitors: "high", region: "Hokkaido" },
  { name: "Okinawa", visitors: "high", region: "Okinawa" },
  { name: "Kyoto", visitors: "very_high", region: "Kansai" },
  { name: "Osaka", visitors: "very_high", region: "Kansai" },
  { name: "Tokyo", visitors: "very_high", region: "Kanto" },
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

// Generate blog post content using Claude
async function generateContent(prefecture) {
  const client = new Anthropic();

  const prompt = `Write a blog post about hidden gems and lesser-known destinations in ${prefecture.name} Prefecture, Japan (${prefecture.region} region).

The blog post should be engaging, informative, and aimed at independent travelers who want to explore beyond typical tourist destinations.

Structure the post with these sections:
1. A compelling introduction about why ${prefecture.name} deserves attention
2. "Hidden Gems" - 3 specific lesser-known places to visit (temples, nature spots, towns, etc.)
3. "Getting There & Around" - Public transportation guide from major cities (include specific train lines, approximate times, and JR Pass coverage)
4. "Best Time to Visit" - Seasonal recommendations
5. "Budget Tips" - Money-saving advice specific to this area

Requirements:
- Be specific with place names (use both English and romanized Japanese where appropriate)
- Include practical details like which JR lines to take
- Mention approximate travel times from Tokyo or Osaka
- Keep the tone conversational but informative
- Total length: approximately 800-1000 words

Format the output as markdown. Do not include a title (I'll add that separately).`;

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
        subject: `New Draft Ready: ${title}`,
        html: `
          <h2>New Blog Post Draft Ready for Review</h2>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Prefecture:</strong> ${prefecture}</p>
          <p>A new blog post has been automatically generated and is waiting for your review.</p>
          <p><a href="https://detour-japan.github.io/admin/#/collections/drafts">Review Draft in CMS</a></p>
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
  const content = await generateContent(prefecture);

  // Generate meta
  console.log("Generating title and description...");
  const meta = await generateMeta(prefecture, content);

  // Fetch image
  console.log("Fetching image from Unsplash...");
  const image = await fetchUnsplashImage(prefecture.name);

  // Create frontmatter
  const slug = slugify(meta.title);
  const date = new Date().toISOString();

  const frontmatter = `---
title: "${meta.title}"
description: "${meta.description}"
pubDate: ${date}
heroImage: "${image.url}"
heroImageAlt: "Scenic view of ${prefecture.name} Prefecture, Japan"
heroImageCredit: "${image.credit}"
prefecture: ${prefecture.name}
tags: ["${prefecture.region}", "hidden gems", "off the beaten path"]
draft: true
---

`;

  // Write to drafts folder
  const draftsDir = path.join(__dirname, "../src/content/drafts");
  await fs.mkdir(draftsDir, { recursive: true });

  const filePath = path.join(draftsDir, `${slug}.md`);
  await fs.writeFile(filePath, frontmatter + content);

  console.log(`\nDraft saved to: ${filePath}`);

  // Send notification
  await sendNotification(meta.title, prefecture.name);

  console.log("\nGeneration complete!");
  console.log(`Title: ${meta.title}`);
  console.log(`Prefecture: ${prefecture.name}`);
}

main().catch(console.error);

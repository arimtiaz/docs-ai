import axios from 'axios';
import * as cheerio from 'cheerio'; 
import fs from 'fs';
import {URL} from 'url'

// Base URL to crawl
const baseUrl = 'https://chaidocs.vercel.app/youtube/getting-started';

// Function to get internal routes
async function getInternalRoutes(baseUrl) {
  const links = new Set();
  links.add(baseUrl); // Include the base URL
  
  try {
    console.log(`Fetching ${baseUrl}...`);
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);
    

    const selectors = [
      'ul.sidebar-links li a',  
      'nav ul li a',           
      '.sidebar a',            
      'a[href*="/youtube/"]'    
    ];
    
    let anchors = [];
    
    // Try each selector until we find links
    for (const selector of selectors) {
      anchors = $(selector).toArray();
      console.log(`Selector "${selector}" found ${anchors.length} links`);
      if (anchors.length > 0) break;
    }
    
    // Process all found links
    for (const anchor of anchors) {
      const href = $(anchor).attr('href');
      
      // Only include links to YouTube, Chai, or Git sections
      if (href && (href.includes('/youtube/') || href.includes('/chai/') || href.includes('/git/'))) {
        // Convert relative URLs to absolute
        const fullUrl = new URL(href, baseUrl).href;
        links.add(fullUrl);
      }
    }
    
    console.log(`Total unique links found: ${links.size}`);
    return Array.from(links).sort();
  } catch (error) {
    console.error('Error fetching the website:', error);
    return Array.from(links);
  }
}

// Function to group routes by section
function groupRoutes(routes) {
  const groupedRoutes = {};
  
  for (const url of routes) {
    const parsedUrl = new URL(url);
    // Split path and remove empty parts
    const pathParts = parsedUrl.pathname.split('/').filter(part => part);
    
    if (pathParts.length >= 2) {
      const mainSection = pathParts[0]; 
      const subSection = pathParts[1];   
      
      // Initialize main section if it doesn't exist
      if (!groupedRoutes[mainSection]) {
        groupedRoutes[mainSection] = {};
      }
      
      // Initialize subsection if it doesn't exist
      if (!groupedRoutes[mainSection][subSection]) {
        groupedRoutes[mainSection][subSection] = [];
      }
      
      // Add URL to the appropriate group
      groupedRoutes[mainSection][subSection].push(url);
    }
  }
  
  return groupedRoutes;
}

// Function to save and display results
function saveResults(groupedRoutes) {
  // Save as JSON
  fs.writeFileSync('grouped_routes.json', JSON.stringify(groupedRoutes, null, 2));

}

// Main function
async function main() {
  console.log('Starting website crawler with Cheerio...');
  
  const routes = await getInternalRoutes(baseUrl);
  console.log(`Total routes found: ${routes.length}`);
  
  // Group routes by section
  const groupedRoutes = groupRoutes(routes);
  
  // Save and display results
  saveResults(groupedRoutes);

  return saveResults;
}

// Run the crawler
main()
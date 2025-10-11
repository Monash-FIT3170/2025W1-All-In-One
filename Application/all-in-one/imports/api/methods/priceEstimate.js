import { Meteor } from 'meteor/meteor';
import axios from 'axios';
import cheerio from 'cheerio';

Meteor.methods({
  async 'property.estimatePrice'(address, beds, baths, propertyType) {
    // Validate inputs
    if (!address || beds === undefined) {
      throw new Meteor.Error('invalid-params', 'Address and beds are required');
    }

    try {
      // Extract suburb from address
      const addressParts = address.split(',').map(part => part.trim());

      let suburb = '';
      let state = '';

      if (addressParts.length >= 2) {
        // Get suburb from second part (e.g., "Brisbane QLD 4000" -> "Brisbane")
        const suburbPart = addressParts[1].split(' ');
        suburb = suburbPart[0]; // First word is usually the suburb

        // Try to extract state if present
        if (suburbPart.length > 1) {
          state = suburbPart[1].replace(/[0-9]/g, '').trim(); // Remove postcodes
        }
      } else {
        suburb = addressParts[0].split(' ')[0]; // Fallback to first word
      }

      console.log(`Estimating price for: ${suburb}${state ? ', ' + state : ''}, ${beds} beds`);

      const suburbSlug = suburb.toLowerCase().replace(/\s+/g, '-');
      const stateSlug = state ? `-${state.toLowerCase()}` : '';

      const searchUrl = `https://www.rent.com.au/properties/${suburbSlug}${stateSlug}`;

      console.log(`Fetching from Rent.com.au: ${searchUrl}`);

      // Fetch the page with headers to mimic a browser
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0',
        },
        timeout: 30000, 
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 500; 
        },
      });

      // Check if request was successful
      console.log(`Response status: ${response.status}`);

      const prices = [];

      if (response.status === 200) {
        // Parse HTML with Cheerio only if request succeeded
        const $ = cheerio.load(response.data);
        console.log(`HTML length: ${response.data.length} characters`);

        // DEBUG: Log a snippet of HTML to see structure
        console.log('=== HTML SNIPPET (first 1000 chars) ===');
        console.log(response.data.substring(0, 1000));
        console.log('=== END SNIPPET ===');

        // Extract prices from listings
        const priceSelectors = [
          '.property-price',
          '.listing-card-price',
          '[data-testid="property-price"]',
          '.price',
          '.rent-price',
          '[class*="price"]',
          '[class*="Price"]',
        ];

        priceSelectors.forEach(selector => {
          $(selector).each((_i, element) => {
            const priceText = $(element).text().trim();

            // Extract numericx price from various formats:
            const priceMatch = priceText.match(/\$?\s?([\d,]+)/);
            if (priceMatch) {
              const price = parseInt(priceMatch[1].replace(/,/g, ''));

              // Validate price is reasonable (between $100 and $5000 per week)
              if (price >= 100 && price <= 5000) {
                prices.push(price);
                console.log(`Found price: $${price} from selector "${selector}"`);
              }
            }
          });
        });
      } else {
        console.error(`Rent.com.au returned status ${response.status}`);
      }

      console.log(`Found ${prices.length} prices:`, prices);

      // Calculate estimate
      if (prices.length === 0) {
        return {
          estimatedPrice: null,
          confidence: 'low',
          comparableCount: 0,
          error: 'No comparable properties found'
        };
      }

      // Remove outliers (prices more than 2 standard deviations from mean)
      const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const stdDev = Math.sqrt(
        prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
      );

      const filteredPrices = prices.filter(p =>
        Math.abs(p - mean) <= 2 * stdDev
      );

      // Calculate final estimate (median is more robust than mean)
      const sortedPrices = filteredPrices.sort((a, b) => a - b);
      const median = sortedPrices.length % 2 === 0
        ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
        : sortedPrices[Math.floor(sortedPrices.length / 2)];

      // Determine confidence level based on number of comparables
      let confidence = 'low';
      if (filteredPrices.length >= 10) confidence = 'high';
      else if (filteredPrices.length >= 5) confidence = 'medium';

      return {
        estimatedPrice: Math.round(median),
        confidence,
        comparableCount: filteredPrices.length,
        priceRange: {
          min: Math.min(...filteredPrices),
          max: Math.max(...filteredPrices)
        }
      };

    } catch (error) {
      console.error('Price estimation error:', error);

      // Provide more specific error messages
      let errorMessage = 'Unable to fetch price estimate';

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out - Domain may be blocking automated requests';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Could not connect to Domain.com.au';
      } else if (error.response) {
        errorMessage = `Domain returned error ${error.response.status}`;
      }

      console.error('Detailed error:', {
        code: error.code,
        message: error.message,
        stack: error.stack?.split('\n')[0]
      });

      // Return graceful error response
      return {
        estimatedPrice: null,
        confidence: 'low',
        comparableCount: 0,
        error: errorMessage
      };
    }
  }
});

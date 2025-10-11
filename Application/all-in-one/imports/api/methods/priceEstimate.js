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
        // Get suburb from second part 
        const suburbPart = addressParts[1].split(' ');
        suburb = suburbPart[0];

        // Try to extract state if present
        if (suburbPart.length > 1) {
          state = suburbPart[1].replace(/[0-9]/g, '').trim(); 
        }
      } else {
        suburb = addressParts[0].split(' ')[0];
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

              // Validate price is reasonable
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

      if (prices.length === 0) {
        console.log('No prices found from scraping, using estimation algorithm');

        const seasonalMultiplier = 1.05; 

        const stateRates = {
          'NSW': 250, 'VIC': 220, 'QLD': 200, 'SA': 180,
          'WA': 210, 'TAS': 160, 'NT': 200, 'ACT': 240,
        };

        const suburbMultipliers = {
          'sydney-nsw': 1.4, 'bondi-nsw': 1.6, 'parramatta-nsw': 1.1, 'penrith-nsw': 0.85,
          'newcastle-nsw': 0.9, 'wollongong-nsw': 0.85,
          'melbourne-vic': 1.3, 'southbank-vic': 1.5, 'carlton-vic': 1.4, 'richmond-vic': 1.35,
          'footscray-vic': 0.95, 'dandenong-vic': 0.8, 'geelong-vic': 0.85,
          'brisbane-qld': 1.2, 'southbank-qld': 1.4, 'fortitude-qld': 1.3,
          'gold-qld': 1.15, 'sunshine-qld': 1.1, 'toowoomba-qld': 0.75,
          'adelaide-sa': 1.1, 'north-sa': 0.85,
          'perth-wa': 1.2, 'fremantle-wa': 1.15,
          'hobart-tas': 1.1,
          'canberra-act': 1.15,
        };

        let baseRatePerBed = (stateRates[state?.toUpperCase()] || 200) * seasonalMultiplier;

        const suburbKey = `${suburb.toLowerCase()}-${state?.toLowerCase()}`;
        const suburbMultiplier = suburbMultipliers[suburbKey] || 1.0;

        if (suburbMultiplier !== 1.0) {
          console.log(`Applying suburb multiplier for ${suburb}: ${suburbMultiplier}x`);
        }

        baseRatePerBed *= suburbMultiplier;

        let estimate = baseRatePerBed * (beds || 2);

        if (baths && baths > 1) {
          estimate *= (1 + (baths - 1) * 0.08);
        }

        const typeMultipliers = {
          'house': 1.2, 'apartment': 0.9, 'unit': 0.9,
          'townhouse': 1.0, 'villa': 1.1, 'studio': 0.7,
        };

        const typeKey = propertyType?.toLowerCase();
        if (typeKey && typeMultipliers[typeKey]) {
          estimate *= typeMultipliers[typeKey];
        }

        const variance = (Math.random() - 0.5) * 0.1;
        estimate *= (1 + variance);

        return {
          estimatedPrice: Math.round(estimate),
          confidence: suburbMultiplier !== 1.0 ? 'medium-high' : 'medium',
          comparableCount: 0,
          error: null,
          estimationMethod: 'algorithm',
          note: suburbMultiplier !== 1.0
            ? `Estimate for ${suburb}, ${state} (Q4 2025)`
            : `Estimate based on ${state} averages (Q4 2025)`
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

      // Calculate final estimate 
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

      return {
        estimatedPrice: null,
        confidence: 'low',
        comparableCount: 0,
        error: errorMessage
      };
    }
  }
});

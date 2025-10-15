import { Meteor } from 'meteor/meteor';
import { GoogleGenerativeAI } from '@google/generative-ai';

Meteor.methods({
  async 'property.estimatePrice'(address, beds, baths, propertyType) {
    // Validate inputs
    if (!address || beds === undefined) {
      throw new Meteor.Error('invalid-params', 'Address and beds are required');
    }

    try {
      // Extract suburb and state from address
      const addressParts = address.split(',').map(part => part.trim());

      let suburb = '';
      let state = '';

      if (addressParts.length >= 2) {
        const suburbPart = addressParts[1].split(' ');
        suburb = suburbPart[0];

        if (suburbPart.length > 1) {
          state = suburbPart[1].replace(/[0-9]/g, '').trim();
        }
      } else {
        suburb = addressParts[0].split(' ')[0];
      }

      console.log(`Estimating price for: ${suburb}${state ? ', ' + state : ''}, ${beds} beds, ${baths} baths, ${propertyType}`);

      // Try Gemini API first
      try {
        const apiKey = Meteor.settings.private?.geminiApiKey;

        if (!apiKey) {
          console.log('Gemini API key not found, using algorithm fallback');
          throw new Error('API key not configured');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Create detailed prompt with property context
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
        const currentYear = currentDate.getFullYear();

        const prompt = `You are a real estate pricing expert for the Australian rental market. Estimate the weekly rent (in AUD) for the following property:

Property Details:
- Location: ${suburb}${state ? ', ' + state : ''}, Australia
- Bedrooms: ${beds}
- Bathrooms: ${baths || 'Not specified'}
- Property Type: ${propertyType || 'Not specified'}
- Current Date: ${currentMonth} ${currentYear}

Consider:
- Current Australian rental market conditions for ${state || 'the area'}
- Seasonal factors (current month: ${currentMonth})
- Location characteristics and desirability of ${suburb}
- Property type and size
- Recent rental trends in the area

Provide ONLY a single number representing the estimated weekly rent in AUD. Do not include any explanation, currency symbols, or additional text - just the number.`;

        console.log('Calling Gemini API for price estimation...');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Extract numeric value from response
        const priceMatch = text.match(/(\d+)/);

        if (priceMatch) {
          const estimatedPrice = parseInt(priceMatch[1]);

          // Validate price is reasonable
          if (estimatedPrice >= 100 && estimatedPrice <= 5000) {
            console.log(`Gemini API returned estimate: $${estimatedPrice}/week`);

            return {
              estimatedPrice: Math.round(estimatedPrice),
              comparableCount: 0,
              error: null,
              estimationMethod: 'ai',
              note: `AI-powered estimate for ${suburb}${state ? ', ' + state : ''} (${currentMonth} ${currentYear})`
            };
          } else {
            console.log(`Gemini returned unrealistic price: ${estimatedPrice}, falling back to algorithm`);
            throw new Error('Unrealistic price from AI');
          }
        } else {
          console.log('Could not parse price from Gemini response, falling back to algorithm');
          throw new Error('Invalid AI response format');
        }

      } catch (geminiError) {
        console.log('Gemini API failed, using algorithm fallback:', geminiError.message);
      }

      // Algorithm fallback
      console.log('Using estimation algorithm');

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
        comparableCount: 0,
        error: null,
        estimationMethod: 'algorithm',
        note: suburbMultiplier !== 1.0
          ? `Algorithm-based estimate for ${suburb}, ${state} (Q4 2025)`
          : `Algorithm-based estimate using ${state} averages (Q4 2025)`
      };

    } catch (error) {
      console.error('Price estimation error:', error);

      return {
        estimatedPrice: null,
        comparableCount: 0,
        error: 'Unable to generate price estimate'
      };
    }
  }
});

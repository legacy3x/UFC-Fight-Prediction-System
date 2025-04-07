import UFCStatsScraper from './ufcStatsScraper';
import nock from 'nock';
import fs from 'fs';
import path from 'path';

describe('UFCStatsScraper', () => {
  let scraper: UFCStatsScraper;
  const testFighterName = 'Israel Adesanya';

  beforeAll(() => {
    // Setup mock responses
    const searchHtml = fs.readFileSync(
      path.join(__dirname, '__mocks__/ufcstats_search.html'), 
      'utf8'
    );
    const fighterHtml = fs.readFileSync(
      path.join(__dirname, '__mocks__/ufcstats_fighter.html'), 
      'utf8'
    );

    nock('http://ufcstats.com')
      .get('/statistics/fighters/search')
      .query({ query: testFighterName })
      .reply(200, searchHtml)
      .get('/fighter-details/12345')
      .reply(200, fighterHtml);
  });

  beforeEach(() => {
    scraper = new UFCStatsScraper();
    nock.cleanAll();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('scrapeFighter()', () => {
    it('should successfully scrape fighter data', async () => {
      const result = await scraper.scrapeFighter(testFighterName);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        name: 'Israel "The Last Stylebender" Adesanya',
        record: '24-3-0 (W-L-D)',
        height: '193 cm',
        reach: '203 cm',
        strikes: {
          landedPerMin: '4.60',
          accuracy: '50%'
        },
        grappling: {
          takedownAvg: '0.00',
          takedownDef: '78%'
        }
      });
      expect(result.source).toBe('ufcstats');
    });

    it('should handle fighter not found', async () => {
      nock('http://ufcstats.com')
        .get('/statistics/fighters/search')
        .query({ query: 'Unknown Fighter' })
        .reply(200, '<html><body><table></table></body></html>');

      const result = await scraper.scrapeFighter('Unknown Fighter');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Fighter not found');
    });

    it('should handle network errors', async () => {
      nock('http://ufcstats.com')
        .get('/statistics/fighters/search')
        .query({ query: testFighterName })
        .replyWithError('Network error');

      const result = await scraper.scrapeFighter(testFighterName);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });
});

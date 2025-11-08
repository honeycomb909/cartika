const request = require('supertest');
const express = require('express');
const productsRouter = require('../../routes/products');

// Mock database
jest.mock('../../database/db', () => ({
  query: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return products list', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: '99.99',
          stock_quantity: 10,
          images: ['/test.jpg'],
        },
      ];

      const db = require('../../database/db');
      db.query.mockResolvedValueOnce({
        rows: mockProducts.map(p => ({ ...p, total_count: 1 })),
      });

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });
});


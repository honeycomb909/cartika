import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/store/cartStore');
jest.mock('react-hot-toast');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    price: 99.99,
    compare_at_price: 149.99,
    images: ['/test-image.jpg'],
    stock_quantity: 10,
  };

  const mockAddItem = jest.fn();

  beforeEach(() => {
    (useCartStore as any).mockReturnValue({
      addItem: mockAddItem,
    });
    (toast.success as any) = jest.fn();
    (toast.error as any) = jest.fn();
  });

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹99.99')).toBeInTheDocument();
    expect(screen.getByText('₹149.99')).toBeInTheDocument();
  });

  it('adds item to cart when add to cart button is clicked', () => {
    render(<ProductCard product={mockProduct} />);
    
    const addToCartButton = screen.getByLabelText('Add to cart');
    fireEvent.click(addToCartButton);

    expect(mockAddItem).toHaveBeenCalledWith({
      id: mockProduct.id,
      name: mockProduct.name,
      slug: mockProduct.slug,
      price: mockProduct.price,
      image: '/test-image.jpg',
      stock_quantity: mockProduct.stock_quantity,
    });
  });

  it('shows out of stock message when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock_quantity: 0 };
    render(<ProductCard product={outOfStockProduct} />);
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});


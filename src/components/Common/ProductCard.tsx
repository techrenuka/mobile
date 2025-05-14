import React from 'react';

export interface Product {
  brand_name: string;
  model: string;
  price: number;
  rating?: number;
  processor_brand?: string;
  ram_capacity?: string | number;
  internal_memory?: string | number;
  screen_size?: string | number;
  has_5g?: boolean;
  has_nfc?: boolean;
  image_url?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg shadow-md p-4 my-2 w-full max-w-xs sm:max-w-sm md:max-w-md">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={`${product.brand_name} ${product.model}`}
          className="w-full h-40 object-contain rounded-md mb-3 bg-white p-2"
        />
      )}
      {!product.image_url && (
           <div className="w-full h-40 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-500 text-sm">
              Product Image Unavailable
           </div>
      )}

      <h5 className="text-base sm:text-lg font-semibold tracking-tight text-gray-900">
        {product.brand_name} {product.model}
      </h5>

      <div className="mt-2 mb-3">
        <span className="text-xl sm:text-2xl font-bold text-gray-900">${product.price}</span>
        {typeof product.rating === 'number' && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            Rating: {product.rating}/100
          </span>
        )}
      </div>

      <div className="text-xs sm:text-sm text-gray-700 space-y-1">
        {product.processor_brand && <p><strong>Processor:</strong> {product.processor_brand}</p>}
        {product.ram_capacity && <p><strong>RAM:</strong> {product.ram_capacity}{typeof product.ram_capacity === 'number' ? ' GB' : ''}</p>}
        {product.internal_memory && <p><strong>Storage:</strong> {product.internal_memory}{typeof product.internal_memory === 'number' ? ' GB' : ''}</p>}
        {product.screen_size && <p><strong>Screen:</strong> {product.screen_size}{typeof product.screen_size === 'number' ? ' inches' : ''}</p>}
        {typeof product.has_5g === 'boolean' && <p><strong>5G:</strong> {product.has_5g ? 'Yes' : 'No'}</p>}
        {typeof product.has_nfc === 'boolean' && <p><strong>NFC:</strong> {product.has_nfc ? 'Yes' : 'No'}</p>}
      </div>
    </div>
  );
};

export default ProductCard;
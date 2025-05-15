import React from 'react';
import Image from 'next/image';

export interface Product {
  brand_name: string;
  model?: string;
  title?: string;
  price: number;
  rating?: number;
  processor_brand?: string;
  ram_capacity?: string | number;
  internal_memory?: string | number;
  screen_size?: string | number;
  has_5g?: boolean;
  has_nfc?: boolean;
  imgs?: {
    thumbnails?: string[];
    previews?: string[];
  };
  image_url?: string;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  // Format price with commas for thousands
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  // Get the product name from either model or title property
  const productName = product.model || product.title || '';

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col w-full max-w-xs cursor-pointer"
      onClick={onClick}
    >
      {/* Product Image Section */}
      <div className="relative h-48 bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100">
        {product.imgs?.thumbnails?.[0] ? (
          <img
            src={product.imgs.thumbnails[0]}
            alt={`${product.brand_name} ${productName}`}
            className="max-h-full max-w-full object-contain"
          />
        ) : product.image_url ? (
          <img
            src={product.image_url}
            alt={`${product.brand_name} ${productName}`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-center p-4">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Product Image Unavailable</p>
          </div>
        )}
        
        {/* Brand Badge */}
        <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-80">
          {product.brand_name}
        </div>
        
        {/* 5G Badge if applicable */}
        {product.has_5g && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
            5G
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
            {productName}
          </h3>
          
          {/* Key Specs */}
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600">
            {product.processor_brand && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{product.processor_brand}</span>
              </div>
            )}
            
            {product.ram_capacity && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>{product.ram_capacity}{typeof product.ram_capacity === 'number' ? ' GB' : ''}</span>
              </div>
            )}
            
            {product.internal_memory && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <span>{product.internal_memory}{typeof product.internal_memory === 'number' ? ' GB' : ''}</span>
              </div>
            )}
            
            {product.screen_size && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{product.screen_size}{typeof product.screen_size === 'number' ? '"' : ''}</span>
              </div>
            )}
            
            {typeof product.has_nfc === 'boolean' && product.has_nfc && (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>NFC</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Price and Rating Footer */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">{formattedPrice}</span>
          </div>
          
          {typeof product.rating === 'number' && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-1">Rating:</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
import React, { useState } from 'react';
import { Search, Home, MapPin, Phone, Mail, Facebook, Instagram, Menu, X, ArrowRight } from 'lucide-react';
import { WavyBackground } from './components/ui/wavy-background';

function LandingPage({ onEnter }) {
  return (
    <WavyBackground 
      className="max-w-4xl mx-auto pb-40" 
      containerClassName="min-h-screen" 
      backgroundFill="#1e3a8a" 
      waveOpacity={0.3}
    >
       <div className="text-center px-4">
          <div className="mb-8 flex justify-center">
             <Home className="h-24 w-24 text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">Renthub</h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-2xl mx-auto">
            The best student accommodation platform for Bangkok University.
          </p>
          <button
            onClick={onEnter}
            className="group bg-white text-blue-900 px-8 py-4 rounded-full text-xl font-bold hover:bg-blue-50 transition-all duration-300 flex items-center mx-auto cursor-pointer"
          >
            Enter Site
            <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
       </div>
    </WavyBackground>
  );
}

function MainPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-blue-900">Renthub <span className="text-blue-600 text-sm font-normal">for BU</span></span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">Home</a>
              <a href="#listings" className="text-gray-600 hover:text-blue-600 transition">Listings</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition">About Us</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition">Contact</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Sign In
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-blue-600">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Home</a>
              <a href="#listings" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Listings</a>
              <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-blue-600">About Us</a>
              <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Contact</a>
              <button className="w-full text-left px-3 py-2 text-blue-600 font-medium">
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-blue-900 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Student Home
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The best condos and houses near Bangkok University.
            </p>
            
            {/* Search Box */}
            <div className="max-w-3xl mx-auto bg-white rounded-lg p-4 shadow-lg flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-gray-200 px-4 py-2">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Location (e.g. Rangsit, Rama 4)" 
                  className="w-full text-gray-900 focus:outline-none"
                />
              </div>
              <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-gray-200 px-4 py-2">
                <Home className="h-5 w-5 text-gray-400 mr-3" />
                <select className="w-full text-gray-900 focus:outline-none bg-transparent">
                  <option value="">Property Type</option>
                  <option value="condo">Condo</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                </select>
              </div>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition font-medium flex items-center justify-center">
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Properties Near BU</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Listing Card 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
            <div className="h-48 bg-gray-300 relative">
              <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80" alt="Condo" className="w-full h-full object-cover" />
              <span className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ฿12,000/mo
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Klong Luang, Pathum Thani</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Plum Condo Park Rangsit</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                Modern studio unit, fully furnished, 5 mins walk to BU. Includes pool and gym access.
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Studio • 1 Bath • 22 sqm</span>
                <button className="text-blue-600 font-medium hover:text-blue-800">Details</button>
              </div>
            </div>
          </div>

          {/* Listing Card 2 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
            <div className="h-48 bg-gray-300 relative">
              <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80" alt="Apartment" className="w-full h-full object-cover" />
              <span className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ฿8,500/mo
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Chiang Rak, Pathum Thani</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">The Kith Condo</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                Cozy 1-bedroom apartment. Quiet environment perfect for studying. Shuttle bus to campus.
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">1 Bed • 1 Bath • 28 sqm</span>
                <button className="text-blue-600 font-medium hover:text-blue-800">Details</button>
              </div>
            </div>
          </div>

          {/* Listing Card 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
            <div className="h-48 bg-gray-300 relative">
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80" alt="House" className="w-full h-full object-cover" />
              <span className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ฿15,000/mo
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Golf View, Pathum Thani</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dcondo Campus Resort</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                Luxury living with resort-style amenities. High security, close to food court and 7-11.
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">1 Bed • 1 Bath • 30 sqm</span>
                <button className="text-blue-600 font-medium hover:text-blue-800">Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Renthub?</h2>
            <p className="mt-4 text-gray-600">We make finding student accommodation easy and safe.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-gray-600">All listings are within easy commuting distance to Bangkok University.</p>
            </div>
            <div className="p-6">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Home className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
              <p className="text-gray-600">We verify every property to ensure you get exactly what you see.</p>
            </div>
            <div className="p-6">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Contact</h3>
              <p className="text-gray-600">Connect directly with landlords or agents. No hidden fees.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Home className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-xl font-bold">Renthub</span>
              </div>
              <p className="text-gray-400 text-sm">
                The #1 student housing platform for Bangkok University students.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#listings" className="hover:text-white">Search Listings</a></li>
                <li><a href="#" className="hover:text-white">Add Listing</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>support@renthub.bu</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>02-123-4567</span>
                </div>
                <div className="flex space-x-4 mt-4">
                  <a href="#" className="hover:text-white"><Facebook className="h-5 w-5" /></a>
                  <a href="#" className="hover:text-white"><Instagram className="h-5 w-5" /></a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 Renthub for BU. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <LandingPage onEnter={() => setEntered(true)} />;
  }

  return <MainPage />;
}

export default App;;

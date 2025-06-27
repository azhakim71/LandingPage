import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Star, 
  Truck, 
  Phone, 
  CheckCircle, 
  PiggyBank, 
  Target, 
  TrendingUp,
  Users,
  Award,
  Heart,
  Zap,
  ChevronDown
} from 'lucide-react';
import { districts, getThanasByDistrict, isDhakaDistrict } from '../data/bangladeshData';
import { getProducts, getDeliverySettings, validatePromoCode, calculateDiscount, saveOrder, generateId, calculateDeliveryCharge } from '../utils/storage';
import { steadfastAPI, createSteadfastOrderFromOrder } from '../utils/steadfast';
import { Order } from '../types';

const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    district: '',
    thana: '',
    address: '',
    quantity: 1,
    promoCode: ''
  });
  const [districtFilter, setDistrictFilter] = useState('');
  const [showThanas, setShowThanas] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [promoValid, setPromoValid] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const products = getProducts();
  const mainProduct = products[0];
  const deliverySettings = getDeliverySettings();

  const filteredDistricts = districts.filter(district =>
    district.name.toLowerCase().includes(districtFilter.toLowerCase()) ||
    district.nameEn.toLowerCase().includes(districtFilter.toLowerCase())
  );

  const availableThanas = formData.district ? getThanasByDistrict(formData.district) : [];
  const selectedDistrictName = districts.find(d => d.id === formData.district)?.name || '';
  const selectedThanaName = availableThanas.find(t => t.id === formData.thana)?.name || '';

  const basePrice = mainProduct?.price || 1200;
  const subtotal = basePrice * formData.quantity;
  const deliveryCharge = formData.district ? 
    calculateDeliveryCharge(formData.district, subtotal, isDhakaDistrict) : 0;
  const total = subtotal + deliveryCharge - discount;

  useEffect(() => {
    if (formData.promoCode) {
      const promo = validatePromoCode(formData.promoCode);
      if (promo) {
        const discountAmount = calculateDiscount(subtotal, promo);
        setDiscount(discountAmount);
        setPromoValid(true);
      } else {
        setDiscount(0);
        setPromoValid(false);
      }
    } else {
      setDiscount(0);
      setPromoValid(false);
    }
  }, [formData.promoCode, subtotal]);

  const handleDistrictSelect = (districtId: string) => {
    setFormData(prev => ({
      ...prev,
      district: districtId,
      thana: ''
    }));
    setDistrictFilter('');
    setShowThanas(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const order: Order = {
        id: generateId(),
        name: formData.name,
        mobile: formData.mobile,
        district: selectedDistrictName,
        thana: selectedThanaName,
        address: formData.address,
        product: mainProduct?.title || 'Smart Money Saving Box',
        quantity: formData.quantity,
        price: basePrice,
        discount: discount,
        total: total,
        promoCode: formData.promoCode || undefined,
        status: 'pending',
        createdAt: new Date(),
        landingPage: 'main'
      };

      // Save order locally first
      saveOrder(order);

      // Try to create Steadfast order if enabled
      if (deliverySettings.steadfastEnabled) {
        try {
          const steadfastOrder = createSteadfastOrderFromOrder(order);
          const response = await steadfastAPI.createOrder(steadfastOrder);
          
          if (response.status === 200) {
            // Update order with tracking information
            order.trackingCode = response.consignment.tracking_code;
            order.consignmentId = response.consignment.consignment_id.toString();
            
            // Update the saved order
            saveOrder(order);
          }
        } catch (error) {
          console.error('Steadfast order creation failed:', error);
          // Continue with local order even if Steadfast fails
        }
      }

      setOrderData(order);
      setShowOrderSummary(true);

      // Reset form
      setFormData({
        name: '',
        mobile: '',
        district: '',
        thana: '',
        address: '',
        quantity: 1,
        promoCode: ''
      });
    } catch (error) {
      console.error('Order submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showOrderSummary && orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 bounce-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">অর্ডার সফল!</h2>
            <p className="text-gray-600">আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">অর্ডার নং:</span>
              <span className="font-semibold">{orderData.id}</span>
            </div>
            {orderData.trackingCode && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ট্র্যাকিং কোড:</span>
                <span className="font-semibold text-blue-600">{orderData.trackingCode}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">নাম:</span>
              <span className="font-semibold">{orderData.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">মোবাইল:</span>
              <span className="font-semibold">{orderData.mobile}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">পরিমাণ:</span>
              <span className="font-semibold">{orderData.quantity}টি</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">মোট মূল্য:</span>
              <span className="font-semibold text-lg">৳{orderData.total}</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 text-center">
              <strong>গুরুত্বপূর্ণ:</strong> এই অর্ডার বিবরণীর একটি স্ক্রিনশট নিন এবং সংরক্ষণ করুন।
            </p>
          </div>

          <div className="space-y-3">
            <Link 
              to="/track-order" 
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold text-center block hover:bg-emerald-700 transition-colors"
            >
              অর্ডার ট্র্যাক করুন
            </Link>
            <button 
              onClick={() => setShowOrderSummary(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              নতুন অর্ডার করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-8 h-8" />
            <span className="text-xl font-bold">SmartBox</span>
          </div>
          <Link 
            to="/track-order" 
            className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            অর্ডার ট্র্যাক করুন
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                স্মার্ট মানি সেভিং বক্স
                <span className="block text-emerald-600">আপনার সঞ্চয়ের সাথী</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                ডিজিটাল কাউন্টার সহ অটোমেটিক মানি সেভিং বক্স। সহজেই টাকা জমা করুন এবং আপনার স্বপ্নের লক্ষ্য অর্জন করুন।
              </p>
              
              <div className="flex items-center space-x-8 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm text-gray-600">৫০০০+ সন্তুষ্ট গ্রাহক</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">৪.৮/৫ রেটিং</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">লক্ষ্য নির্ধারণ</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700">সঞ্চয় ট্র্যাকিং</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700">স্মার্ট ফিচার</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-700">সুন্দর ডিজাইন</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 hover-lift">
                <img 
                  src={mainProduct?.image || "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=500"} 
                  alt="Smart Money Saving Box" 
                  className="w-full h-80 object-cover rounded-2xl mb-6"
                />
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-3xl font-bold text-emerald-600">৳{basePrice}</span>
                    <span className="text-lg text-gray-500 line-through">৳{basePrice + 300}</span>
                  </div>
                  <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    ২৫% ছাড়! সীমিত সময়ের জন্য
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">কেন আমাদের স্মার্ট বক্স?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              আধুনিক প্রযুক্তি আর সুন্দর ডিজাইনের সমন্বয়ে তৈরি আপনার সঞ্চয়ের নিখুঁত সমাধান
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'লক্ষ্য নির্ধারণ',
                description: 'আপনার সঞ্চয়ের লক্ষ্য নির্ধারণ করুন এবং প্রতিদিন অগ্রগতি দেখুন',
                color: 'emerald'
              },
              {
                icon: TrendingUp,
                title: 'স্বয়ংক্রিয় গণনা',
                description: 'ডিজিটাল স্ক্রিন যা আপনার জমানো টাকার পরিমাণ স্বয়ংক্রিয়ভাবে গণনা করে',
                color: 'blue'
              },
              {
                icon: Shield,
                title: 'নিরাপত্তা',
                description: 'উন্নত লক সিস্টেম যা আপনার টাকা সম্পূর্ণ নিরাপদ রাখে',
                color: 'purple'
              },
              {
                icon: Zap,
                title: 'স্মার্ট ফিচার',
                description: 'LED ডিসপ্লে, সাউন্ড এফেক্ট এবং মোটিভেশনাল মেসেজ',
                color: 'orange'
              },
              {
                icon: Heart,
                title: 'সুন্দর ডিজাইন',
                description: 'আকর্ষণীয় ডিজাইন যা আপনার ঘরের সৌন্দর্য বৃদ্ধি করবে',
                color: 'pink'
              },
              {
                icon: Award,
                title: 'দীর্ঘস্থায়ী',
                description: 'উন্নত মানের উপাদান দিয়ে তৈরি, দীর্ঘদিন ব্যবহার করা যাবে',
                color: 'indigo'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover-lift fade-in">
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Form Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">অর্ডার করুন এখনই</h2>
                <p className="text-gray-600">মাত্র ২ মিনিটে আপনার অর্ডার সম্পন্ন করুন</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="আপনার পূর্ণ নাম লিখুন"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    জেলা নির্বাচন করুন *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedDistrictName || districtFilter}
                      onChange={(e) => setDistrictFilter(e.target.value)}
                      onFocus={() => setDistrictFilter('')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="জেলার নাম টাইপ করুন..."
                      required
                    />
                    {districtFilter && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {filteredDistricts.map(district => (
                          <div
                            key={district.id}
                            onClick={() => handleDistrictSelect(district.id)}
                            className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="font-medium">{district.name}</div>
                            <div className="text-sm text-gray-500">{district.nameEn}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {showThanas && availableThanas.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      থানা নির্বাচন করুন *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.thana}
                        onChange={(e) => setFormData(prev => ({ ...prev, thana: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                        required
                      >
                        <option value="">থানা নির্বাচন করুন</option>
                        {availableThanas.map(thana => (
                          <option key={thana.id} value={thana.id}>
                            {thana.name} ({thana.nameEn})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    বিস্তারিত ঠিকানা *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-24 resize-none"
                    placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পরিমাণ
                    </label>
                    <select
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num}টি</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      প্রমো কোড (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={formData.promoCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="প্রমো কোড"
                    />
                    {formData.promoCode && (
                      <div className={`mt-2 text-sm ${promoValid ? 'text-green-600' : 'text-red-600'}`}>
                        {promoValid ? '✓ প্রমো কোড সফল' : '✗ প্রমো কোড ভুল'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>পণ্যের দাম ({formData.quantity}টি):</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className={deliveryCharge === 0 ? 'text-green-600 font-semibold' : ''}>
                      {deliveryCharge === 0 ? 'ফ্রি' : `৳${deliveryCharge}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>ছাড়:</span>
                      <span>-৳{discount}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                    <span>মোট:</span>
                    <span>৳{total}</span>
                  </div>
                  
                  {deliverySettings.freeDeliveryEnabled && deliveryCharge === 0 && subtotal >= (deliverySettings.freeDeliveryMinAmount || 0) && (
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm text-center">
                      🎉 আপনি ফ্রি ডেলিভারি পেয়েছেন!
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner"></div>
                      <span>অর্ডার সম্পন্ন হচ্ছে...</span>
                    </div>
                  ) : (
                    'অর্ডার কনফার্ম করুন'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {deliverySettings.freeDeliveryEnabled ? 'ফ্রি ডেলিভারি' : 'হোম ডেলিভারি'}
              </h3>
              <p className="text-gray-600">
                {deliverySettings.freeDeliveryEnabled 
                  ? `৳${deliverySettings.freeDeliveryMinAmount || 0} এর উপরে অর্ডারে ফ্রি ডেলিভারি`
                  : 'সারা বাংলাদেশে হোম ডেলিভারি'
                }
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">১০০% গ্যারান্টি</h3>
              <p className="text-gray-600">১ বছরের রিপ্লেসমেন্ট গ্যারান্টি</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">২৪/৭ সাপোর্ট</h3>
              <p className="text-gray-600">যেকোনো সমস্যায় আমরা পাশে আছি</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <PiggyBank className="w-8 h-8" />
                <span className="text-xl font-bold">SmartBox</span>
              </div>
              <p className="text-gray-400">
                আপনার সঞ্চয়ের স্বপ্ন পূরণে আমরাই আপনার সবচেয়ে ভালো সঙ্গী।
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">যোগাযোগ</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 ০১৭০০-০০০০০০</p>
                <p>📧 info@smartbox.com</p>
                <p>📍 ঢাকা, বাংলাদেশ</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">গুরুত্বপূর্ণ লিংক</h4>
              <div className="space-y-2">
                <Link to="/track-order" className="block text-gray-400 hover:text-white">
                  অর্ডার ট্র্যাক করুন
                </Link>
                <a href="#terms" className="block text-gray-400 hover:text-white">
                  শর্তাবলী
                </a>
                <a href="#privacy" className="block text-gray-400 hover:text-white">
                  প্রাইভেসি পলিসি
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SmartBox. সকল অধিকার সংরক্ষিত।</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
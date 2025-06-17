# Henvid Backend Models Documentation

This document outlines all the backend models and their capabilities, especially focusing on dashboard analytics and data reporting.

## 📊 Overview

The backend now includes **9 comprehensive models** designed to support:
- **Complete business operations**
- **Advanced dashboard analytics** 
- **Revenue tracking and billing**
- **User engagement metrics**
- **Performance monitoring**

## 🎯 Models

### 1. **User Model** (`app/models/User.ts`) ✅ Enhanced
Enhanced to match frontend expectations and include analytics capabilities.

**Key Features:**
- Frontend compatibility (name/lastname virtuals)
- Authentication & security fields
- Analytics tracking (total calls, ratings, duration)
- User preferences and notifications
- Activity tracking

**Analytics Fields:**
```javascript
totalVideoCalls: Number
totalCallDuration: Number
averageRating: Number
reviewCount: Number
loginCount: Number
lastActivityAt: Date
```

### 2. **Company Model** (`app/models/Company.ts`) ✅ Enhanced
Comprehensive company management with built-in analytics aggregation.

**Key Features:**
- Complete business information
- Branding and customization
- Settings and configurations
- Built-in analytics aggregates
- Onboarding tracking

**Analytics Fields:**
```javascript
analytics: {
  totalCalls: Number
  totalDuration: Number
  averageCallDuration: Number
  averageRating: Number
  totalRevenue: Number
  successRate: Number
  responseTime: Number
}
```

### 3. **VideoCall Model** (`app/models/VideoCall.ts`) ✅ Enhanced
Advanced call tracking with comprehensive analytics data.

**Key Features:**
- Detailed call status tracking
- Technical performance metrics
- Quality assessment
- Problem resolution tracking
- Billing categorization

**Analytics Fields:**
```javascript
duration: Number
quality: String (excellent/good/fair/poor)
waitingTime: Number
responseTime: Number
reconnections: Number
screenshareUsed: Boolean
problemSolved: Boolean
connectionData: Object
```

### 4. **Payment Model** (`app/models/Payment.ts`) 🆕 New
Complete invoice and payment tracking system.

**Key Features:**
- Invoice generation and tracking
- Multiple payment methods
- Billing period management
- Tax and discount handling
- Payment history

**Dashboard Data:**
- Revenue analytics
- Payment status tracking
- Billing trends
- Invoice management

### 5. **Subscription Model** (`app/models/Subscription.ts`) 🆕 New
Advanced subscription management with MRR/ARR calculations.

**Key Features:**
- Plan management
- Billing cycle handling
- Addon subscriptions
- Automatic renewals
- Revenue calculations (MRR/ARR)

**Dashboard Data:**
- Monthly/Annual recurring revenue
- Subscription growth
- Churn tracking
- Plan distribution

### 6. **License Model** (`app/models/License.ts`) ✅ Enhanced
Comprehensive license management with usage tracking.

**Key Features:**
- License assignment tracking
- Usage monitoring
- Feature management
- Billing integration
- Assignment history

**Analytics Fields:**
```javascript
totalCalls: Number
totalDuration: Number
monthlyCallsUsed: Number
analytics: {
  averageCallDuration: Number
  successRate: Number
}
```

### 7. **Addon Model** (`app/models/Addon.ts`) 🆕 New
Feature addon management system.

**Key Features:**
- Feature categorization
- Pricing management
- Dependencies tracking
- Usage-based billing
- Analytics tracking

**Dashboard Data:**
- Addon adoption rates
- Revenue by addon
- Feature usage statistics

### 8. **Session Model** (`app/models/Session.ts`) 🆕 New
Advanced session management for security and analytics.

**Key Features:**
- Multi-device support
- Security tracking
- Geographic data
- Session analytics
- Automatic cleanup

**Dashboard Data:**
- User engagement metrics
- Device/browser analytics
- Security insights
- Session duration tracking

### 9. **Analytics Model** (`app/models/Analytics.ts`) 🆕 New
Dedicated analytics aggregation for dashboard data.

**Key Features:**
- Time-period aggregation (hourly/daily/weekly/monthly/yearly)
- Comprehensive metrics collection
- Growth rate calculations
- Pattern analysis
- Industry benchmarking

## 📈 Dashboard Analytics Capabilities

### Real-time Metrics
- **Call Analytics**: Total calls, success rates, duration trends
- **User Engagement**: Active users, session data, login patterns
- **Revenue Tracking**: MRR, ARR, payment status, growth rates
- **Customer Satisfaction**: Ratings, reviews, problem resolution
- **Technical Performance**: Connection quality, latency, failure rates

### Time-series Data
```javascript
// Available periods for analytics
['hourly', 'daily', 'weekly', 'monthly', 'yearly']

// Trend analysis
patterns: {
  hourlyDistribution: [Number], // 24 hours
  dailyDistribution: [Number],  // 7 days
  monthlyTrend: [Number]        // Variable length
}
```

### Growth Metrics
```javascript
growth: {
  callGrowthRate: Number,      // Percentage
  revenueGrowthRate: Number,
  userGrowthRate: Number,
  retentionRate: Number,
  expansionRevenue: Number
}
```

### Geographic Analytics
```javascript
geography: {
  topCountries: [{ country, calls, revenue }],
  topCities: [{ city, country, calls }]
}
```

## 🔗 API Endpoints

### New API Routes Created:
- `GET/POST/PUT /api/payments` - Payment management
- `GET/POST/PUT /api/subscriptions` - Subscription management  
- `GET/POST/PUT/DELETE /api/addons` - Addon management
- `GET/POST /api/analytics` - Analytics data aggregation

### Enhanced Existing Routes:
All existing routes (`/api/users`, `/api/companies`, `/api/videocalls`, `/api/licenses`, `/api/reviews`, `/api/comments`) now support the enhanced model fields.

## 🚀 Dashboard Implementation Ready

The models are designed to support comprehensive dashboards with:

### Executive Dashboard
- Revenue metrics (MRR, ARR, growth)
- User engagement overview
- Key performance indicators
- Trend analysis

### Operational Dashboard
- Call center metrics
- User activity monitoring
- System performance
- Problem resolution tracking

### Financial Dashboard
- Revenue breakdown
- Payment status
- Subscription analytics
- Billing forecasts

### Technical Dashboard
- Call quality metrics
- Connection analytics
- Performance monitoring
- Error tracking

## 🔧 Future Enhancements

The models are designed to easily support:
- **Machine Learning**: Predictive analytics, churn prediction
- **Advanced Reporting**: Custom report generation
- **API Analytics**: Usage tracking, rate limiting
- **Compliance**: GDPR, audit trails
- **Integrations**: Third-party analytics, CRM systems

## 💾 Database Optimization

All models include:
- **Strategic indexing** for fast dashboard queries
- **Aggregated data** to reduce computation
- **Time-series optimization** for analytics
- **Efficient relationships** between models
- **Data retention policies** for performance

This comprehensive model structure provides a solid foundation for both current operations and future dashboard requirements, supporting everything from real-time metrics to complex business intelligence needs. 
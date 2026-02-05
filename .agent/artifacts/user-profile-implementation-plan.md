# User Profile Page Implementation Plan

## Overview
Create a dedicated user profile page showing user details, adoption information, and account management options.

## Page Structure

### 1. **User Profile Header**
- Large circular avatar with user initials or profile picture
- User's full name
- User's email
- Member since date
- Account status badge (Active/Verified)

### 2. **Personal Information Section**
- Full Name
- Email Address
- Phone Number
- Address (optional)
- Edit Profile button

### 3. **Adoption Information Section**
- **Current Adoptions** - List of pets currently adopted
  - Pet name, image, adoption date
  - Link to Welfare Tracker for each pet
  - Days since adoption counter
- **Adoption History** - Past adoptions (if any)
- **Favorites/Saved** - Pets marked as favorites

### 4. **Account Settings Section**
- Password change option
- Email preferences/notifications
- Privacy settings
- Delete account option (with warning)

### 5. **Activity Summary**
- Total adoptions
- Total welfare check-ins completed
- Streak badges
- Community contributions (if applicable)

## Technical Implementation

### Route
- `/profile` or `/dashboard/profile`

### Data Sources
1. **From Auth Context**: `user.id`, `user.name`, `user.email`
2. **From Backend API**:
   - `GET /api/users/:id` - Full user profile
   - `GET /api/users/:id/adoptions` - User's adoptions
   - `GET /api/users/:id/stats` - Activity stats

### Components to Create
1. `profile-page.tsx` - Main profile page
2. `profile-header.tsx` - User header component
3. `adoption-card.tsx` - Individual adoption display
4. `profile-edit-modal.tsx` - Edit profile modal/form

### Backend Endpoints Needed
```javascript
GET /api/users/:id - Get user profile
PUT /api/users/:id - Update user profile
GET /api/users/:id/adoptions - Get user adoptions
GET /api/users/:id/stats - Get user statistics
```

## Design Notes
- Use existing PawMatch color palette
- Match Welfare Dashboard card style
- Responsive grid layout
- Smooth animations for interactions
- Consistent spacing with other pages

## Priority
1. Create basic profile page with header
2. Add adoption information section
3. Add statistics/activity summary
4. Implement edit profile functionality
5. Add account settings

## Backend Issue to Fix
- Port 5000 is already in use
- Need to either:
  - Kill the process using port 5000
  - Change PORT in .env to 5001 or similar
  - Use environment-specific ports

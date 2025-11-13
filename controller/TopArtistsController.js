const { sendGeneralResponse } = require("../utils/responseHelper");
const { Artist, Service } = require("../models/userModel");
const Favorite = require('../models/favoriteModel');

// Cache to store top artists data
let topArtistsCache = {
    allCities: {
        topArtists: [],
        lastFetch: null,
        currentHourlySelection: [],
        lastHourlyUpdate: null
    },
    byCities: {} // Will store data for each city
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const HOURLY_ROTATION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Function to get a random selection of 4 artists from an array of 10
const getRandomSelection = (artists, count = 4) => {
    if (artists.length <= count) return artists;
    
    const shuffled = [...artists].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Function to determine "top" artists (you can modify this logic based on your criteria)
const calculateTopArtists = (artists) => {
    // For now, we'll use a simple scoring system
    // You can enhance this with ratings, bookings count, etc.
    
    return artists
        .filter(artist => artist.Status === 'approved') // Only approved artists
        .sort((a, b) => {
            // Score based on multiple factors
            let scoreA = 0;
            let scoreB = 0;
            
            // Give points for having specialties
            scoreA += (a.specialties?.length || 0) * 10;
            scoreB += (b.specialties?.length || 0) * 10;
            
            // Give points for having profile image
            if (a.profile_img) scoreA += 20;
            if (b.profile_img) scoreB += 20;
            
            // Give points for having about section
            if (a.about) scoreA += 15;
            if (b.about) scoreB += 15;
            
            // Give points for recent activity (lastLoginAt)
            if (a.lastLoginAt) scoreA += 25;
            if (b.lastLoginAt) scoreB += 25;
            
            // Give points for creation time (newer gets more points)
            const daysSinceCreationA = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            const daysSinceCreationB = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysSinceCreationA < 30) scoreA += 30; // New artists get boost
            if (daysSinceCreationB < 30) scoreB += 30;
            
            return scoreB - scoreA;
        })
        .slice(0, 10); // Get top 10
};

// Function to fetch and cache top artists
const fetchAndCacheTopArtists = async (city = null) => {
    try {
        console.log(`Fetching top artists for city: ${city || 'all cities from cache'}`);
        
        let query = { role: 'artist' };
        if (city && city !== "Select City") {
            query.city = new RegExp(city, 'i'); // Case insensitive match
        }
        
        const artists = await Artist.find(query).select('-password -refreshToken');
        
        if (!artists || artists.length === 0) {
            return [];
        }
        
        // Get services for each artist
        const artistsWithServices = await Promise.all(artists.map(async (artist) => {
            const services = await Service.findOne({ userId: artist._id });
            return {
                ...artist._doc,
                services: services ? services.services : []
            };
        }));
        
        // Calculate top artists
        const topArtists = calculateTopArtists(artistsWithServices);
        
        return topArtists;
    } catch (error) {
        console.error('Error fetching top artists:', error);
        return [];
    }
};

// Function to get cached or fresh top artists data
const getTopArtistsData = async (city = null) => {
    const now = Date.now();
    const cacheKey = city || 'allCities';
    
    // Initialize cache for city if doesn't exist
    if (city && !topArtistsCache.byCities[city]) {
        topArtistsCache.byCities[city] = {
            topArtists: [],
            lastFetch: null,
            currentHourlySelection: [],
            lastHourlyUpdate: null
        };
    }
    
    const cache = city ? topArtistsCache.byCities[city] : topArtistsCache.allCities;
    
    // Check if we need to refresh the main cache (24 hours)
    if (!cache.lastFetch || (now - cache.lastFetch) > CACHE_DURATION) {
        console.log(`Refreshing top artists cache for ${cacheKey}`);
        cache.topArtists = await fetchAndCacheTopArtists(city);
        cache.lastFetch = now;
        
        // Reset hourly selection when main cache refreshes
        cache.currentHourlySelection = [];
        cache.lastHourlyUpdate = null;
    }
    
    // Check if we need to refresh the hourly selection (1 hour)
    if (!cache.lastHourlyUpdate || (now - cache.lastHourlyUpdate) > HOURLY_ROTATION_DURATION) {
        console.log(`Refreshing hourly selection for ${cacheKey}`);
        cache.currentHourlySelection = getRandomSelection(cache.topArtists, 4);
        cache.lastHourlyUpdate = now;
    }
    
    return cache.currentHourlySelection;
};

// Main API endpoint for top artists
const getTopArtists = async (req, res) => {
    const { customer_id, city } = req.query;
    
    try {
        console.log(`Getting top artists for city: ${city || 'all cities'}, customer: ${customer_id || 'none'}`);
        
        const topArtists = await getTopArtistsData(city);
        
        if (!topArtists || topArtists.length === 0) {
            return sendGeneralResponse(res, true, 'No top artists found', 200, []);
        }
        
        // Add favorite status if customer_id is provided
        let artistsWithFavorites = topArtists;
        if (customer_id) {
            const favoriteArtists = await Favorite.find({ 
                customer_id, 
                favorite_type: 'artist' 
            }).select('favorite_id');
            
            const favoriteArtistIds = favoriteArtists.map(fav => fav.favorite_id.toString());
            
            artistsWithFavorites = topArtists.map(artist => ({
                ...artist,
                is_favorite: favoriteArtistIds.includes(artist._id.toString())
            }));
        }
        
        return sendGeneralResponse(
            res, 
            true, 
            'Top artists retrieved successfully', 
            200, 
            artistsWithFavorites
        );
        
    } catch (error) {
        console.error('Error getting top artists:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

// Endpoint to manually refresh cache (for admin use)
const refreshTopArtistsCache = async (req, res) => {
    try {
        console.log('Manually refreshing top artists cache');
        
        // Clear all caches
        topArtistsCache.allCities = {
            topArtists: [],
            lastFetch: null,
            currentHourlySelection: [],
            lastHourlyUpdate: null
        };
        topArtistsCache.byCities = {};
        
        return sendGeneralResponse(res, true, 'Cache refreshed successfully', 200);
    } catch (error) {
        console.error('Error refreshing cache:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

// Endpoint to get cache status (for debugging)
const getCacheStatus = async (req, res) => {
    try {
        const now = Date.now();
        const status = {
            allCities: {
                topArtistsCount: topArtistsCache.allCities.topArtists.length,
                currentSelectionCount: topArtistsCache.allCities.currentHourlySelection.length,
                lastFetch: topArtistsCache.allCities.lastFetch,
                lastHourlyUpdate: topArtistsCache.allCities.lastHourlyUpdate,
                nextMainRefresh: topArtistsCache.allCities.lastFetch ? 
                    new Date(topArtistsCache.allCities.lastFetch + CACHE_DURATION) : null,
                nextHourlyRefresh: topArtistsCache.allCities.lastHourlyUpdate ? 
                    new Date(topArtistsCache.allCities.lastHourlyUpdate + HOURLY_ROTATION_DURATION) : null
            },
            cities: Object.keys(topArtistsCache.byCities).map(city => ({
                city,
                topArtistsCount: topArtistsCache.byCities[city].topArtists.length,
                currentSelectionCount: topArtistsCache.byCities[city].currentHourlySelection.length,
                lastFetch: topArtistsCache.byCities[city].lastFetch,
                lastHourlyUpdate: topArtistsCache.byCities[city].lastHourlyUpdate
            }))
        };
        
        return sendGeneralResponse(res, true, 'Cache status retrieved', 200, status);
    } catch (error) {
        console.error('Error getting cache status:', error);
        return sendGeneralResponse(res, false, 'Internal server error', 500);
    }
};

module.exports = {
    getTopArtists,
    refreshTopArtistsCache,
    getCacheStatus
}; 
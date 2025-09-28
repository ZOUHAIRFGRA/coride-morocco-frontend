import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuration for IP geolocation services
const IP_SERVICES = {
  // Primary service - IPGeolocation.io (includes VPN detection)
  IPGEOLOCATION: {
    url: "https://api.ipgeolocation.io/ipgeo",
    key: process.env.EXPO_PUBLIC_IPGEOLOCATION_API_KEY, // Add to .env
    features: ["vpn_detection", "proxy_detection", "tor_detection"],
  },

  // Secondary service - IPQualityScore (advanced fraud detection)
  IPQUALITYSCORE: {
    url: "https://ipqualityscore.com/api/json/ip",
    key: process.env.EXPO_PUBLIC_IPQUALITYSCORE_API_KEY, // Add to .env
    features: ["vpn", "proxy", "tor", "fraud_score"],
  },

  // Backup service - IPInfo.io
  IPINFO: {
    url: "https://ipinfo.io/json",
    key: process.env.EXPO_PUBLIC_IPINFO_API_KEY, // Add to .env
    features: ["basic_location"],
  },

  // Free backup - ipapi.co
  IPAPI: {
    url: "https://ipapi.co/json/",
    key: null, // Free tier
    features: ["basic_location"],
  },
};

// Cache key for storing IP data
const IP_CACHE_KEY = "@user_ip_location_data";
const IP_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface IPLocationData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;

  // Security flags
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isSuspicious: boolean;
  fraudScore: number;

  // Additional data
  asn: string;
  organization: string;
  connectionType: string;

  // Metadata
  provider: string;
  timestamp: number;
  confidence: number; // 0-100 confidence in the data
}

export interface IPDetectionResult {
  success: boolean;
  data?: IPLocationData;
  error?: string;
  warnings: string[];
  providers_used: string[];
}

/**
 * Comprehensive IP geolocation service with VPN/proxy detection
 * Uses multiple providers for cross-validation and accuracy
 */
export class IPLocationService {
  private static instance: IPLocationService;

  public static getInstance(): IPLocationService {
    if (!IPLocationService.instance) {
      IPLocationService.instance = new IPLocationService();
    }
    return IPLocationService.instance;
  }

  /**
   * Get comprehensive IP location data with VPN/proxy detection
   */
  async getIPLocationData(): Promise<IPDetectionResult> {
    const warnings: string[] = [];
    const providersUsed: string[] = [];

    try {
      // Check cache first
      const cachedData = await this.getCachedIPData();
      if (cachedData) {
        console.log("Using cached IP location data");
        return {
          success: true,
          data: cachedData,
          warnings: ["Using cached data"],
          providers_used: [cachedData.provider],
        };
      }

      // Try primary service with VPN detection
      let ipData = await this.getIPGeolocationData();
      if (ipData) {
        providersUsed.push("ipgeolocation.io");

        // Cross-validate with secondary service if VPN is detected
        if (ipData.isVPN || ipData.isProxy || ipData.isTor) {
          warnings.push("VPN/Proxy detected, cross-validating with secondary service");
          const secondaryData = await this.getIPQualityScoreData(ipData.ip);

          if (secondaryData) {
            providersUsed.push("ipqualityscore.com");
            // Merge data for better accuracy
            ipData = this.mergeIPData(ipData, secondaryData);
          }
        }
      } else {
        // Fallback to secondary service
        warnings.push("Primary service failed, using secondary service");
        ipData = await this.getIPQualityScoreData();
        if (ipData) {
          providersUsed.push("ipqualityscore.com");
        }
      }

      // If both premium services fail, use backup services
      if (!ipData) {
        warnings.push("Premium services failed, using backup services");
        ipData = await this.getBackupIPData();
        if (ipData) {
          providersUsed.push("backup_service");
        }
      }

      if (!ipData) {
        return {
          success: false,
          error: "All IP geolocation services failed",
          warnings,
          providers_used: providersUsed,
        };
      }

      // Cache the result
      await this.cacheIPData(ipData);

      return {
        success: true,
        data: ipData,
        warnings,
        providers_used: providersUsed,
      };
    } catch (error) {
      console.error("Error in IP location detection:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        warnings,
        providers_used: providersUsed,
      };
    }
  }

  /**
   * Primary service: IPGeolocation.io with VPN detection
   */
  private async getIPGeolocationData(): Promise<IPLocationData | null> {
    try {
      const apiKey = IP_SERVICES.IPGEOLOCATION.key;
      if (!apiKey) {
        console.warn("IPGeolocation.io API key not configured");
        return null;
      }

      const response = await fetch(`${IP_SERVICES.IPGEOLOCATION.url}?apiKey=${apiKey}&fields=geo,isp,security`);

      if (!response.ok) {
        throw new Error(`IPGeolocation.io API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        ip: data.ip,
        country: data.country_name,
        countryCode: data.country_code2,
        region: data.state_prov,
        city: data.city,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        timezone: data.time_zone?.name || "",
        isp: data.isp,

        // Security flags
        isVPN: data.security?.is_vpn || false,
        isProxy: data.security?.is_proxy || false,
        isTor: data.security?.is_tor || false,
        isSuspicious: data.security?.is_suspicious || false,
        fraudScore: data.security?.threat_score || 0,

        asn: data.asn?.number || "",
        organization: data.organization,
        connectionType: data.connection_type || "unknown",

        provider: "ipgeolocation.io",
        timestamp: Date.now(),
        confidence: 90, // High confidence for premium service
      };
    } catch (error) {
      console.error("IPGeolocation.io service error:", error);
      return null;
    }
  }

  /**
   * Secondary service: IPQualityScore with advanced fraud detection
   */
  private async getIPQualityScoreData(ip?: string): Promise<IPLocationData | null> {
    try {
      const apiKey = IP_SERVICES.IPQUALITYSCORE.key;
      if (!apiKey) {
        console.warn("IPQualityScore API key not configured");
        return null;
      }

      const targetIP = ip || ""; // If no IP provided, service will detect automatically
      const response = await fetch(`${IP_SERVICES.IPQUALITYSCORE.url}/${apiKey}/${targetIP}?strictness=2&fast=1`);

      if (!response.ok) {
        throw new Error(`IPQualityScore API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(`IPQualityScore API error: ${data.message}`);
      }

      return {
        ip: data.ip,
        country: data.country,
        countryCode: data.country_code,
        region: data.region,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        isp: data.ISP,

        // Security flags
        isVPN: data.vpn || false,
        isProxy: data.proxy || false,
        isTor: data.tor || false,
        isSuspicious: data.recent_abuse || data.bot_status || false,
        fraudScore: data.fraud_score || 0,

        asn: data.ASN?.toString() || "",
        organization: data.organization,
        connectionType: data.connection_type || "unknown",

        provider: "ipqualityscore.com",
        timestamp: Date.now(),
        confidence: 85, // High confidence for premium service
      };
    } catch (error) {
      console.error("IPQualityScore service error:", error);
      return null;
    }
  }

  /**
   * Backup services for basic IP location
   */
  private async getBackupIPData(): Promise<IPLocationData | null> {
    // Try IPInfo.io first
    try {
      const ipInfoKey = IP_SERVICES.IPINFO.key;
      const url = ipInfoKey ? `${IP_SERVICES.IPINFO.url}?token=${ipInfoKey}` : IP_SERVICES.IPINFO.url;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const [lat, lng] = (data.loc || "0,0").split(",");

        return {
          ip: data.ip,
          country: data.country,
          countryCode: data.country,
          region: data.region,
          city: data.city,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          timezone: data.timezone || "",
          isp: data.org || "",

          // No security detection in backup service
          isVPN: false,
          isProxy: false,
          isTor: false,
          isSuspicious: false,
          fraudScore: 0,

          asn: "",
          organization: data.org || "",
          connectionType: "unknown",

          provider: "ipinfo.io_backup",
          timestamp: Date.now(),
          confidence: 60, // Lower confidence for backup
        };
      }
    } catch (error) {
      console.error("IPInfo.io backup failed:", error);
    }

    // Try ipapi.co as final fallback
    try {
      const response = await fetch(IP_SERVICES.IPAPI.url);
      if (response.ok) {
        const data = await response.json();

        return {
          ip: data.ip,
          country: data.country_name,
          countryCode: data.country_code,
          region: data.region,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone || "",
          isp: data.org || "",

          // No security detection in free service
          isVPN: false,
          isProxy: false,
          isTor: false,
          isSuspicious: false,
          fraudScore: 0,

          asn: data.asn || "",
          organization: data.org || "",
          connectionType: "unknown",

          provider: "ipapi.co_free",
          timestamp: Date.now(),
          confidence: 40, // Lower confidence for free service
        };
      }
    } catch (error) {
      console.error("ipapi.co backup failed:", error);
    }

    return null;
  }

  /**
   * Merge data from multiple sources for better accuracy
   */
  private mergeIPData(primary: IPLocationData, secondary: IPLocationData): IPLocationData {
    return {
      ...primary,
      // Use the most conservative security flags (if either detects issue, flag it)
      isVPN: primary.isVPN || secondary.isVPN,
      isProxy: primary.isProxy || secondary.isProxy,
      isTor: primary.isTor || secondary.isTor,
      isSuspicious: primary.isSuspicious || secondary.isSuspicious,
      fraudScore: Math.max(primary.fraudScore, secondary.fraudScore),

      // Higher confidence when cross-validated
      confidence: Math.min(95, (primary.confidence + secondary.confidence) / 2 + 10),
      provider: `${primary.provider}+${secondary.provider}`,
    };
  }

  /**
   * Cache IP data to avoid repeated API calls
   */
  private async cacheIPData(data: IPLocationData): Promise<void> {
    try {
      await AsyncStorage.setItem(IP_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to cache IP data:", error);
    }
  }

  /**
   * Get cached IP data if still valid
   */
  private async getCachedIPData(): Promise<IPLocationData | null> {
    try {
      const cached = await AsyncStorage.getItem(IP_CACHE_KEY);
      if (!cached) return null;

      const data: IPLocationData = JSON.parse(cached);

      // Check if cache is still valid
      if (Date.now() - data.timestamp > IP_CACHE_DURATION) {
        await AsyncStorage.removeItem(IP_CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to get cached IP data:", error);
      return null;
    }
  }

  /**
   * Clear cached IP data (useful for testing or forced refresh)
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(IP_CACHE_KEY);
    } catch (error) {
      console.error("Failed to clear IP cache:", error);
    }
  }

  /**
   * Validate location against expected country
   * Returns compliance information for financial regulations
   */
  validateLocationCompliance(
    data: IPLocationData,
    allowedCountries: string[] = ["US", "USA", "United States"]
  ): {
    isCompliant: boolean;
    riskScore: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;

    // Check if country is allowed
    const isAllowedCountry = allowedCountries.some(
      (country) => data.countryCode === country || data.country === country || data.countryCode === country.slice(0, 2).toUpperCase()
    );

    if (!isAllowedCountry) {
      issues.push(`User location (${data.country}) not in allowed countries`);
      riskScore += 50;
    }

    // Security checks
    if (data.isVPN) {
      issues.push("VPN detected");
      riskScore += 30;
      recommendations.push("Require user to disable VPN for account verification");
    }

    if (data.isProxy) {
      issues.push("Proxy detected");
      riskScore += 25;
    }

    if (data.isTor) {
      issues.push("Tor network detected");
      riskScore += 40;
      recommendations.push("Tor usage may violate terms of service");
    }

    if (data.fraudScore > 70) {
      issues.push(`High fraud score: ${data.fraudScore}`);
      riskScore += data.fraudScore * 0.3;
    }

    if (data.confidence < 50) {
      issues.push("Low confidence in location data");
      riskScore += 15;
      recommendations.push("Consider requiring additional verification");
    }

    return {
      isCompliant: issues.length === 0 && riskScore < 30,
      riskScore: Math.min(100, riskScore),
      issues,
      recommendations,
    };
  }
}

// Export singleton instance
export const ipLocationService = IPLocationService.getInstance();

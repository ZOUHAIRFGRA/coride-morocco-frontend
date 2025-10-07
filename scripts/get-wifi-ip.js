const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getWiFiIPAddress() {
  try {
    // Run ipconfig command
    const ipconfigOutput = execSync('ipconfig', { encoding: 'utf8' });
    
    // Split output by adapter sections (look for adapter patterns)
    const lines = ipconfigOutput.split('\n');
    let currentSection = '';
    let inWiFiSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line starts a new adapter section
      if (line.includes('adapter ') && line.includes(':')) {
        inWiFiSection = line.includes('Wireless LAN adapter Wi-Fi:');
        currentSection = line;
        continue;
      }
      
      // If we're in the Wi-Fi section and find an IPv4 address
      if (inWiFiSection && line.includes('IPv4 Address')) {
        // Check if it's not disconnected by looking at the next few lines
        let isConnected = true;
        for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 5); j++) {
          if (lines[j].includes('Media disconnected')) {
            isConnected = false;
            break;
          }
        }
        
        if (isConnected) {
          const ipv4Match = line.match(/IPv4 Address[.\s]*:\s*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
          if (ipv4Match) {
            const ipAddress = ipv4Match[1];
            console.log(`Found Wi-Fi IP address: ${ipAddress} from "Wireless LAN adapter Wi-Fi"`);
            return ipAddress;
          }
        }
      }
    }
    
    console.warn('Wireless LAN adapter Wi-Fi with active connection not found');
    console.warn('Checking all adapters with "Wi-Fi" in name:');
    
    // Fallback: look for any Wi-Fi adapter that's connected
    let currentAdapter = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('adapter ') && line.includes(':')) {
        currentAdapter = line;
        continue;
      }
      
      if (currentAdapter.toLowerCase().includes('wi-fi') && line.includes('IPv4 Address')) {
        // Check if not disconnected
        let isConnected = true;
        for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 5); j++) {
          if (lines[j].includes('Media disconnected')) {
            isConnected = false;
            break;
          }
        }
        
        if (isConnected) {
          const ipv4Match = line.match(/IPv4 Address[.\s]*:\s*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
          if (ipv4Match) {
            const ipAddress = ipv4Match[1];
            console.log(`Found Wi-Fi IP address: ${ipAddress} from "${currentAdapter.trim()}"`);
            return ipAddress;
          }
        }
      }
    }
    
    return '192.168.1.2'; // fallback IP
  } catch (error) {
    console.error('Error getting Wi-Fi IP address:', error.message);
    return '192.168.1.2'; // fallback IP
  }
}

function updateEnvFile() {
  const ipAddress = getWiFiIPAddress();
  const envPath = path.join(__dirname, '..', '.env');
  
  let envContent = '';
  let existingVars = {};
  
  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Parse existing environment variables
      const lines = envContent.split('\n');
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            existingVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
      
      console.log(`Found ${Object.keys(existingVars).length} existing environment variables`);
    } catch (error) {
      console.warn('Error reading existing .env file:', error.message);
    }
  }
  
  // Update or add the WiFi IP and NGROK settings
  existingVars['EXPO_PUBLIC_WIFI_IP'] = ipAddress;
  if (!existingVars['EXPO_PUBLIC_USING_NGROK']) {
    existingVars['EXPO_PUBLIC_USING_NGROK'] = process.env.EXPO_PUBLIC_USING_NGROK || 'false';
  }
  
  // Rebuild the .env content, preserving comments and structure when possible
  let newEnvContent = '';
  
  // If there was existing content, try to preserve structure
  if (envContent) {
    const lines = envContent.split('\n');
    let updatedKeys = new Set();
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Keep comments and empty lines as-is
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        newEnvContent += line + '\n';
        continue;
      }
      
      // Check if this line contains a variable we want to update
      const [key] = trimmedLine.split('=');
      const cleanKey = key ? key.trim() : '';
      
      if (existingVars.hasOwnProperty(cleanKey)) {
        newEnvContent += `${cleanKey}=${existingVars[cleanKey]}\n`;
        updatedKeys.add(cleanKey);
      } else {
        // Keep other variables as-is
        newEnvContent += line + '\n';
      }
    }
    
    // Add any new variables that weren't in the original file
    Object.keys(existingVars).forEach(key => {
      if (!updatedKeys.has(key)) {
        newEnvContent += `${key}=${existingVars[key]}\n`;
      }
    });
  } else {
    // No existing file, create new one
    newEnvContent = `# Auto-generated environment variables
# WiFi IP address (auto-detected)
EXPO_PUBLIC_WIFI_IP=${ipAddress}
EXPO_PUBLIC_USING_NGROK=${existingVars['EXPO_PUBLIC_USING_NGROK']}
`;
  }
  
  // Write the updated content
  fs.writeFileSync(envPath, newEnvContent.trim() + '\n');
  
  console.log(`Updated .env file with IP: ${ipAddress}`);
  return ipAddress;
}

// If this script is run directly, update the .env file
if (require.main === module) {
  updateEnvFile();
}

module.exports = { getWiFiIPAddress, updateEnvFile };
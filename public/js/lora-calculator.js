// Advanced LoRa Calculator for Link Budget and Range Estimation
// Namespace: LoraCalculator

var LoraCalculator = (function() {
  'use strict';
  
  // Constants
  var EARTH_RADIUS_KM = 6371;
  var SPEED_OF_LIGHT_MPS = 299792458;
  
  // Free Space Path Loss calculation
  function calculateFSPL(frequencyMHz, distanceKm) {
    // FSPL (dB) = 20*log10(d) + 20*log10(f) + 32.45
    // where d is in kilometers and f is in MHz
    return 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMHz) + 32.45;
  }
  
  // Fresnel Zone calculation (first zone)
  function calculateFresnelZone(frequencyMHz, distanceKm) {
    // Radius (m) = sqrt((λ * d1 * d2) / (d1 + d2))
    // For point-to-point: d1 = d2 = distance/2
    var wavelengthM = SPEED_OF_LIGHT_MPS / (frequencyMHz * 1000000);
    var d1 = distanceKm * 1000 / 2; // meters
    return Math.sqrt((wavelengthM * d1 * d1) / (d1 + d1));
  }
  
  // Link Budget calculation
  function calculateLinkBudget(txPower, txAntennaGain, rxAntennaGain, rxSensitivity, fadeMargin) {
    // Link Budget = Tx Power + Tx Gain + Rx Gain - Rx Sensitivity - Fade Margin
    return txPower + txAntennaGain + rxAntennaGain - rxSensitivity - fadeMargin;
  }
  
  // Maximum Line-of-Sight Distance (ideal conditions)
  function calculateMaxDistance(frequencyMHz, txHeight, rxHeight) {
    // Radio horizon distance = 3.57 * (sqrt(txHeight) + sqrt(rxHeight))
    // where heights are in meters and result is in km
    var horizonKm = 3.57 * (Math.sqrt(txHeight) + Math.sqrt(rxHeight));
    
    // Adjust for frequency (higher frequencies have shorter range)
    var freqFactor = 1.0 - (frequencyMHz - 433) / 10000;
    return horizonKm * freqFactor;
  }
  
  // Urban range estimation (with obstacles)
  function estimateUrbanRange(maxLosDistance) {
    // Typically 20-40% of line-of-sight range in urban environments
    return maxLosDistance * 0.3;
  }
  
  // Terrain factor adjustment
  function getTerrainFactor(terrainType) {
    switch(terrainType) {
      case 'rural': return 1.0;      // Open rural area
      case 'suburban': return 0.7;   // Suburban with some buildings
      case 'urban': return 0.4;      // Dense urban environment
      case 'indoor': return 0.2;     // Indoor with walls/floors
      default: return 0.5;
    }
  }
  
  // Antenna height estimation based on locator grid size
  function estimateAntennaHeight(gridSquare) {
    // Simple estimation based on grid square precision
    var precision = gridSquare.length;
    switch(precision) {
      case 2: return 10000;  // Field level (~10km)
      case 4: return 2000;   // Square level (~2km)
      case 6: return 500;    // Subsquare level (~500m)
      default: return 1000;
    }
  }
  
  // Calculate received power level
  function calculateReceivedPower(txPower, txGain, rxGain, fspl) {
    return txPower + txGain + rxGain - fspl;
  }
  
  // Determine signal quality based on RSSI
  function getSignalQuality(rssi, sensitivity) {
    var margin = rssi - sensitivity;
    if (margin > 20) return {level: 'Excellent', color: 'green'};
    if (margin > 10) return {level: 'Good', color: 'blue'};
    if (margin > 5) return {level: 'Fair', color: 'yellow'};
    if (margin > 0) return {level: 'Poor', color: 'orange'};
    return {level: 'Unreliable', color: 'red'};
  }
  
  // Update calculator display
  function updateDisplay() {
    var txPower = parseFloat(document.getElementById('tx-power').value) || 17;
    var txAntennaGain = parseFloat(document.getElementById('tx-antenna').value) || 2.5;
    var rxAntennaGain = parseFloat(document.getElementById('rx-antenna').value) || 2.5;
    var rxSensitivity = parseFloat(document.getElementById('rx-sensitivity').value) || -120;
    var frequency = parseFloat(document.getElementById('frequency').value) || 433;
    var fadeMargin = parseFloat(document.getElementById('margin').value) || 10;
    
    // Get additional parameters if available
    var txHeight = parseFloat(document.getElementById('tx-height').value) || 10;
    var rxHeight = parseFloat(document.getElementById('rx-height').value) || 10;
    var distance = parseFloat(document.getElementById('link-distance').value) || 5;
    var terrain = document.getElementById('terrain-type') ? document.getElementById('terrain-type').value : 'urban';
    
    // Calculate values
    var fspl = calculateFSPL(frequency, distance);
    var receivedPower = calculateReceivedPower(txPower, txAntennaGain, rxAntennaGain, fspl);
    var linkBudget = calculateLinkBudget(txPower, txAntennaGain, rxAntennaGain, rxSensitivity, fadeMargin);
    var fresnelRadius = calculateFresnelZone(frequency, distance);
    var signalQuality = getSignalQuality(receivedPower, rxSensitivity);
    var terrainFactor = getTerrainFactor(terrain);
    
    // Estimate ranges
    var maxDistance = Math.pow(10, (linkBudget - 32.45 - 20*Math.log10(frequency)) / 20);
    var effectiveRange = maxDistance * terrainFactor;
    var urbanRange = estimateUrbanRange(maxDistance);
    
    // Update display elements
    document.getElementById('link-budget').textContent = linkBudget.toFixed(1) + ' dB';
    document.getElementById('max-distance').textContent = maxDistance.toFixed(1) + ' km';
    document.getElementById('effective-range').textContent = effectiveRange.toFixed(1) + ' km';
    document.getElementById('urban-range').textContent = urbanRange.toFixed(1) + ' km';
    
    // Update additional details if elements exist
    var rssiElement = document.getElementById('received-power');
    if (rssiElement) {
      rssiElement.textContent = receivedPower.toFixed(1) + ' dBm';
    }
    
    var fsplElement = document.getElementById('fspl-value');
    if (fsplElement) {
      fsplElement.textContent = fspl.toFixed(1) + ' dB';
    }
    
    var fresnelElement = document.getElementById('fresnel-value');
    if (fresnelElement) {
      fresnelElement.textContent = fresnelRadius.toFixed(1) + ' m';
    }
    
    var qualityElement = document.getElementById('signal-quality');
    if (qualityElement) {
      qualityElement.textContent = signalQuality.level;
      qualityElement.className = 'result-value ' + signalQuality.color;
    }
  }
  
  // Initialize calculator
  function init() {
    // Add event listeners to all input fields
    var inputs = document.querySelectorAll('.calculator-grid input, .calculator-grid select');
    inputs.forEach(function(input) {
      input.addEventListener('input', updateDisplay);
      input.addEventListener('change', updateDisplay);
    });
    
    // Add event listener to calculate button
    var calcButton = document.getElementById('calculate-btn');
    if (calcButton) {
      calcButton.addEventListener('click', updateDisplay);
    }
    
    // Perform initial calculation
    updateDisplay();
  }
  
  // Public API
  return {
    init: init,
    calculateFSPL: calculateFSPL,
    calculateFresnelZone: calculateFresnelZone,
    calculateLinkBudget: calculateLinkBudget,
    calculateMaxDistance: calculateMaxDistance,
    estimateUrbanRange: estimateUrbanRange,
    calculateReceivedPower: calculateReceivedPower,
    getSignalQuality: getSignalQuality
  };
})();
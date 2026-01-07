//Temp ondhu nimisha 
// const MINUTES = parseInt(process.env.PUBLIC_LINK_VALIDITY_MINUTES, 10) || 1;

// module.exports = {
//   DEFAULT_PUBLIC_LINK_VALIDITY_MINUTES: MINUTES,
//   DEFAULT_PUBLIC_LINK_VALIDITY_MS: MINUTES * 60 * 1000,
// };


// uncommnent below for days based expiry configuration
const DAYS = parseInt(process.env.PUBLIC_LINK_VALIDITY_DAYS, 10) || 7; 
module.exports = { 
DEFAULT_PUBLIC_LINK_VALIDITY_DAYS: DAYS, 
DEFAULT_PUBLIC_LINK_VALIDITY_MS: DAYS * 24 * 60 * 60 * 1000, 
};


/**
 * Validates and parses a Sri Lankan National Identity Card (NIC) number.
 * Supports both old (10-character) and new (12-character) formats.
 *
 * @param {string} nic - The NIC number to parse
 * @returns {object} Object containing validity, error (if any), format details, and extracted information (year, dayOfYear, gender)
 */
function parseNIC(nic) {
    if (!nic || typeof nic !== 'string') {
        return { valid: false, error: "Input must be a non-empty string" };
    }

    const cleanNic = nic.toUpperCase().replace(/\s/g, '');
    let year, dayOfYearRaw, gender, type;

    // Regular Expressions
    const oldNicRegex = /^[0-9]{9}[V|X]$/;
    const newNicRegex = /^[0-9]{12}$/;

    if (oldNicRegex.test(cleanNic)) {
        type = "OLD";
        // Old NIC: First 2 digits are year (19xx). Digits 3-5 are days.
        year = 1900 + parseInt(cleanNic.substring(0, 2), 10);
        dayOfYearRaw = parseInt(cleanNic.substring(2, 5), 10);
    } else if (newNicRegex.test(cleanNic)) {
        type = "NEW";
        // New NIC: First 4 digits are year. Digits 5-7 are days.
        year = parseInt(cleanNic.substring(0, 4), 10);
        dayOfYearRaw = parseInt(cleanNic.substring(4, 7), 10);
    } else {
        return { valid: false, error: "Format invalid. Must be 9 digits + V/X or 12 digits." };
    }

    // Gender Logic: Females have value + 500
    if (dayOfYearRaw > 500) {
        gender = "Female";
        dayOfYearRaw -= 500;
    } else {
        gender = "Male";
    }

    // Validate Day of Year Range
    // Technically 1-366 are valid day numbers.
    if (dayOfYearRaw < 1 || dayOfYearRaw > 366) {
        return { valid: false, error: "Invalid day of year encoded in NIC." };
    }

    // Leap Year Validation
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (!isLeap && dayOfYearRaw > 365) {
        return { valid: false, error: "Day 366 is invalid for a non-leap year." };
    }

    // Dummy/Sequence Check
    if (cleanNic.startsWith("123456789")) {
        return { valid: false, validFormat: false, error: "Invalid NIC sequence." };
    }

    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    let suspicious = false;
    let warning = null;

    // Future Year Check
    if (year > currentYear) {
        return { valid: false, validFormat: false, error: `Birth year ${year} is in the future.` };
    }

    // Suspicious Check: Age > 100
    if (age > 100) {
        suspicious = true;
        warning = `Age is ${age} years, which is unusually high.`;
    }

    return {
        valid: true,
        validFormat: true,
        suspicious: suspicious,
        nic: cleanNic,
        type,
        birthYear: year,
        dayOfYear: dayOfYearRaw, // The actual day (1-366)
        gender,
        isLeapYear: isLeap,
        reason: warning
    };
}

module.exports = parseNIC;

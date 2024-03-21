exports.getDateNow = () => {
    const now = Date.now();
        const userTimeZoneOffset = new Date().getTimezoneOffset();
        const offsetInMilliseconds = userTimeZoneOffset * 60 * 1000 * -1;
        const adjustedTime = now + offsetInMilliseconds;
        return new Date(adjustedTime);
  }
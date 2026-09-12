export const calculateAge = (dob) => {
  if (!dob) return '';
  const today = new Date();
  const birthDateObj = new Date(dob);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

export const calculatePaceAndSpeed = (distanceKm, durationMin) => {
  if (!distanceKm || !durationMin || distanceKm <= 0 || durationMin <= 0) {
    return { paceStr: '', speedStr: '' };
  }
  const decimalPace = durationMin / distanceKm;
  const pMins = Math.floor(decimalPace);
  const pSecs = Math.round((decimalPace - pMins) * 60);
  const paceStr = `${pMins}:${pSecs.toString().padStart(2, '0')}`;

  const speed = distanceKm / (durationMin / 60);
  const speedStr = speed.toFixed(1);

  return { paceStr, speedStr };
};

export const calculateTargetDateString = (dateSelect, customDate, eventSelect) => {
  const now = new Date();
  if (dateSelect === 'plus_1_month') {
    now.setMonth(now.getMonth() + 1);
    return now.toISOString().split('T')[0];
  } else if (dateSelect === 'plus_3_months') {
    now.setMonth(now.getMonth() + 3);
    return now.toISOString().split('T')[0];
  } else if (dateSelect === 'plus_6_months') {
    now.setMonth(now.getMonth() + 6);
    return now.toISOString().split('T')[0];
  } else if (dateSelect === 'custom_date') {
    return customDate;
  } else if (eventSelect === 'system_event') {
    return '2026-12-14'; // Mock system event date
  }
  return '';
};

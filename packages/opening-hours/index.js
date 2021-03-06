const { DateTime } = require('luxon');

const definitions = [
  {
    name: '24/7',
    value: '24/7',
    check: () => true,
  },
  {
    name: 'Business hours, Mon-Sun',
    value: '09:00-17:00',
    check: dt => dt.hour >= 9 && dt.hour <= 17,
  },
  {
    name: 'Business hours, Mon-Fri',
    value: 'Mo-Fr 09:00-17:00',
    check: dt =>
      dt.weekday >= 1 && dt.weekday <= 5 && (dt.hour >= 9 && dt.hour <= 17),
  },
  {
    name: 'Evening only',
    value: '17:00-00:00',
    check: dt => dt.hour >= 17 && dt.hour <= 23,
  },
  {
    name: 'Daylight hours only',
    value: '09:00-18:00',
    check: dt => dt.hour >= 9 && dt.hour <= 18,
  },
];

function isOpen(openingHours, dt = DateTime.local()) {
  let def = definitions.find(d => d.value === openingHours);
  if (!def) {
    return null;
  }
  return def.check(dt);
}

module.exports = {
  definitions,
  isOpen,
};

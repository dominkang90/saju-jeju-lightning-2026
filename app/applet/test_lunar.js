const { Lunar } = require('lunar-javascript');
try {
  const lunar = Lunar.fromYmdHms(1990, 5, 15, 12, 0, 0);
  console.log(lunar.getEightChar().getYear());
} catch (e) {
  console.error(e);
}

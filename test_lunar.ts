import { Lunar } from 'lunar-javascript';
try {
  const lunar = Lunar.fromYmdHms(NaN, NaN, NaN, 0, 0, 0);
  console.log(lunar.getEightChar().getYear());
} catch (e) {
  console.error(e);
}

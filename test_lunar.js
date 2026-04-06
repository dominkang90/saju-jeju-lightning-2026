const { Solar, Lunar } = require('lunar-javascript');
const solar = Solar.fromYmdHms(1990, 5, 15, 14, 30, 0);
const lunar = solar.getLunar();
const baZi = lunar.getEightChar();
console.log(Object.keys(baZi));
try {
    console.log(baZi.getDaYun(1));
} catch (e) {
    console.log(e.message);
}
try {
    console.log(baZi.getYun(1).getStartAge());
} catch (e) {
    console.log(e.message);
}

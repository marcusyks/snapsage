import { Asset } from "expo-media-library";

/**
 * Functions to perform time conversions
*/

/**
 * Create a MonthList object based on given UNIX timestamp
 * @param time UNIX timestamp in milliseconds
 * @returns MonthList that represents UNIX timestamp in month and year, containing an array of related images
 */
const convertTimeToMonthYear = (time: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(time);

    const year = date.getUTCFullYear();
    const month = months[date.getUTCMonth()];


    const monthList: MonthList = {month: month, year: year, assets: []};
    return monthList;
}

/**
 * Create a YearList object based on given UNIX timestamp
 * @param time UNIX timestamp in milliseconds
 * @returns YearList that represents UNIX timestamp in year, containing an array of related images
 */
const convertTimeToYear = (time: number) => {
    const date = new Date(time);

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;

    const yearList: YearList = {year: year, assets: []};
    return yearList;
}

/**
 * Groups all images into their respective months and years
 * @param assets - Array of images
 * @returns Array of MonthList object that contains all images grouped by month and year
 */
export const getAllMonths = ({ assets }: { assets: Asset[] }) => {
    let months: MonthList[] = [];

    assets.forEach(asset => {
      const monthAndYear: MonthList = convertTimeToMonthYear(asset.creationTime);

      let existingMonth = months.find(
        (m) => m.month === monthAndYear.month && m.year === monthAndYear.year
      );

      if (existingMonth) {
        existingMonth.assets.push(asset);
      } else {
        monthAndYear.assets.push(asset);
        months.push(monthAndYear);
      }
    });

    return months;
};

/**
 * Groups all images into their respective years
 * @param assets - Array of images
 * @returns Array of YearList object that contains all images grouped by year
 */
export const getAllYears = ({assets} : {assets: Asset[]}) => {
    let years: YearList[] = [];

    assets.forEach(asset => {
      const year: YearList = convertTimeToYear(asset.creationTime);

      let existingYear = years.find(
        (y) => y.year === year.year
      );

      if (existingYear) {
        existingYear.assets.push(asset);
      } else {
        year.assets.push(asset);
        years.push(year);
      }
    });

    return years;
}
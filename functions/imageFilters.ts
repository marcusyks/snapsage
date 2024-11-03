import { Asset } from "expo-media-library";

const convertTimeToMonthYear = (time: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(time);

    const year = date.getUTCFullYear();
    const month = months[date.getUTCMonth()];


    const monthList: MonthList = {month: month, year: year, assets: []};
    return monthList;
}

const convertTimeToYear = (time: number) => {
    const date = new Date(time);

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;

    const yearList: YearList = {year: year, assets: []};
    return yearList;
}

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
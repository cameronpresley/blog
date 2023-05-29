type Month = 'January' | 'February'| 'March' | 'April' | 'May'
            | 'June' | 'July' | 'August' | 'September' 
            | 'October' | 'November' | 'December'
function getDaysInMonth(month:Month): number {
  if (month == 'April' || month == 'June' || month == 'September' || month == 'November') {
    return 30;
  }
  if (month == 'February') {
    const year = new Date().getFullYear();
    return isLeap(year) ? 29 : 28;
  }
  return 31;
}

function isLeap(year:number): boolean {
  if (year % 4 == 0 && year % 100 != 0) {
    return true;
  }
  return (year % 400 == 0)
}
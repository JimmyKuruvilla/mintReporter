import { InvalidDateError } from '../errors/invalidDateError';

export const isValidDate = (maybeDate: any) => maybeDate instanceof Date && !Number.isNaN(maybeDate.valueOf())

/**
 * Turns '2025-12-01' into a server local Date at time given as 'hh:mm:ss:ms'
 * Defaults to midnight for time
 */
export const getLocalDate = (yyyymmdd: string, time: string = '00:00:00:00') => {
  const [hours, min, secs, ms] = time.split(':').map(Number)
  const [y, m, d] = yyyymmdd.split('-').map(Number)
  const localDate = new Date(y, m - 1, d);
  localDate.setHours(hours, min, secs, ms)
  return localDate
}

/**
 * Returns the start of startDate(midnight) to the end of endDate (midnight at endDate+1day)
 */
export const getDateRange = (_startDate: string, _endDate: string) => {
  const startDate = getLocalDate(_startDate)
  const endDate = getLocalDate(_endDate)
  endDate.setDate(endDate.getDate() + 1)

  if (!(isValidDate(startDate) && isValidDate(endDate))) {
    throw new InvalidDateError(_startDate, _endDate)
  } else {
    return { startDate, endDate }
  }
}

/*
 * Converts '02/18/2026' (csv date) to '2026-02-18'
*/
export const convertSlashToDashDate = (slashDate: string) => {
  const [mm, dd, yyyy] = slashDate.split('/')
  return `${yyyy}-${mm}-${dd}`
}
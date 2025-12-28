import dayjs from 'dayjs'
import { END_DATE, START_DATE } from '../../../server/constants'

export const getStartAndEndDates = () => {
  return {
    startDate: localStorage.getItem(START_DATE),
    endDate: localStorage.getItem(END_DATE)
  }
}

export const getStartAndEndDatesWithMonthFallback = () => {
  const { startDate: _startDate, endDate: _endDate } = getStartAndEndDates()
  
  const startDate = _startDate
    ? dayjs(_startDate)
    : dayjs(new Date()).startOf('month')

  const endDate = _endDate
    ? dayjs(_endDate)
    : dayjs(new Date()).endOf('month')

  return { startDate, endDate }
}

export const saveStartDate = (startDate: string) => {
  localStorage.setItem(START_DATE, startDate)
}

export const saveEndDate = (endDate: string) => {
  localStorage.setItem(END_DATE, endDate)
}
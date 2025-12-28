export class InvalidDateError extends Error {
  constructor(...dates: any[]){
    super(`INVALID_DATES: ${dates.join(',')}`)
  }
}
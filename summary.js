// Keys cannot overlap, otherwise rewrites will not work correctly
const IGNORE = 'IGNORE';
const categorySummary =
{
  "Amusement,Entertainment,Books,Games,Movies & DVDs,Alcohol & Bars,Hobbies": {
    value: 0,
    umbrellaCategory: "Amusements",
  },
  "Gas & Fuel,Service & Parts,Car Wash,Parking": {
    value: 0,
    umbrellaCategory: "Auto & Transport",
  },
  "Books": {
    value: 0,
    umbrellaCategory: "Books",
  },
  "Charity": {
    value: 0,
    umbrellaCategory: "Charity",
  },
  "Check": {
    value: 0,
    umbrellaCategory: "Check",
  },
  "Clothing": {
    value: 0,
    umbrellaCategory: "Clothing",
  },
  "Fast Food,Restaurants,Food & Dining,Coffee Shops": {
    value: 0,
    umbrellaCategory: "Eating Out",
  },
  "Emergency": {
    value: 0,
    umbrellaCategory: "Emergency",
  },
  "Bank Fee": {
    value: 0,
    umbrellaCategory: "Fees",
  },
  "Gift,Gifts & Donations": {
    value: 0,
    umbrellaCategory: "Gift",
  },
  "Lawn & Garden,Furnishings,Home Services": {
    value: 0,
    umbrellaCategory: "Home Improvement",
  },
  "Education,Kid Activities,Kids Activities,Books & Supplies": {
    value: 0,
    umbrellaCategory: "Kid",
  },
  "Lawyer Fees": {
    value: 0,
    umbrellaCategory: "Lawyer Fees",
  },
  "Doctor,Dentist,Pharmacy,Eyecare,Medical Reimbursement,Health Equipment": {
    value: 0,
    umbrellaCategory: "Medical",
  },
  "Meta Canada": {
    value: 0,
    umbrellaCategory: "Meta Canada",
  },
  "Groceries": {
    value: 0,
    umbrellaCategory: "Meta Food",
  },
  "Cash & ATM,ATM Fee,Business Services,Printing,Shipping,Fees & Charges,Late Fee,Service Fee": {
    value: 0,
    umbrellaCategory: "Misc",
  },
  "Mortgage & Rent": {
    value: 0,
    umbrellaCategory: "Mortgage & Rent",
  },
  "Hair,Spa & Massage,Health & Fitness": {
    value: 0,
    umbrellaCategory: "Personal Care",
  },
  "Vet,Veterinary,Boarding,Pet Food & Supplies,Pet Grooming": {
    value: 0,
    umbrellaCategory: "Pet",
  },
  "Amazon Purchases,Electronics & Software": {
    value: 0,
    umbrellaCategory: "Shopping",
  },
  "Intuit,Meta Insurance,Mobile Phone,Taxes": {
    value: 0,
    umbrellaCategory: "Utilities",
  },
  "Vacation, Breckenridge 2022": {
    value: 0,
    umbrellaCategory: "Vacation",
  },
  "Work,Transfer": {
    value: 0,
    umbrellaCategory: "IGNORE",
  }
}

module.exports = {
  categorySummary,
  umbrellaCategories: Object.values(categorySummary).map(value => value.umbrellaCategory.toLowerCase()),
  namespaces: Object
    .entries(categorySummary)
    .map(([namespaceStr, value]) =>
      ([namespaceStr.toLowerCase().split(',').map(category => category.trim()), value])),
  umbrellasToZeroTotalMap: Object.values(categorySummary).reduce((acc, next) =>
    ({ ...acc, ...(next.umbrellaCategory === IGNORE ? {} : { [next.umbrellaCategory]: 0 }) }), {}),
}

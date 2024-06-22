export interface TaxDocumentW2 {
    year: number
    companyName: string
    employeeName: string
    taxableIncome: number
}

export interface TaxDocument1099Int {
    year: number
    accountName: string
    interest: number
}

export interface TaxDocument1099R {
    year: number
    accountName: string
    taxableIncome: number
    isEarlyDistribution: boolean
}
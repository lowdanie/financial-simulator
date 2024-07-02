export interface TaxDocumentW2 {
	year: number;
	companyId: number;
	employeeId: number;
	taxableIncome: number;
}

export interface TaxDocument1099Int {
	year: number;
	interest: number;
}

export interface TaxDocument1099R {
	year: number;
	taxableIncome: number;
	isEarlyDistribution: boolean;
}

export interface TaxDocument1099B {
	year: number;
	costBasis: number;
	proceeds: number;
}

export interface TaxDocument1098 {
	year: number;
	mortgageInterestPayed: number;
	propertyTax: number;
}

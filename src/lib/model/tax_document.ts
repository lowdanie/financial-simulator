export interface TaxDocumentW2 {
	year: number;
	companyName: string;
	employeeName: string;
	taxableIncome: number;
}

export interface TaxDocument1099Int {
	year: number;
	accountName: string;
	interest: number;
}

export interface TaxDocument1099R {
	year: number;
	accountName: string;
	taxableIncome: number;
	isEarlyDistribution: boolean;
}

export interface TaxDocument1099B {
	year: number;
	accountName: string;
	costBasis: number;
	proceeds: number;
}

export interface TaxDocument1098 {
	year: number;
	mortgageInterestPayed: number;
	propertyTax: number;
}

import { ModelState, type ModelParameters, type MonthSummary } from './model';

export interface Forecast {
	monthSummaries: MonthSummary[];
}

export function simulate(modelParams: ModelParameters): Forecast {
	console.log('Simulating:');
	console.log(JSON.stringify(modelParams));

	let state = new ModelState(modelParams);
	let forecast: Forecast = {
		monthSummaries: [state.getMonthSummary()]
	};

	for (let i = 0; i < 12 * modelParams.durationYears; i++) {
		state.executeMonth();
		forecast.monthSummaries.push(state.getMonthSummary());

		if (state.isBankrupt) {
			console.log('BANKRUPT');
			break;
		}
	}

	return forecast;
}

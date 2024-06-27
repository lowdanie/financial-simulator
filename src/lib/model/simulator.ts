import { ModelState, type ModelParameters } from './model';

export interface DateValue {
	date: Date;
	value: number;
}

export interface Forecast {
	netWorth: DateValue[];
}

function getNetWorth(model: ModelState): DateValue {
	return {
		date: new Date(model.currentDate),
		value: model.getNetWorth()
	};
}
export function simulate(modelParams: ModelParameters): Forecast {
	console.log('Simulating:');
	console.log(JSON.stringify(modelParams));

	let state = new ModelState(modelParams);
	let forecast: Forecast = {
		netWorth: [getNetWorth(state)]
	};

	for (let i = 0; i < 12 * modelParams.durationYears; i++) {
		state.executeMonth();
		forecast.netWorth.push(getNetWorth(state));

		if (state.isBankrupt) {
			console.log('BANKRUPT');
			break;
		}
	}

	return forecast;
}

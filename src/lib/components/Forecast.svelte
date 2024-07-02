<script lang="ts">
	import Chart, { type ChartDataset, type Point } from 'chart.js/auto';

	import { Separator } from '$lib/components/ui/separator/index.js';

	import type { ModelParameters, MonthSummary } from '$lib/model/model';
	import { type Forecast, simulate } from '$lib/model/simulator';

	export let modelParams: ModelParameters;
	$: forecast = simulate(modelParams);

	type Dataset = ChartDataset<'line', number[]>;

	const PRIMARY_LINE_COLOR = '#0f182a';
	const SECONDARY_LINE_COLORS = ['#3ec2fa', '#00d0ea', '#00d8bd', '#58da7e', '#b0d33d', '#ffc014'];

	function getLabel(monthSummary: MonthSummary): string {
		return `${monthSummary.date.getMonth() + 1}/${monthSummary.date.getFullYear()}`;
	}

	function buildLabels(forecast: Forecast): string[] {
		return forecast.monthSummaries.map(getLabel);
	}

	function buildDatasets(forecast: Forecast): Dataset[] {
		if (forecast.monthSummaries.length == 0) {
			return [];
		}
		let colorIdx = 0;

		let netWorthDataset: Dataset = {
			label: 'Net Worth',
			data: [],
			borderColor: PRIMARY_LINE_COLOR,
			backgroundColor: PRIMARY_LINE_COLOR
		};
		let savingsDataset: Dataset = {
			label: forecast.monthSummaries[0].savingsValue.name,
			data: [],
			borderWidth: 1,
			borderColor: SECONDARY_LINE_COLORS[colorIdx],
			backgroundColor: SECONDARY_LINE_COLORS[colorIdx]
		};
		colorIdx = (colorIdx + 1) % SECONDARY_LINE_COLORS.length;

		let brokerageDataset: Dataset = {
			label: forecast.monthSummaries[0].brokerageValue.name,
			data: [],
			borderWidth: 1,
			borderColor: SECONDARY_LINE_COLORS[colorIdx],
			backgroundColor: SECONDARY_LINE_COLORS[colorIdx]
		};
		colorIdx = (colorIdx + 1) % SECONDARY_LINE_COLORS.length;

		let homeDatasets: Dataset[] = [];
		for (let asset of forecast.monthSummaries[0].homeEquities) {
			homeDatasets.push({
				label: `${asset.name} Equity`,
				data: [],
				borderWidth: 1,
				borderColor: SECONDARY_LINE_COLORS[colorIdx],
				backgroundColor: SECONDARY_LINE_COLORS[colorIdx]
			});
			colorIdx = (colorIdx + 1) % SECONDARY_LINE_COLORS.length;
		}

		for (let monthSummary of forecast.monthSummaries) {
			netWorthDataset.data.push(monthSummary.netWorth);
			savingsDataset.data.push(monthSummary.savingsValue.value);
			brokerageDataset.data.push(monthSummary.brokerageValue.value);
			for (let i = 0; i < monthSummary.homeEquities.length; i++) {
				homeDatasets[i].data.push(monthSummary.homeEquities[i].value);
			}
		}

		return [netWorthDataset, savingsDataset, brokerageDataset].concat(homeDatasets);
	}

	function makeChart(ctx: HTMLCanvasElement, forecast: Forecast) {
		const chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: buildLabels(forecast),
				datasets: buildDatasets(forecast)
			},
			options: {
				elements: {
					point: {
						pointStyle: false
					}
				},
				plugins: {
					legend: {
						display: true
					}
				}
			}
		});
		return {
			update(forecast: Forecast) {
				chart.data.labels = buildLabels(forecast);
				chart.data.datasets = buildDatasets(forecast);
				chart.update();
			},
			destroy() {
				chart.destroy();
			}
		};
	}
</script>

<div class="flex-grow">
	<div class="flex flex-col">
		<div>
			<h2 class="text-2xl">Forecast</h2>
			<p class="text-muted-foreground">Net worth over time</p>
		</div>

		<Separator class="mb-5" />

		<canvas use:makeChart={forecast} class="w-full" />
	</div>
</div>
